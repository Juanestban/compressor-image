import { type Options } from '@/models';

export const DEFAULT_OPTIONS: Options<'manhattam' | 'euclidean'> = {
  method: 2,
  colors: 256,
  initColor: 4096,
  initDist: 0.01,
  distIncr: 0.005,
  hueGroups: 10,
  satGroups: 10,
  lumGroups: 10,
  minHueCols: 0,
  boxSize: [64, 64],
  boxPxls: 2,
  dithKern: null,
  dithSerp: false,
  dithDelta: 0,
  useCache: true,
  cacheFreq: 10,
  reIndex: false,
  colorDist: undefined,
  palete: [],
};

export enum methodsCases {
  FIRST = 1,
  SECOND = 2,
}
