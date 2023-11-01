import { ImageDataCases } from '@/constants';
import { typeOf } from './typeOf';
import { type Elements, type Image } from '@/models';

export const getImage = (img: Image, width?: number) => {
  const el: Elements = {
    canvas: undefined,
    ctx: undefined,
    imgd: undefined,
    buf8: undefined,
    buf32: undefined,
    width: undefined,
    height: undefined,
  };

  const sameCanvas = () => {
    const { canvas, ctx } = el;

    el.canvas = canvas ?? (img as HTMLCanvasElement);
    el.ctx = ctx ?? el.canvas.getContext('2d');
  };

  const sameArrayPixel = () => {
    el.buf8 = el.buf8 ?? new Uint8Array(img as ArrayBuffer);
  };

  const sameUint8 = () => {
    el.buf8 = el.buf8 ?? (img as Uint8Array | Uint8ClampedArray);
    el.buf32 = new Uint32Array(el.buf8.buffer);
  };

  const cases = {
    [ImageDataCases.HTML_IMAGE_ELEMENT]: () => {
      const image = img as HTMLImageElement;
      el.canvas = document.createElement('canvas');
      el.canvas.width = image.naturalWidth;
      el.canvas.height = image.naturalHeight;
      el.ctx = el.canvas.getContext('2d');

      if (el.ctx === null) return;

      el.ctx.drawImage(image, 0, 0);
    },
    [ImageDataCases.CANVAS]: sameCanvas,
    [ImageDataCases.HTML_CANVAS_ELEMENT]: sameCanvas,
    [ImageDataCases.CANVAS_RENDERING_CONTEXT_2D]: () => {
      el.ctx = el.ctx ?? (img as CanvasRenderingContext2D);
      el.canvas = el.canvas ?? el.ctx.canvas;

      if (el.ctx === null) return;

      el.imgd = el.ctx.getImageData(0, 0, el.canvas.width, el.canvas.height);
    },
    [ImageDataCases.IMAGE_DATA]: () => {
      el.imgd = el.imgd ?? (img as ImageData);
      el.width = el.imgd.width;

      el.buf8 =
        typeOf(el.imgd.data) === 'CanvasPixelArray' ? new Uint8Array(el.imgd.data) : el.imgd.data;
    },
    [ImageDataCases.ARRAY]: sameArrayPixel,
    [ImageDataCases.CANVAS_PIXEL_ARRAY]: sameArrayPixel,
    [ImageDataCases.UINT_8_ARRAY]: sameUint8,
    [ImageDataCases.UINT_8_CLAMPED_ARRAY]: sameUint8,
    [ImageDataCases.UINT_32_ARRAY]: () => {
      el.buf32 = el.buf32 ?? (img as Uint32Array);
      el.buf8 = el.buf8 ?? new Uint8Array(el.buf32.buffer);
      el.width = width ?? el.buf32.length;
      el.height = el.buf32.length / (width ?? 1);
    },
  };
  cases[typeOf(img) as ImageDataCases]();

  return el;
};
