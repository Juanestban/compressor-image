export const iterBox = (bbox: any, wid: number, fn: any) => {
  const b = bbox;
  const i0 = b.y * wid + b.x;
  const i1 = (b.y + b.h - 1) * wid + (b.x + b.w - 1);
  let cnt = 0;
  const incr = wid - b.w + 1;
  let i = i0;

  do {
    fn.call(this, i);
    i += ++cnt % b.w === 0 ? incr : 1;
  } while (i <= i1);
};
