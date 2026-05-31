import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { OnboardingDataSchema } from '@sme-pitch-ai/shared';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string(),
      industry: z.string(),
      industryTemplate: z.string(),
      stage: z.enum(['IDEA', 'PRE_REVENUE', 'EARLY', 'GROWTH', 'SCALE']),
      country: z.string(),
      currency: z.string().default('USD'),
      onboardingData: z.record(z.unknown()).optional(),
    }).parse(req.body);

    const profile = await prisma.businessProfile.create({
      data: {
        workspaceId: req.workspaceId!,
        name: body.name,
        industry: body.industry,
        industryTemplate: body.industryTemplate,
        stage: body.stage,
        country: body.country,
        currency: body.currency,
        onboardingData: body.onboardingData ?? {},
      },
    });
    res.status(201).json(profile);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const profiles = await prisma.businessProfile.findMany({
      where: { workspaceId: req.workspaceId!, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    res.json(profiles);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const profile = await prisma.businessProfile.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId!, deletedAt: null },
      include: { documents: { where: { deletedAt: null } }, financialModels: true, chatSessions: true },
    });
    if (!profile) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }); return; }
    res.json(profile);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().optional(),
      onboardingData: z.record(z.unknown()).optional(),
      stage: z.enum(['IDEA', 'PRE_REVENUE', 'EARLY', 'GROWTH', 'SCALE']).optional(),
      country: z.string().optional(),
      currency: z.string().optional(),
    }).parse(req.body);

    let isComplete = false;
    if (body.onboardingData) {
      const result = OnboardingDataSchema.safeParse(body.onboardingData);
      isComplete = result.success;
    }

    const profile = await prisma.businessProfile.update({
      where: { id: req.params.id },
      data: { ...body, ...(body.onboardingData ? { isComplete } : {}) },
    });
    res.json(profile);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.businessProfile.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: 'Profile deleted' });
  } catch (err) { next(err); }
});

export default router;
