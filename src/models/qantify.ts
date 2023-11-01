export interface QuantityImageProps {
  options?: Options;
}

export interface Options<T extends any = unknown> {
  /** 1: manhattam | 2: euclidean */
  method?: number;
  /** type of number */
  colors?: number;
  /** init color type of number */
  initColor?: number;
  /** number */
  initDist?: number;
  /** number */
  distIncr?: number;
  /** number */
  hueGroups?: number;
  /** number */
  satGroups?: number;
  /** number */
  lumGroups?: number;
  /** number */
  minHueCols?: number;
  /** array of numbers */
  boxSize?: number[];
  /** number */
  boxPxls?: number;
  /** diffusion kernel name */
  dithKern?: Kernel | null;
  /** boolean */
  dithSerp?: boolean;
  /** number */
  dithDelta?: number;
  /** boolean */
  useCache?: boolean;
  /** number */
  cacheFreq?: number;
  /** boolean */
  reIndex?: boolean;
  /** Template */
  colorDist?: T;
  /** number */
  colorFreq?: number;
  /** array of arrays of numbers */
  palette: number[][];
}

export type Kernel =
  | 'FloydSteinberg'
  | 'FalseFloydSteinberg'
  | 'Stucki'
  | 'Atkinson'
  | 'Jarvis'
  | 'Burkes'
  | 'Sierra'
  | 'TwoSierra'
  | 'SierraLite';
