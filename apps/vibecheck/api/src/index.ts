import 'dotenv/config';
import app from './app';

const PORT = process.env.VIBECHECK_API_PORT ?? 4001;

app.listen(PORT, () => {
  console.log(`[VibeCheck API] Server running on http://localhost:${PORT}`);
});
