/** @format */

import { defer, firstValueFrom, Observable } from 'rxjs';
import { SelectOptionsCacheService } from './select-options-cache.service';
import { DatatableSearchListOption } from './types/datatable-column.type';

describe('SelectOptionsCacheService', () => {
  it('should share one cold options source between subscribers', async () => {
    const service = new SelectOptionsCacheService();
    let subscriptions = 0;
    const source = defer(() => {
      subscriptions++;
      return Promise.resolve([{ value: 'active', name: 'Active' }]);
    });

    const shared = service.resolve(source);
    const [first, second] = await Promise.all([firstValueFrom(shared), firstValueFrom(shared)]);

    expect(subscriptions).toBe(1);
    expect(first).toEqual([{ value: 'active', name: 'Active' }]);
    expect(second).toEqual(first);
  });

  it('should recover from an options error and allow a later retry', async () => {
    const service = new SelectOptionsCacheService();
    let subscriptions = 0;
    const source = new Observable<DatatableSearchListOption[]>(subscriber => {
      subscriptions++;
      if (subscriptions === 1) subscriber.error(new Error('load failed'));
      else {
        subscriber.next([{ value: 'active', name: 'Active' }]);
        subscriber.complete();
      }
    });

    expect(await firstValueFrom(service.resolve(source))).toEqual([]);
    expect(await firstValueFrom(service.resolve(source))).toEqual([{ value: 'active', name: 'Active' }]);
    expect(subscriptions).toBe(2);
  });
});
