export interface HueStatsTypes {
  check(i32: number | string): void;
  inject(histG: string | (number | string)[]): void;
}

export type Stats = Record<number, { num: number; cols: number[] }>;

export interface RgbHsl {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export enum HistGCase {
  ARRAY = 'Array',
  OBJECT = 'Object',
}
