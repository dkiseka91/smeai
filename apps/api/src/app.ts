import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import profilesRouter from './routes/profiles';
import documentsRouter from './routes/documents';
import financialRouter from './routes/financial';
import chatRouter from './routes/chat';
import paymentsRouter from './routes/payments';
import exportsRouter from './routes/exports';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  const { prisma } = await import('./lib/prisma');
  const { redis } = await import('./lib/redis');
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ status: 'ok', db: 'connected', redis: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', timestamp: new Date().toISOString() });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/financial', financialRouter);
app.use('/api/chat', chatRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/exports', exportsRouter);

app.use(errorHandler);

export default app;
