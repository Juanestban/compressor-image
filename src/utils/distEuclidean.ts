import { Pr, Pg, Pb } from '@/constants';

// perceptual Euclidean color distance
export const distEuclidean = (rgb0: number[], rgb1: number[]): number => {
  const rd = rgb1[0] - rgb0[0];
  const gd = rgb1[1] - rgb0[1];
  const bd = rgb1[2] - rgb0[2];
  const euclMax = Math.sqrt(Pr * rd * rd + Pg * gd * gd + Pb * bd * bd);

  return Math.sqrt(Pr * rd * rd + Pg * gd * gd + Pb * bd * bd) / euclMax;
};
