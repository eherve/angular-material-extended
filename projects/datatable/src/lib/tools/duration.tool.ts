/** @format */

import humanizeDuration, { HumanizerOptions } from 'humanize-duration';

export function duration(data: number | string | Date, options: { locale?: string; largest?: number }): string | null {
  const durationOption: HumanizerOptions = { maxDecimalPoints: 0, largest: 1, fallbacks: ['en'] };
  if (options?.locale) durationOption.language = options.locale;
  if (options?.largest) durationOption.largest = options.largest;

  let value: number | undefined;
  if (typeof data === 'number') value = data;
  else if (typeof data === 'string') {
    const date = new Date(data);
    if (isNaN(date.valueOf())) return null;
    value = Date.now() - date.valueOf();
  } else if (typeof data?.valueOf === 'function') value = Date.now() - data.valueOf();
  if (value === undefined || value === null) return null;

  return humanizeDuration(value, durationOption);
}
