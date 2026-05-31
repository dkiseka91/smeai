import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { planGuard } from '../middleware/planGuard';
import { generateFullBusinessPlan, generatePitchDeck, reviewPitchDeck } from '@sme-pitch-ai/ai';
import { OnboardingDataSchema } from '@sme-pitch-ai/shared';
import type { AudienceType, PitchFramework } from '@sme-pitch-ai/shared';

const router = Router();
router.use(authMiddleware);

router.post('/plan/generate', aiRateLimiter, planGuard('monthlyPlans'), async (req, res, next) => {
  try {
    const { profileId, audience } = z.object({
      profileId: z.string(),
      audience: z.enum(['BANK', 'INVESTOR', 'GRANT', 'ACCELERATOR', 'COMPETITION', 'GENERAL']),
    }).parse(req.body);

    const profile = await prisma.businessProfile.findFirst({
      where: { id: profileId, workspaceId: req.workspaceId!, deletedAt: null },
    });
    if (!profile || !profile.isComplete) {
      res.status(400).json({ error: { code: 'PROFILE_INCOMPLETE', message: 'Profile must be complete before generating a plan' } });
      return;
    }

    const onboardingData = OnboardingDataSchema.parse(profile.onboardingData);
    const document = await prisma.document.create({
      data: {
        profileId,
        type: 'BUSINESS_PLAN',
        status: 'GENERATING',
        audience,
        content: {},
      },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sections: Record<string, string> = {};
    let sectionIndex = 0;
    const TOTAL_SECTIONS = 10;

    const planContent = await generateFullBusinessPlan(
      onboardingData,
      audience as AudienceType,
      (sectionId, content) => {
        sections[sectionId] = content;
        sectionIndex++;
        res.write(`data: ${JSON.stringify({ type: 'section_complete', sectionId, content, progress: Math.round((sectionIndex / TOTAL_SECTIONS) * 100) })}\n\n`);
      }
    );

    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'COMPLETE', content: planContent as unknown as Record<string, unknown>, wordCount: planContent.totalWordCount },
    });

    res.write(`data: ${JSON.stringify({ type: 'complete', documentId: document.id })}\n\n`);
    res.end();
  } catch (err) { next(err); }
});

router.post('/plan/:id/regenerate-section', aiRateLimiter, async (req, res, next) => {
  try {
    const { sectionId, audience } = z.object({
      sectionId: z.string(),
      audience: z.enum(['BANK', 'INVESTOR', 'GRANT', 'ACCELERATOR', 'COMPETITION', 'GENERAL']),
    }).parse(req.body);

    const document = await prisma.document.findUnique({ where: { id: req.params.id }, include: { profile: true } });
    if (!document) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } }); return; }

    const onboardingData = OnboardingDataSchema.parse(document.profile.onboardingData);
    const { generateBusinessPlanSection } = await import('@sme-pitch-ai/ai');
    const content = await generateBusinessPlanSection(onboardingData, sectionId as Parameters<typeof generateBusinessPlanSection>[1], audience as AudienceType);

    const existingContent = document.content as Record<string, unknown> & { sections?: Array<{ id: string; content: string }> };
    if (existingContent.sections) {
      const idx = existingContent.sections.findIndex(s => s.id === sectionId);
      if (idx !== -1) existingContent.sections[idx].content = content;
    }

    await prisma.document.update({ where: { id: document.id }, data: { content: existingContent } });
    res.json({ sectionId, content });
  } catch (err) { next(err); }
});

router.post('/deck/generate', aiRateLimiter, planGuard('monthlyDecks'), async (req, res, next) => {
  try {
    const { profileId, framework } = z.object({
      profileId: z.string(),
      framework: z.enum(['INVESTOR', 'BANK', 'GRANT', 'ACCELERATOR', 'COMPETITION', 'GENERAL']),
    }).parse(req.body);

    const profile = await prisma.businessProfile.findFirst({
      where: { id: profileId, workspaceId: req.workspaceId!, deletedAt: null },
    });
    if (!profile || !profile.isComplete) {
      res.status(400).json({ error: { code: 'PROFILE_INCOMPLETE', message: 'Profile must be complete' } });
      return;
    }

    const onboardingData = OnboardingDataSchema.parse(profile.onboardingData);
    const deckContent = await generatePitchDeck(onboardingData, framework as PitchFramework);
    const document = await prisma.document.create({
      data: {
        profileId,
        type: 'PITCH_DECK',
        status: 'COMPLETE',
        audience: 'INVESTOR',
        content: deckContent as unknown as Record<string, unknown>,
      },
    });
    res.status(201).json({ document, content: deckContent });
  } catch (err) { next(err); }
});

router.post('/deck/:id/review', aiRateLimiter, async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } }); return; }
    const { PitchDeckContentSchema } = await import('@sme-pitch-ai/shared');
    const deckContent = PitchDeckContentSchema.parse(document.content);
    const review = await reviewPitchDeck(deckContent);
    res.json(review);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { exports: true },
    });
    if (!document) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } }); return; }
    res.json(document);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { content } = z.object({ content: z.record(z.unknown()) }).parse(req.body);
    const document = await prisma.document.update({ where: { id: req.params.id }, data: { content } });
    res.json(document);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.document.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ message: 'Document deleted' });
  } catch (err) { next(err); }
});

export default router;
