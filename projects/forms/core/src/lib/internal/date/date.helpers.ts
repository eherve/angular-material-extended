import moment, { Moment } from "moment";
import dayjs, { Dayjs } from "dayjs";

export type DateLike = Date | Moment | Dayjs | { toDate(): Date } | { getUTCDate(): Date } | string | number | null | undefined;

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return isValidDate(value) ? value : null;
  if (moment.isMoment(value)) return value.isValid() ? value.toDate() : null;
  if (dayjs.isDayjs(value)) return value.isValid() ? value.toDate() : null;
  if (typeof value === "object" && value !== null) {
    const candidate = value as { toDate?: () => unknown; getUTCDate?: () => unknown };
    const converted = typeof candidate.getUTCDate === "function" ? candidate.getUTCDate() : candidate.toDate?.();
    return converted instanceof Date && isValidDate(converted) ? converted : null;
  }
  if (typeof value === "string" || typeof value === "number") {
    const converted = new Date(value);
    return isValidDate(converted) ? converted : null;
  }
  return null;
}

export function normalizeIncludedDate(value: unknown): Date | null {
  const date = toDate(value);
  if (!date) return null;
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function toPickerTime(value: unknown): Moment | null {
  const date = toTimeDate(value);
  if (!date) return null;
  const result = moment(date);
  return result.isValid() ? result : null;
}

export function toTimeString(value: unknown): string | null {
  const date = toTimeDate(value);
  if (!date) return null;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function isSameDate(a: unknown, b: unknown): boolean {
  const first = toDate(a);
  const second = toDate(b);
  if (!first && !second) return true;
  return !!first && !!second && first.getTime() === second.getTime();
}

export function isSameTime(a: unknown, b: unknown): boolean {
  const first = toDate(a);
  const second = toDate(b);
  if (!first && !second) return true;
  return !!first && !!second && first.getHours() === second.getHours() && first.getMinutes() === second.getMinutes() && first.getSeconds() === second.getSeconds() && first.getMilliseconds() === second.getMilliseconds();
}

export function minDate(a: Date | null | undefined, b: Date | null | undefined): Date | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a.getTime() <= b.getTime() ? a : b;
}

export function maxDate(a: Date | null | undefined, b: Date | null | undefined): Date | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

export function minTime(a: unknown, b: unknown): Moment | null {
  const first = toDate(a);
  const second = toDate(b);
  if (!first) return toPickerTime(second);
  if (!second) return toPickerTime(first);
  return timeOfDay(first) <= timeOfDay(second) ? toPickerTime(first) : toPickerTime(second);
}

export function maxTime(a: unknown, b: unknown): Moment | null {
  const first = toDate(a);
  const second = toDate(b);
  if (!first) return toPickerTime(second);
  if (!second) return toPickerTime(first);
  return timeOfDay(first) >= timeOfDay(second) ? toPickerTime(first) : toPickerTime(second);
}

function toTimeDate(value: unknown): Date | null {
  if (typeof value !== "string") return toDate(value);
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return toDate(value);
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");
  const meridiem = (match[4] ?? "").toUpperCase();
  if (minutes > 59 || seconds > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "AM") { if (hours === 12) hours = 0; }
    else if (hours !== 12) hours += 12;
  } else if (hours > 23) return null;
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

function timeOfDay(value: Date): number { return (((value.getHours() * 60 + value.getMinutes()) * 60 + value.getSeconds()) * 1000) + value.getMilliseconds(); }

function isValidDate(value: Date): boolean { return !Number.isNaN(value.valueOf()); }
