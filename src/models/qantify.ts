export interface QuantityImageProps {
  options?: Options;
}

export interface Options<T extends any = unknown> {
  /** c */
  method?: number;
  /** c */
  colors?: number;
  /** c */
  initColor?: number;
  /** c */
  initDist?: number;
  /** c */
  distIncr?: number;
  /** c */
  hueGroups?: number;
  /** c */
  satGroups?: number;
  /** c */
  lumGroups?: number;
  /** c */
  minHueCols?: number;
  /** c */
  boxSize?: number[];
  /** c */
  boxPxls?: number;
  /** diffusion kernel name */
  dithKern?: Kernel | null;
  /** c */
  dithSerp?: boolean;
  /** c */
  dithDelta?: number;
  /** c */
  useCache?: boolean;
  /** c */
  cacheFreq?: number;
  /** c */
  reIndex?: boolean;
  /** c */
  colorDist?: T;
  /** c */
  colorFreq?: number;
  /** c */
  palete: number[][];
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
