import { DEFAULT_OPTIONS, SampleMethods, methodsCases, KERNELS as kernels } from '@/constants';
import { type Image, type Options, type Kernel } from '@/models';
import { sort, sortedHashKeys } from '@/utils/sort';
import { distManhattan } from '@/utils/distManhattan';
import { distEuclidean } from '@/utils/distEuclidean';
import { getImage } from '@/utils/getImage';
import { makeBoxes } from '@/utils/makeBoxes';
import { iterBox } from '@/utils/iterBox';

import { HueStats } from './hueStats';

export class QuantityImage {
  private options: Options;
  protected hueStats: HueStats | null;
  protected palLocked = false;
  protected histogram: Record<number, number> = {};
  protected idxrgb: number[][];
  protected i32rgb: number[][] = [];
  protected idxi32: any[] = [];
  protected i32idx: any[] = [];
  protected colorDist;

  constructor({ options } = { options: DEFAULT_OPTIONS }) {
    this.options = options;
    this.hueStats = this.options.minHueCols
      ? new HueStats(this.options.hueGroups as number, this.options.minHueCols)
      : null;

    this.idxrgb = this.options.palete ? this.options.palete.slice(0) : [];
    this.colorDist = this.options.colorDist === 'manhattan' ? distManhattan : distEuclidean;

    // if pre-defined palette, build lookups
    if (this.idxrgb.length > 0) {
      this.idxrgb.forEach((rgb, i) => {
        const i32 =
          ((255 << 24) | // alpha
            (rgb[2] << 16) | // blue
            (rgb[1] << 8) | // green
            rgb[0]) >>> // red
          0;

        this.idxi32[i] = i32;
        this.i32idx[i32] = i;
        this.i32rgb[i32] = rgb;
      });
    }
  }

  sample(img: string, width: number) {
    if (this.palLocked) {
      throw new Error('Cannot sample additional images, palette already assembled.');
    }

    const data = getImage(img, width);

    const selfMethods = {
      [SampleMethods.FIRST]: this.colorStats1D(data.buf32 as Uint32Array),
      [SampleMethods.SECOND]: this.colorStats2D(data.buf32 as Uint32Array, data.width as number),
    };

    selfMethods[this.options.method as SampleMethods];
  }

  /**
   * image quantizer
   * TODO: memoize colors here also
   * @retType: 1 - Uint8Array (default), 2 - Indexed array, 3 - Match @img type (unimplemented, todo)
   */
  reduce(img: Image, retType: number, dithKern?: Kernel | null, dithSerp?: boolean) {
    if (!this.palLocked) {
      this.buildPal();
    }

    const dithKern2 = dithKern ?? this.options.dithKern;
    const dithSerp2 = typeof dithSerp !== 'undefined' ? dithSerp : this.options.dithSerp;
    const retType2 = retType ?? 1;
    let out32: Uint32Array;

    if (dithKern) {
      out32 = this.dither(img, dithKern2 as Kernel, dithSerp2);
    } else {
      const { buf32 } = getImage(img);
      const len = buf32?.length ?? 0;
      out32 = new Uint32Array(len);

      for (let i = 0; i < len; i++) {
        const i32 = (buf32 as Uint32Array)[i];
        out32[i] = this.nearestColor(i32);
      }
    }

    if (retType2 === 1) {
      return new Uint8Array(out32.buffer);
    }

    if (retType2 === 2) {
      const out = [];
      const len = out32.length;

      for (let i = 0; i < len; i++) {
        const i32 = out32[i];
        out[i] = this.i32idx[i32];
      }

      return out;
    }
  }

