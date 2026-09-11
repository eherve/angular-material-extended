/** @format */

import { Injectable } from '@angular/core';
import { catchError, Observable, of, shareReplay } from 'rxjs';
import { DatatableSearchListOption } from './types/datatable-column.type';

@Injectable({ providedIn: 'root' })
export class SelectOptionsCacheService {
  private cache = new WeakMap<
    Observable<DatatableSearchListOption[]>,
    Observable<DatatableSearchListOption[]>
  >();

  resolve(source: Observable<DatatableSearchListOption[]>): Observable<DatatableSearchListOption[]> {
    const cached = this.cache.get(source);
    if (cached) return cached;

    const shared = source.pipe(
      catchError(() => {
        this.cache.delete(source);
        return of([]);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.cache.set(source, shared);
    return shared;
  }
}
