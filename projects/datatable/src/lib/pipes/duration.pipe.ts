/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(data: number | string | Date, options: { locale?: string }): string {
    let duration: moment.Duration;
    if (typeof data === 'number') duration = moment.duration(data);
    if (typeof data === 'string') duration = moment.duration(Date.now() - new Date(data).valueOf());
    else duration = moment.duration(Date.now() - data.valueOf());
    return options?.locale ? duration.locale(options.locale).humanize() : duration.humanize();
  }
}
