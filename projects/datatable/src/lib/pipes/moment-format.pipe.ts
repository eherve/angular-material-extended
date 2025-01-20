/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import moment, { Moment } from 'moment';

@Pipe({ name: 'momentFormat' })
export class MomentFormatPipe implements PipeTransform {
  transform(data: any, options: { format?: string; locale?: string }): string {
    const date = this.getMoment(data);
    if (!date) return '';
    const format = options?.format || 'LLL';
    return options?.locale ? date.locale(options.locale).format(format) : date.format(format);
  }

  private getMoment(data: any): Moment | null {
    if (typeof data === 'string') return moment(data);
    if (typeof data === 'number') return moment(data);
    if (data instanceof Date) return moment(data);
    if (moment.isMoment(data)) return data.clone();
    if (typeof data?.valueOf === 'function') {
      const value = data.valueOf();
      if (typeof value === 'number') return moment(data);
    }
    return null;
  }
}
