import { type RgbHsl } from '@/models';
import { Pr, Pg, Pb } from '@/constants';

export const rgb2lum = ({ r, g, b }: RgbHsl): number => {
  return Math.sqrt(Pr * r * r + Pg * g * g + Pb * b * b);
};
