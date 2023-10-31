import { DEFAULT_OPTIONS, methodsCases } from '@/constants';
import { type Options } from '@/models';
import { HueStats } from './hueStats';
import { sortedHashKeys } from '@/utils/sort';

export class QuantityImage {
  private options: Options;
  protected hueStats: HueStats | null;
  protected palLocked = false;
  protected histogram = {};
  protected idxrgb: number[][];
  protected i32rgb = {};
  protected idxi32: any[] = [];
  protected i32idx = {};

  constructor({ options } = { options: DEFAULT_OPTIONS }) {
    this.options = options;
    this.hueStats = this.options.minHueCols
      ? new HueStats(this.options.hueGroups as number, this.options.minHueCols)
      : null;

    this.idxrgb = this.options.palete ? this.options.palete.slice(0) : [];
  }

  sample() {}

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

  prunePal() {}

  reducePal(idxi32: any[]) {}

  colorStats1D() {}

  colorStats2D() {}

  sortPal() {}

  nearestColor() {}

  nearestIndex() {}

  cacheHistogram(idxi32: any[]) {}
}
