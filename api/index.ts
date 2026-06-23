// Vercel serverless function entry point
// Uses relative imports to avoid pnpm workspace symlink resolution issues
import 'dotenv/config';
export { default } from '../apps/api/src/app';
