/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(data: number, options: { locale?: string }): string {
    const duration = moment.duration(data);
    return options?.locale ? duration.locale(options.locale).humanize() : duration.humanize();
  }
}
