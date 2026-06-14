import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { planGuard } from '../middleware/planGuard';
import { streamChatResponse } from '@sme-pitch-ai/ai';
import { OnboardingDataSchema } from '@sme-pitch-ai/shared';
import type { ChatMessage } from '@sme-pitch-ai/shared';

const router = Router();
router.use(authMiddleware);

router.post('/message', planGuard('chatQueries'), async (req, res, next) => {
  try {
    const { profileId, message } = z.object({ profileId: z.string(), message: z.string() }).parse(req.body);

    const profile = await prisma.businessProfile.findFirst({
      where: { id: profileId, workspaceId: req.workspaceId!, deletedAt: null },
    });
    if (!profile) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }); return; }

    let session = await prisma.chatSession.findFirst({ where: { profileId } });
    if (!session) {
      session = await prisma.chatSession.create({ data: { profileId, messages: [] } });
    }

    const history = session.messages as unknown as ChatMessage[];
    history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    const onboardingData = OnboardingDataSchema.parse(profile.onboardingData);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    await streamChatResponse(onboardingData, history, (chunk) => {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
    });

    history.push({ role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() });
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { messages: history as unknown as Prisma.InputJsonValue, queryCount: { increment: 1 } },
    });

    res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
    res.end();
  } catch (err) { next(err); }
});

router.get('/:profileId/history', async (req, res, next) => {
  try {
    const session = await prisma.chatSession.findFirst({ where: { profileId: req.params.profileId } });
    res.json(session?.messages ?? []);
  } catch (err) { next(err); }
});

export default router;
