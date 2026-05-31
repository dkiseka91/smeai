import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { calculateFinancialModel } from '../services/financialService';
import { FinancialModelInputsSchema } from '@sme-pitch-ai/shared';

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
    const { inputs, outputs } = req.body as { inputs: unknown; outputs: unknown };
    const model = await prisma.financialModel.upsert({
      where: { id: req.params.id },
      update: { revenueInputs: (inputs as Record<string, unknown>), outputs: (outputs as Record<string, unknown>) },
      create: {
        id: req.params.id,
        profileId: (req.body as { profileId: string }).profileId,
        currency: (inputs as { currency: string }).currency ?? 'USD',
        revenueInputs: (inputs as Record<string, unknown>),
        costInputs: {},
        outputs: (outputs as Record<string, unknown>),
      },
    });
    res.json(model);
  } catch (err) { next(err); }
});

router.get('/:profileId', async (req, res, next) => {
  try {
    const model = await prisma.financialModel.findFirst({
      where: { profileId: req.params.profileId },
      orderBy: { createdAt: 'desc' },
    });
    if (!model) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Financial model not found' } }); return; }
    res.json(model);
  } catch (err) { next(err); }
});

export default router;
