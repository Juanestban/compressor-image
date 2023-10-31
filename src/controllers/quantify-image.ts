import { DEFAULT_OPTIONS, SampleMethods, methodsCases } from '@/constants';
import { type Options } from '@/models';
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

  reduce() {}

  dither() {}

  buildPal(noSort: boolean) {
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

  sortPal() {}

  nearestColor() {}

  nearestIndex(i32: string): string {
    return '';
  }

  cacheHistogram(idxi32: any[]) {}
}
