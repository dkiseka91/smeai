import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import auditRouter from './routes/audit';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.VIBECHECK_WEB_ORIGIN?.split(',') ?? ['http://localhost:5174'],
  })
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'vibecheck-api' }));
app.use('/api/audit', auditRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
