const child_process = require('node:child_process');
const path = require('node:path');

console.log('🤖 doing prebuild');
console.time('time building');

const isWindows = process.platform === 'win32';
const cmdRemove = isWindows ? 'powershell.exe Remove-Item' : 'sh rm';
const cmdCopy = isWindows ? 'powershell.exe cp' : 'sh cp';
const withFlags = isWindows ? '' : '-rf';

const getPath = (...args) => path.resolve(process.cwd(), ...args);

try {
  child_process.spawnSync(`${cmdRemove} ${withFlags} ${getPath('dist')}`, { shell: true });
  child_process.spawnSync(`${cmdRemove} ${withFlags} ${getPath('tests/dist')}`, { shell: true });
  child_process.execSync(`pnpm tsc`);
  child_process.spawnSync(`${cmdCopy} -Recurse ${getPath('dist/*')} ${getPath('tests/dist')}`);
} catch (error) {
  console.error('🔴 error to exec `tsc` command\n', error.message);
}

console.timeEnd('time building');
console.log('💚 done ts-build');
