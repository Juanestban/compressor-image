export const makeBoxes = (wid: number, hgt: number, w0: number, h0: number) => {
  const wrem = wid % w0;
  const hrem = hgt % h0;
  const xend = wid - wrem;
  const yend = hgt - hrem;

  const bxs = [];

  for (let y = 0; y < hgt; y += h0)
    for (let x = 0; x < wid; x += w0)
      bxs.push({ x, y, w: x === xend ? wrem : w0, h: y === yend ? hrem : h0 });

  return bxs;
};
