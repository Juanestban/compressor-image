const child_process = require('node:child_process');

console.log('🤖 doing republish - commands');
console.time('timing');

child_process.spawnSync(`rm ${process.platform !== 'win32' ? '-rf' : ''} ../dist`);
child_process.execSync(`pnpm tsc`);

console.timeEnd('timing');
