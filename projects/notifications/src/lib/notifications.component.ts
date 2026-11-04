import {
  ChangeDetectionStrategy,
  Component,
  input,
  effect,
  output,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {
  NgxMatNotificationData,
  NgxMatNotificationCountdown,
} from "./notification";

@Component({
  selector: "ngx-mat-notifications",
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: "./notifications.component.html",
  styleUrl: "./notifications.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxMatNotificationsComponent {
  readonly notifications = input<readonly NgxMatNotificationData[]>([]);
  readonly countdowns = input<
    Readonly<Record<string, NgxMatNotificationCountdown>>
  >({});
  readonly dismiss = output<string>();
  readonly pause = output<string>();
  readonly resume = output<string>();
  private readonly pauseReasons = new Map<string, Set<string>>();
  constructor() {
    effect(() => {
      const ids = new Set(
        this.notifications().map((notification) => notification.id),
      );
      for (const id of this.pauseReasons.keys()) {
        if (!ids.has(id)) this.pauseReasons.delete(id);
      }
    });
  }

  clearPause(id: string): void {
    this.pauseReasons.delete(id);
  }

  focusLeft(id: string, event: FocusEvent): void {
    const article = event.currentTarget as HTMLElement;
    if (
      event.relatedTarget instanceof Node &&
      article.contains(event.relatedTarget)
    )
      return;
    this.resumeFor(id, "focus");
  }

  pauseFor(id: string, reason: "hover" | "focus"): void {
    const reasons = this.pauseReasons.get(id) ?? new Set<string>();
    if (!reasons.size) this.pause.emit(id);
    reasons.add(reason);
    this.pauseReasons.set(id, reasons);
  }
  resumeFor(id: string, reason: "hover" | "focus"): void {
    const reasons = this.pauseReasons.get(id);
    reasons?.delete(reason);
    if (!reasons?.size) {
      this.pauseReasons.delete(id);
      this.resume.emit(id);
    }
  }
}
