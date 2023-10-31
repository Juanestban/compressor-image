import { typeOf } from './typeOf';

const sort = isArraySortStable() ? Array.prototype.sort : stableSort;

/** must be used via stableSort.call(array, fn) */
function stableSort(this: any[], fn: any) {
  const type = typeOf(this[0]);

  if (type === 'Number' || type === 'String') {
    const ord: any = {};
    const len = this.length;
    let val;

    for (let i = 0; i < len; i++) {
      val = this[i];
      if (ord[val] || ord[val] === 0) continue;
      ord[val] = i;
    }
  } else {
    let ord: any = this.map((v) => v);

    return this.sort((a, b) => fn(a, b) || ord.indexOf(a) - ord.indexOf(b));
  }
}

function isArraySortStable() {
  var str = 'abcdefghijklmnopqrstuvwxyz';

  return (
    'xyzvwtursopqmnklhijfgdeabc' ===
    str
      .split('')
      .sort((a, b) => ~~(str.indexOf(b) / 2.3) - ~~(str.indexOf(a) / 2.3))
      .join('')
  );
}

export const sortedHashKeys = (obj: any, desc: boolean) => {
  const keys = [];

  for (let key in obj) {
    keys.push(key);
  }

  return sort.call(keys, (a, b) => (desc ? obj[b] - obj[a] : obj[a] - obj[b]));
};
