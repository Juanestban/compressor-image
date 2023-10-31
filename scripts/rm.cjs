const child_process = require('node:child_process');

console.log('🤖 doing prebuild');
console.time('time building');

child_process.spawnSync(`rm ${process.platform !== 'win32' ? '-rf' : ''} ../dist`);
child_process.execSync(`pnpm tsc`);

console.timeEnd('time building');
console.log('💚 done ts-build');
