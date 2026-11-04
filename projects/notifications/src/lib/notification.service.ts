import { isPlatformBrowser } from "@angular/common";
import {
  ComponentRef,
  Injectable,
  InjectionToken,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
} from "@angular/core";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  NgxMatNotificationData,
  NgxMatNotificationCountdown,
  NgxMatNotificationOptions,
  NgxMatNotificationRef,
  NgxMatTaskNotificationOptions,
} from "./notification";
import { NgxMatNotificationsComponent } from "./notifications.component";

export interface NgxMatNotificationConfig {
  top?: string;
  right?: string;
  closeLabel?: string;
  progressLabel?: string;
}
export const NGX_MAT_NOTIFICATION_CONFIG =
  new InjectionToken<NgxMatNotificationConfig>("NGX_MAT_NOTIFICATION_CONFIG", {
    factory: () => ({ top: "8px", right: "8px" }),
  });

interface TimerState {
  timer?: ReturnType<typeof setTimeout>;
  remaining: number;
  duration: number;
  started: number;
  paused: boolean;
}

@Injectable({ providedIn: "root" })
export class NgxMatNotificationService implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly items = signal<readonly NgxMatNotificationData[]>([]);
  readonly notifications = this.items.asReadonly();
  private overlayRef?: OverlayRef;
  private componentRef?: ComponentRef<NgxMatNotificationsComponent>;
  private readonly timers = new Map<string, TimerState>();
  private nextId = 0;
  private nextGeneration = 0;
  private readonly generations = new Map<string, number>();
  private readonly pausedIds = new Set<string>();
  private readonly config = inject(NGX_MAT_NOTIFICATION_CONFIG);

  open(
    message: string,
    options: NgxMatNotificationOptions = {},
  ): NgxMatNotificationRef {
    let id = options.id;
    if (id === undefined) {
      do {
        id = `ngx-mat-notification-${++this.nextId}`;
      } while (this.items().some((item) => item.id === id));
    }
    const generation = ++this.nextGeneration;
    this.generations.set(id, generation);
    const notification = {
      duration: 2000,
      closeLabel: this.config.closeLabel,
      progressLabel: this.config.progressLabel,
      ...options,
      id,
      message,
    };
    const existing = this.items().findIndex((item) => item.id === id);
    this.items.update((items) =>
      existing < 0
        ? [notification, ...items]
        : items.map((item) => (item.id === id ? notification : item)),
    );
    this.sync();
    this.restartTimer(notification);
    this.syncCountdowns();
    return {
      id,
      update: (changes) => {
        if (this.generations.get(id) === generation) this.update(id, changes);
      },
      dismiss: () => {
        if (this.generations.get(id) === generation) this.dismiss(id);
      },
    };
  }
  info(
    message: string,
    options: NgxMatNotificationOptions = {},
  ): NgxMatNotificationRef {
    return this.open(message, { level: "info", icon: "info", ...options });
  }
  success(
    message: string,
    options: NgxMatNotificationOptions = {},
  ): NgxMatNotificationRef {
    return this.open(message, {
      level: "success",
      icon: "check_circle",
      ...options,
    });
  }
  warn(
    message: string,
    options: NgxMatNotificationOptions = {},
  ): NgxMatNotificationRef {
    return this.open(message, {
      level: "warn",
      icon: "warning",
      duration: null,
      ...options,
    });
  }
  error(
    message: string,
    options: NgxMatNotificationOptions = {},
  ): NgxMatNotificationRef {
    return this.open(message, {
      level: "error",
      icon: "error",
      duration: null,
      ...options,
    });
  }
  task(options: NgxMatTaskNotificationOptions): NgxMatNotificationRef {
    return this.open(options.message, { duration: 1000, ...options });
  }
  update(
    id: string,
    changes: Partial<Omit<NgxMatNotificationData, "id">>,
  ): void {
    const current = this.items().find((item) => item.id === id);
    if (!current) return;
    const updated = { ...current, ...changes, id };
    this.items.update((items) =>
      items.map((item) => (item.id === id ? updated : item)),
    );
    this.sync();
    this.restartTimer(updated);
    this.syncCountdowns();
  }
  dismiss(id: string): void {
    this.componentRef?.instance.clearPause(id);
    this.clearTimer(id);
    this.pausedIds.delete(id);
    this.generations.delete(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
    this.sync();
  }
  dismissAll(): void {
    for (const id of this.timers.keys()) this.clearTimer(id);
    this.pausedIds.clear();
    this.generations.clear();
    this.items.set([]);
    this.sync();
  }
  ngOnDestroy(): void {
    this.dismissAll();
  }

  private sync(): void {
    if (!this.browser) return;
    if (!this.items().length) {
      this.overlayRef?.dispose();
      this.overlayRef = undefined;
      this.componentRef = undefined;
      return;
    }
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .global()
          .top(this.config.top ?? "8px")
          .right(this.config.right ?? "8px"),
        scrollStrategy: this.overlay.scrollStrategies.noop(),
        hasBackdrop: false,
      });
      this.componentRef = this.overlayRef.attach(
        new ComponentPortal(NgxMatNotificationsComponent, null, this.injector),
      );
      this.componentRef.instance.dismiss.subscribe((id) => this.dismiss(id));
      this.componentRef.instance.pause.subscribe((id) => this.pauseTimer(id));
      this.componentRef.instance.resume.subscribe((id) => this.resumeTimer(id));
    }
    this.componentRef?.setInput("notifications", this.items());
  }
  private restartTimer(notification: NgxMatNotificationData): void {
    const paused = this.pausedIds.has(notification.id);
    this.clearTimer(notification.id);
    if (
      !this.browser ||
      !notification.duration ||
      notification.duration <= 0 ||
      (notification.status != null && notification.status !== "done")
    )
      return;
    const state: TimerState = {
      remaining: notification.duration,
      duration: notification.duration,
      started: Date.now(),
      paused,
    };
    this.timers.set(notification.id, state);
    if (!paused) this.schedule(notification.id, state);
  }
  private schedule(id: string, state: TimerState): void {
    state.started = Date.now();
    state.timer = setTimeout(() => this.dismiss(id), state.remaining);
  }
  private pauseTimer(id: string): void {
    this.pausedIds.add(id);
    const state = this.timers.get(id);
    if (!state || state.paused) return;
    clearTimeout(state.timer);
    state.remaining = Math.max(
      0,
      state.remaining - (Date.now() - state.started),
    );
    state.paused = true;
    this.syncCountdowns();
  }
  private resumeTimer(id: string): void {
    this.pausedIds.delete(id);
    const state = this.timers.get(id);
    if (!state?.paused) return;
    state.paused = false;
    this.schedule(id, state);
    this.syncCountdowns();
  }
  private syncCountdowns(): void {
    const countdowns: Record<string, NgxMatNotificationCountdown> = {};
    for (const [id, state] of this.timers)
      countdowns[id] = {
        remaining: state.paused
          ? state.remaining
          : Math.max(0, state.remaining - (Date.now() - state.started)),
        duration: state.duration,
        paused: state.paused,
      };
    this.componentRef?.setInput("countdowns", countdowns);
  }
  private clearTimer(id: string): void {
    clearTimeout(this.timers.get(id)?.timer);
    this.timers.delete(id);
  }
}