  dither(img: any, kernel: Kernel, serpentine: any): Uint32Array {
    if (!kernel || kernels[kernel]) {
      throw new Error(`Unknow dithering kernel: ${kernel}`);
    }

    const ds = kernels[kernel];
    const { buf32, width, height } = getImage(img);
    const buffer32 = buf32 as Uint32Array;
    let dir = serpentine ? -1 : 1;
    const newWidth = width ?? 0;
    const newHeight = height ?? 0;

    for (let y = 0; y < newHeight; y++) {
      if (serpentine) {
        dir *= -1;
      }

      const lni = y * (width ?? 0);

      for (
        let x = dir === 1 ? 0 : newWidth - 1, xend = dir === 1 ? newWidth : 0;
        x !== xend;
        x += dir
      ) {
        const idx = lni + x;
        const i32 = buffer32[idx];
        const r1 = i32 & 0xff;
        const g1 = (i32 & 0xff00) >> 8;
        const b1 = (i32 & 0xff0000) >> 16;

        const i32x = this.nearestColor(i32);
        const r2 = i32x & 0xff;
        const g2 = (i32x & 0xff00) >> 8;
        const b2 = (i32x & 0xff0000) >> 16;

        buffer32[idx] =
          (255 << 24) | // alpha
          (b2 << 16) | // blue
          (g2 << 8) | // green
          r2;

        if (this.options.dithDelta) {
          const dist = this.colorDist([r1, g1, b1], [r2, g2, b2]);
          if (dist < this.options.dithDelta) continue;
        }

        // distance component
        const er = r1 - r2;
        const eg = g1 - g2;
        const eb = b1 - b2;

        for (
          let i = dir === 1 ? 0 : ds.length - 1, end = dir === 1 ? ds.length : 0;
          i !== end;
          i += dir
        ) {
          const x1 = ds[i][1] * dir;
          const y1 = ds[i][2];
          const lni2 = y1 * newWidth;

          if (x1 + x >= 0 && x1 + x < newWidth && y1 + y >= 0 && y1 + y < newHeight) {
            const d = ds[i][0];
            const idx2 = idx + (lni2 + x1);
            const r3 = buffer32[idx2] & 0xff;
            const g3 = (buffer32[idx2] & 0xff00) >> 8;
            const b3 = (buffer32[idx2] & 0xff0000) >> 16;

            const r4 = Math.max(0, Math.min(255, r3 + er * d));
            const g4 = Math.max(0, Math.min(255, g3 + eg * d));
            const b4 = Math.max(0, Math.min(255, b3 + eb * d));

            buffer32[idx2] =
              (255 << 24) | // alpha
              (b4 << 16) | // blue
              (g4 << 8) | // green
              r4;
          }
        }
      }
    }

    return buffer32;
  }

  buildPal(noSort?: boolean) {
    if (
      this.palLocked ||
      (this.idxrgb.length > 0 && this.idxrgb.length <= (this.options.colors as number))
    )
      return;

    const histG = this.histogram;
    const sorted = sortedHashKeys(histG, true);

    if (sorted && sorted.length === 0) {
      throw new Error('Noting has been sampled, palette cannot be built');
    }

    let idxi32 = [];

    switch (this.options.method) {
      case methodsCases.FIRST: {
        const arraySorted = sorted as any[];
        const cols = this.options.initColor as number;
        const last = arraySorted[cols - 1];
        const freq = (histG as any)[last];

        idxi32 = arraySorted.slice(0, cols);
        let pos = cols;
        const len = arraySorted.length;

        while (pos < len && (histG as any)[arraySorted[pos]] === freq) {
          this.idxi32.push(arraySorted[pos++]);
        }

        if (this.hueStats) {
          this.hueStats.inject(idxi32);
        }

        break;
      }
      case methodsCases.SECOND: {
        idxi32 = sorted as any[];
        break;
      }
    }
    idxi32 = idxi32.map((v) => +v);
    this.reducePal(idxi32);

    if (!noSort && this.options.reIndex) {
      this.sortPal();
    }

    if (this.options.useCache) {
      this.cacheHistogram(idxi32);
    }

    this.palLocked = true;
  }

  palete(tuples: any, noSort: boolean) {
    this.buildPal(noSort);

    return tuples ? this.idxrgb : new Uint8Array(new Uint32Array(this.idxi32).buffer);
  }

  // TODO: missing this function
  prunePal(keep: Record<any, any>) {}

