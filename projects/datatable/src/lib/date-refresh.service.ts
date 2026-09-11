/** @format */

import { Injectable } from '@angular/core';
import { interval, Observable, share } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DateRefreshService {
  private readonly intervals = new Map<number, Observable<number>>();

  forInterval(refreshTime: number): Observable<number> {
    let ticks = this.intervals.get(refreshTime);
    if (!ticks) {
      ticks = interval(refreshTime).pipe(share());
      this.intervals.set(refreshTime, ticks);
    }
    return ticks;
  }
}
