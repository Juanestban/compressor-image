import { Pr, Pg, Pb } from '@/constants';

// perceptual Manhattan color distance
export const distManhattan = (rgb0: number[], rgb1: number[]): number => {
  const rd = Math.abs(rgb1[0] - rgb0[0]);
  const gd = Math.abs(rgb1[1] - rgb0[1]);
  const bd = Math.abs(rgb1[2] - rgb0[2]);
  const manhMax = Pr * rd + Pg * gd + Pb * bd;

  return (Pr * rd + Pg * gd + Pb * bd) / manhMax;
};
