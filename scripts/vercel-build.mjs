import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, cpSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FUNC_DIR = join(ROOT, '.vercel/output/functions/api/index.func');
const STATIC_DIR = join(ROOT, '.vercel/output/static');

console.log('[vercel-build] Generating Prisma client...');
execSync('pnpm --filter db exec prisma generate', { stdio: 'inherit', cwd: ROOT });

console.log('[vercel-build] Creating output directories...');
mkdirSync(FUNC_DIR, { recursive: true });
mkdirSync(STATIC_DIR, { recursive: true });

console.log('[vercel-build] Bundling API with esbuild...');
execSync(
  `node_modules/.bin/esbuild api/index.ts --bundle --platform=node --target=node18 --outfile=${FUNC_DIR}/index.js --external:@prisma/client --external:.prisma`,
  { stdio: 'inherit', cwd: ROOT }
);

console.log('[vercel-build] Copying Prisma client...');
const funcNodeModules = join(FUNC_DIR, 'node_modules');
mkdirSync(funcNodeModules, { recursive: true });

function copyPrismaClient() {
  const targets = [
    ['@prisma/client', '@prisma/client'],
    ['.prisma/client', '.prisma/client'],
  ];
  for (const [pkg, dest] of targets) {
    const candidates = [
      join(ROOT, 'node_modules', pkg),
      join(ROOT, 'node_modules/.pnpm/node_modules', pkg),
    ];
    // Also search inside pnpm's content-addressable store
    const pnpmDir = join(ROOT, 'node_modules/.pnpm');
    if (existsSync(pnpmDir)) {
      for (const entry of readdirSync(pnpmDir)) {
        const deepPath = join(pnpmDir, entry, 'node_modules', pkg);
        if (existsSync(deepPath)) candidates.push(deepPath);
      }
    }
    for (const src of candidates) {
      if (existsSync(src)) {
        const destPath = join(funcNodeModules, dest);
        mkdirSync(dirname(destPath), { recursive: true });
        cpSync(src, destPath, { recursive: true, dereference: true });
        console.log(`  Copied ${pkg} from ${src}`);
        break;
      }
    }
  }
  const prismaEnginesDir = join(funcNodeModules, '.prisma/client');
  if (existsSync(prismaEnginesDir)) {
    const engineFiles = readdirSync(prismaEnginesDir).filter(f => f.includes('rhel') || f.includes('linux') || f.endsWith('.so.node'));
    console.log(`  Engine files found: ${engineFiles.length > 0 ? engineFiles.join(', ') : 'none (will use default)'}`);
  }
}
copyPrismaClient();

console.log('[vercel-build] Writing function config...');
writeFileSync(join(FUNC_DIR, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs18.x',
  handler: 'index.js',
  maxDuration: 60,
  launcherType: 'Nodejs',
}, null, 2));

console.log('[vercel-build] Writing output config...');
writeFileSync(join(ROOT, '.vercel/output/config.json'), JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/api/index' },
  ],
}, null, 2));

if (existsSync(join(ROOT, 'public'))) {
  cpSync(join(ROOT, 'public'), STATIC_DIR, { recursive: true });
}

console.log('[vercel-build] Done!');
