import { RgbHsl } from '@/models';

const Pr = 0.2126;
const Pg = 0.7152;
const Pb = 0.0722;

export const rgb2lum = ({ r, g, b }: RgbHsl): number => {
  return Math.sqrt(Pr * r * r + Pg * g * g + Pb * b * b);
};
