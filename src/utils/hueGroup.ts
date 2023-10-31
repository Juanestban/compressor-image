export const hueGroup = (hue: number, segs: number): number => {
  const seg = 1 / segs;
  const haf = seg / 2;

  if (hue >= 1 - haf || hue <= haf) {
    return 0;
  }

  for (let i = 1; i < segs; i++) {
    const mid = i * seg;

    if (hue >= mid - haf && hue <= mid + haf) {
      return i;
    }
  }

  return 0;
};
