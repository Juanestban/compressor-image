import { HistGCase, type HueStatsTypes, type Stats } from '@/models';
import { rgb2hsl } from '@/utils/rgb2hsl';
import { hueGroup } from '@/utils/hueGroup';
import { typeOf } from '@/utils/typeOf';

export class HueStats implements HueStatsTypes {
  protected numGroups: number;
  protected minCols: number;
  protected stats: Stats;
  protected groupsFull: number;

  constructor(numGroups: number, minCols: number) {
    this.numGroups = numGroups;
    this.minCols = minCols;
    this.stats = {};

    for (let i = -1; i < numGroups; i++) {
      this.stats[i] = { num: 0, cols: [] };
    }

    this.groupsFull = 0;
  }

  check(i32: number): void {
    if (this.groupsFull === this.numGroups + 1) {
      this.check = function () {
        return;
      };
    }

    let r = i32 & 0xff;
    let g = (i32 & 0xff00) >> 8;
    let b = (i32 & 0xff0000) >> 16;
    let hg = r === g && g === b ? -1 : hueGroup(rgb2hsl({ r, g, b }).h, this.numGroups);
    let gr = this.stats[hg];
    let min = this.minCols;

    gr.num++;

    if (gr.num > min) {
      return;
    }

    if (gr.num === min) {
      this.groupsFull++;
    }

    if (gr.num <= min) {
      this.stats[hg].cols.push(i32);
    }
  }

  inject(histG: any): void {
    for (let i = -1; i < this.numGroups; i++) {
      if (this.stats[i].num <= this.minCols) {
        switch (typeOf(histG)) {
          case HistGCase.ARRAY: {
            this.stats[i].cols.forEach((col) => {
              if ((histG as number[]).indexOf(col) === -1) {
                (histG as number[]).push(col);
              }
            });
            break;
          }
          case HistGCase.OBJECT: {
            this.stats[i].cols.forEach((col) => {
              if (!histG[col]) {
                histG[col] = 1;
              } else histG[col]++;
            });
            break;
          }
        }
      }
    }
  }
}
