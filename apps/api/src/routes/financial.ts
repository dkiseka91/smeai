import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { calculateFinancialModel } from '../services/financialService';
import { FinancialModelInputsSchema } from '@sme-pitch-ai/shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toJson = (v: unknown): Prisma.InputJsonValue => v as any;

const router = Router();
router.use(authMiddleware);

router.post('/calculate', async (req, res, next) => {
  try {
    const inputs = FinancialModelInputsSchema.parse(req.body);
    const outputs = calculateFinancialModel(inputs);
    res.json(outputs);
  } catch (err) { next(err); }
});

router.post('/:id/save', async (req, res, next) => {
  try {
    const { inputs, outputs, profileId } = req.body as { inputs: unknown; outputs: unknown; profileId?: string };
    const targetProfileId = profileId ?? (req.body as { profileId: string }).profileId;

    const profile = await prisma.businessProfile.findFirst({
      where: { id: targetProfileId, workspaceId: req.workspaceId!, deletedAt: null },
    });
    if (!profile) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }); return; }

    const model = await prisma.financialModel.upsert({
      where: { id: req.params['id'] as string },
      update: { revenueInputs: toJson(inputs), outputs: toJson(outputs) },
      create: {
        id: req.params['id'] as string,
        profileId: profile.id,
        currency: (inputs as { currency?: string }).currency ?? 'USD',
        revenueInputs: toJson(inputs),
        costInputs: {},
        outputs: toJson(outputs),
      },
    });
    res.json(model);
  } catch (err) { next(err); }
});

router.get('/:profileId', async (req, res, next) => {
  try {
    const profile = await prisma.businessProfile.findFirst({
      where: { id: req.params['profileId'] as string, workspaceId: req.workspaceId!, deletedAt: null },
    });
    if (!profile) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }); return; }
    const model = await prisma.financialModel.findFirst({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!model) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Financial model not found' } }); return; }
    res.json(model);
  } catch (err) { next(err); }
});

export default router;
