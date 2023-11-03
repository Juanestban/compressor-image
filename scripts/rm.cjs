const child_process = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

console.log('🤖 doing prebuild');
console.time('time building');

const isWindows = process.platform === 'win32';
const withFlags = isWindows ? '' : '-rf';

const getPath = (...args) => path.resolve(process.cwd(), ...args);

const distPath = getPath('dist');
const distTestPath = getPath('tests/dist');

(async () => {
  try {
    console.log(`[🔹] cleaning dist folder: [${distPath}]`);
    await fs.unlink(distPath).catch(() => {});
    await fs.rm(distPath, { recursive: true, force: true }).catch(() => {});
    console.log('[💚] done clean dist folder');

    console.log('[🔹] cleaning', 'path: `tests/dist`', ` folder: [${distPath}]`);
    await fs.unlink(distTestPath).catch(() => {});
    await fs.rm(distTestPath, { recursive: true, force: true }).catch(() => {});
    console.log('[💚] done clean dist folder');

    console.log(`[🔹] building...`);
    child_process.execSync('pnpm tsc');
    console.log('[💚] done clean dist folder');

    console.log('[🔹] copy dist folder to `tests` folder');
    await fs.cp(distPath, distTestPath, { recursive: true });
    console.log('[💚] done copy dist folders');
  } catch (error) {
    console.error('[🔴] error to exec `tsc` command\n', error.message);
  }

  console.timeEnd('time building');
  console.log('💚 done ts-build');
})();
