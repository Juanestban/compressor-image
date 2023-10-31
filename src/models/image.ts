export interface Elements {
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D | null;
  imgd?: ImageData;
  buf8?: Uint8Array | Uint8ClampedArray;
  buf32?: Uint32Array;
  width?: number;
  height?: number;
}

export type Image =
  | string
  | HTMLImageElement
  | HTMLCanvasElement
  | CanvasRenderingContext2D
  | ImageData
  | ArrayBuffer;
