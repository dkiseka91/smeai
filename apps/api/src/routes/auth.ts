import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { authMiddleware } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signTokens(userId: string, workspaceId: string) {
  const accessToken = jwt.sign({ userId, workspaceId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, workspaceId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

router.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = RegisterSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: { code: 'EMAIL_IN_USE', message: 'Email already registered' } });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
      data: { email, passwordHash, name, emailVerificationToken },
    });
    const workspace = await prisma.workspace.create({
      data: { name: `${name}'s Workspace`, ownerId: user.id },
    });
    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' },
    });
    await sendVerificationEmail(email, name, emailVerificationToken);
    res.status(201).json({ message: 'Verification email sent' });
  } catch (err) { next(err); }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.query);
    const user = await prisma.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user) {
      res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
      return;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null },
    });
    const workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } });
    const tokens = signTokens(user.id, workspace?.id ?? '');
    res.json(tokens);
  } catch (err) { next(err); }
});

router.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }
    if (!user.isEmailVerified) {
      res.status(403).json({ error: { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email first' } });
      return;
    }
    const workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } });
    const tokens = signTokens(user.id, workspace?.id ?? '');
    await redis?.set(`refresh:${tokens.refreshToken}`, user.id, 'EX', 30 * 24 * 3600);
    res.json({ ...tokens, user: { id: user.id, email: user.email, name: user.name, planTier: user.planTier } });
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const blacklisted = await redis?.get(`blacklist:${refreshToken}`);
    if (blacklisted) {
      res.status(401).json({ error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked' } });
      return;
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; workspaceId: string };
    const newTokens = signTokens(payload.userId, payload.workspaceId);
    await redis?.del(`refresh:${refreshToken}`);
    await redis?.set(`blacklist:${refreshToken}`, '1', 'EX', 30 * 24 * 3600);
    await redis?.set(`refresh:${newTokens.refreshToken}`, payload.userId, 'EX', 30 * 24 * 3600);
    res.json(newTokens);
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    await redis?.set(`blacklist:${refreshToken}`, '1', 'EX', 30 * 24 * 3600);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
});

router.post('/forgot-password', authRateLimiter, async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600 * 1000);
      await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: token, passwordResetExpiry: expiry } });
      await sendPasswordResetEmail(email, user.name, token);
    }
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) { next(err); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = z.object({ token: z.string(), password: z.string().min(8) }).parse(req.body);
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token, passwordResetExpiry: { gt: new Date() } },
    });
    if (!user) {
      res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' } });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });
    res.json({ message: 'Password reset successfully' });
  } catch (err) { next(err); }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        ownedWorkspaces: { include: { members: true, subscription: true } },
      },
    });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
