import { DateRefreshService } from './date-refresh.service';

describe('DateRefreshService', () => {
  it('should reuse the shared observable for the same refresh interval', () => {
    const service = new DateRefreshService();

    expect(service.forInterval(1000)).toBe(service.forInterval(1000));
    expect(service.forInterval(1000)).not.toBe(service.forInterval(2000));
  });
});
