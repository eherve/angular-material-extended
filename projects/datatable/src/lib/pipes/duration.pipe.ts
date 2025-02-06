/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { duration } from '../tools/duration.tool';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(data: number | string | Date, options: { locale?: string }): string {
    return duration(data, options)??'';
  }
}