  reducePal(idxi32: any[]) {
    const colors = this.options.colors as number;

    if (this.idxrgb.length > colors) {
      const len = idxi32.length;
      const keep: Record<string, boolean> = {};
      let uniques = 0;
      let idx;
      let pruned = false;

      for (let i = 0; i < len; i++) {
        if (uniques === colors && !pruned) {
          this.prunePal(keep);
          pruned = true;
        }

        idx = this.nearestIndex(this.idxi32[i]);

        if (uniques < colors && !pruned) {
          keep[idx] = true;
          uniques++;
        }
      }

      if (!pruned) {
        this.prunePal(keep);
        pruned = true;
      }
    } else {
      const idxrgb = idxi32.map((i32) => [i32 & 0xff, (i32 & 0xff00) >> 8, (i32 & 0xff0000) >> 16]);
      const len = idxrgb.length;
      let palLen = len;
      let thold = this.options.initDist as number;
      const memDist = [];

      if (palLen > colors) {
        while (palLen > colors) {
          for (let i = 0; i < len; i++) {
            const pxi = idxrgb[i];
            if (!pxi) continue;

            for (let j = 0; j < len; j++) {
              const pxj = idxrgb[j];
              const i32j = idxi32[j];

              if (!pxj) continue;

              const dist = this.colorDist(pxi, pxj);

              if (dist < thold) {
                memDist.push([j, pxj, i32j, dist]);

                delete idxrgb[j];
                palLen--;
              }
            }
          }

          thold +=
            palLen > colors * 3
              ? (this.options.initDist as number)
              : (this.options.distIncr as number);
        }

        if (palLen < colors) {
          let k = 0;

          sort.call(memDist, (a, b) => b[3] - a[3]);

          while (palLen < colors) {
            idxrgb[memDist[k][0]] = memDist[k][1];
            palLen++;
            k++;
          }
        }
      }

      for (let i = 0; i < len; i++) {
        if (!idxrgb[i]) continue;

        this.idxrgb.push(idxrgb[i]);
        this.idxi32.push(idxi32[i]);

        this.i32idx[idxi32[i]] = this.idxi32.length - 1;
        this.i32rgb[idxi32[i]] = idxrgb[i];
      }
    }
  }

  colorStats1D(buf32: Uint32Array) {
    const histG = this.histogram;
    let col;
    const len = buf32.length;

    for (let i = 0; i < len; i++) {
      col = buf32[i];

      // skip transparent
      if ((col & 0xff000000) >> 24 === 0) continue;

      // collect hue stats
      if (this.hueStats) {
        this.hueStats.check(col);
      }

      if (col in histG) {
        histG[col]++;
      } else histG[col] = 1;
    }
  }

  colorStats2D(buf32: Uint32Array, width: number) {
    const boxSize = this.options.boxSize as number[];
    const boxW = boxSize[0];
    const boxH = boxSize[1];
    const area = boxW * boxH;
    const boxes = makeBoxes(width, buf32.length / width, boxW, boxH);
    const histG = this.histogram;

    boxes.forEach((box: any) => {
      const effc = Math.max(
        Math.round((box.w * box.h) / area) * (this.options.boxPxls as number),
        2,
      );
      const histL: Record<number, number> = {};
      let col;

      iterBox(box, width, (i: number) => {
        col = buf32[i];

        // skip transparent
        if ((col & 0xff000000) >> 24 === 0) return;

        // collect hue stats
        if (this.hueStats) this.hueStats.check(col);

        if (col in histG) histG[col]++;
        else if (col in histL) {
          if (++histL[col] >= effc) histG[col] = histL[col];
        } else histL[col] = 1;
      });
    });

    if (this.hueStats) this.hueStats.inject(histG);
  }

  // TODO: missing this function
  sortPal() {}

  // TODO: missing this function
  nearestColor(i32: number): number {
    return 0;
  }

  // TODO: missing this function
  nearestIndex(i32: string): string {
    return '';
  }

  // TODO: missing this function
  cacheHistogram(idxi32: any[]) {}
}
