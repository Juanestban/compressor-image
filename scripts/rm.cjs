const child_process = require('node:child_process');

console.log('🤖 doing prebuild');
console.time('time building');

child_process.spawnSync(`rm ${process.platform !== 'win32' ? '-rf' : ''} ../dist`);
try {
  child_process.execSync(`pnpm tsc`);
} catch (error) {
  console.error('🔴 error to exec `tsc` command\n', error.message);
}

console.timeEnd('time building');
console.log('💚 done ts-build');
