import { signal } from "@angular/core";
import { deburr } from "lodash-es";
import { readProperty } from "../value.helpers";

export type SearchFunction<T> = (
  limit: number,
  skip: number,
  search: string,
  selected?: T | T[],
) => Promise<{ data: T[]; matchCount: number }>;
export function sameSearchValue(a: unknown, b: unknown): boolean {
  const id = readProperty(a, "_id");
  return typeof id === "string" && id.length > 0
    ? id === readProperty(b, "_id")
    : a === b;
}
/** Each control owns this state; promises are invalidated before the next debounce. */
export class SearchState<T> {
  readonly options = signal<T[]>([]);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly matchCount = signal(0);
  readonly hasMore = signal(false);
  private revision = 0;
  private skip = 0;
  private text = "";
  private destroyed = false;
  private active = false;
  constructor(
    private request: SearchFunction<T>,
    private selected: () => T | T[] | undefined = () => undefined,
    public limit = 10,
  ) {}
  invalidate(): void {
    this.revision++;
    this.active = false;
    this.hasMore.set(false);
    this.loading.set(false);
  }
  async search(text: string): Promise<void> {
    this.invalidate();
    this.active = true;
    this.text = deburr(text.trim().toLowerCase());
    this.skip = 0;
    this.options.set([]);
    this.matchCount.set(0);
    this.hasMore.set(false);
    await this.fetch(this.revision);
  }
  async more(): Promise<void> {
    if (
      !this.active ||
      this.loading() ||
      this.skip >= this.matchCount() ||
      this.destroyed
    )
      return;
    await this.fetch(this.revision);
  }
  destroy(): void {
    this.destroyed = true;
    this.invalidate();
  }
  private async fetch(revision: number): Promise<void> {
    if (this.destroyed) return;
    this.loading.set(true);
    this.failed.set(false);
    try {
      const result = await this.request(
        this.limit,
        this.skip,
        this.text,
        this.selected(),
      );
      if (revision !== this.revision || this.destroyed) return;
      this.skip += this.limit;
      this.matchCount.set(result.matchCount);
      this.hasMore.set(this.skip < result.matchCount);
      this.options.update((previous) =>
        result.data.reduce(
          (all, item) => {
            if (!all.some((existing) => sameSearchValue(existing, item)))
              all.push(item);
            return all;
          },
          [...previous],
        ),
      );
    } catch {
      if (revision === this.revision && !this.destroyed) this.failed.set(true);
    } finally {
      if (revision === this.revision && !this.destroyed)
        this.loading.set(false);
    }
  }
}
