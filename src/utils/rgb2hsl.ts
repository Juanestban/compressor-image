import { RgbHsl, Hsl } from '@/models';
import { rgb2lum } from '@/utils/rgb2lum';

/**
 * Docs link: http://rgb2hsl.nichabi.com/javascript-function.php
 */
export const rgb2hsl = ({ r, g, b }: RgbHsl): Hsl => {
  let max, min, h, s, l, d;
  r /= 255;
  g /= 255;
  b /= 255;
  max = Math.max(r, g, b);
  min = Math.min(r, g, b);
  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: {
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      }
      case g: {
        h = (b - r) / d + 2;
        break;
      }
      case b: {
        h = (r - g) / d + 4;
        break;
      }
      default: {
        h = 0;
        break;
      }
    }
    h /= 6;
  }

  // h = Math.floor(h * 360);
  // s = Math.floor(s * 100)
  // l = Math.floor(l * 100)
  return {
    h,
    s,
    l: rgb2lum({ r, g, b }),
  };
};
