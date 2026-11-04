export type NgxMatNotificationLevel =
  | "info"
  | "success"
  | "warn"
  | "error"
  | null;
export type NgxMatNotificationStatus = "queued" | "wip" | "done" | "error";

export interface NgxMatNotificationOptions {
  id?: string;
  level?: NgxMatNotificationLevel;
  info?: string;
  error?: string;
  icon?: string;
  /** Accessible dismiss button label. */
  closeLabel?: string;
  progressLabel?: string;
  color?: string;
  /** Milliseconds; null or nonpositive values keep the notification visible. */
  duration?: number | null;
  /** Opt in to Angular-sanitized HTML for message, info and error. */
  html?: boolean;
  status?: NgxMatNotificationStatus;
  /** Fraction between 0 and 1. */
  progress?: number;
}
export interface NgxMatNotificationData extends NgxMatNotificationOptions {
  id: string;
  message: string;
}
export interface NgxMatTaskNotificationOptions
  extends NgxMatNotificationOptions {
  message: string;
  status: NgxMatNotificationStatus;
}
export interface NgxMatNotificationRef {
  readonly id: string;
  update(changes: Partial<Omit<NgxMatNotificationData, "id">>): void;
  dismiss(): void;
}

export interface NgxMatNotificationCountdown {
  remaining: number;
  duration: number;
  paused: boolean;
}
