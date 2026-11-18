import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  linkedSignal,
} from "@angular/core";
import { Md5 } from "ts-md5";

const avatarColors = [
  "#1abc9c",
  "#3498db",
  "#f1c40f",
  "#8e44ad",
  "#e74c3c",
  "#d35400",
  "#2c3e50",
  "#7f8c8d",
];

@Component({
  selector: "app-avatar",
  standalone: true,
  templateUrl: "./avatar.component.html",
  styleUrl: "./avatar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[style.border-radius]": 'round() ? "50%" : "0"' },
})
export class AvatarComponent {
  readonly email = input<string | null | undefined>();
  readonly name = input<string | null | undefined>();
  readonly value = input<string | null | undefined>();
  readonly size = input(50, { transform: numberAttribute });
  readonly round = input(true, { transform: booleanAttribute });
  readonly bgColor = input<string | null | undefined>();
  readonly fgColor = input("var(--ngx-mat-avatar-color, #FFF)");
  readonly textSizeRatio = input(3, { transform: numberAttribute });
  readonly displaySize = computed(() =>
    Number.isFinite(this.size()) && this.size() > 0 ? this.size() : 50,
  );
  readonly avatarText = computed(() => {
    const name = this.name()?.trim();
    return name
      ? name
          .split(/\s+/)
          .map((part) => part[0].toUpperCase())
          .join("")
      : (this.value() ?? "");
  });
  readonly backgroundColor = computed(() => {
    if (this.bgColor()) return this.bgColor()!;
    const text = this.name()?.trim() ? this.name()! : (this.value() ?? "");
    if (!text) return "var(--ngx-mat-avatar-background, transparent)";
    const sum = text
      .split("")
      .reduce((total, character) => total + character.charCodeAt(0), 0);
    const index = sum % avatarColors.length;
    return `var(--ngx-mat-avatar-background, var(--ngx-mat-avatar-palette-${index + 1}, ${avatarColors[index]}))`;
  });
  readonly fontSize = computed(() => {
    const ratio = this.textSizeRatio();
    return Math.floor(
      this.displaySize() / (Number.isFinite(ratio) && ratio > 0 ? ratio : 3),
    );
  });
  readonly imageUrl = computed(() => {
    const email = this.email()?.trim().toLowerCase();
    const imageSize =
      typeof window !== "undefined" && window.devicePixelRatio > 1.25
        ? this.displaySize() * 2
        : this.displaySize();
    return email
      ? `https://secure.gravatar.com/avatar/${Md5.hashStr(email)}?s=${imageSize}&d=404`
      : null;
  });
  readonly imageFailed = linkedSignal({
    source: this.imageUrl,
    computation: (): boolean => false,
  });

  onImageError(): void {
    this.imageFailed.set(true);
  }
}
