import { Observable, Subject, Subscription } from "rxjs";

/** Router-free, stable identifiers for the content actually displayed by a dialog. */
export interface DialogNavigationState {
  tab?: string;
  section?: string;
}

export interface DialogNavigationOptions {
  initialState?: DialogNavigationState;
  stateChanges?: Observable<DialogNavigationState>;
  onChange?: (state: DialogNavigationState) => void;
}

/** Shared root-tab adapter. Embedded content receives a section-only child adapter. */
export class DialogNavigationController {
  selectedIndex = 0;
  private generation = 0;
  private options?: DialogNavigationOptions;
  private state: DialogNavigationState = {};
  private tabs: Array<string | undefined> = [];
  private tabsReady = false;
  private subscription?: Subscription;
  private readonly children = new Map<
    string | undefined,
    {
      options: DialogNavigationOptions;
      changes: Subject<DialogNavigationState>;
    }
  >();

  bind(
    options: DialogNavigationOptions | undefined,
    onRestore: () => void = () => {},
  ): void {
    this.destroy();
    this.options = options;
    this.state = { ...options?.initialState };
    this.subscription = options?.stateChanges?.subscribe((state) => {
      this.state = { ...state };
      this.resolveTab();
      this.restoreChildren();
      onRestore();
    });
  }

  setTabs(tabs: Array<string | undefined>, defaultIndex = 0): void {
    const firstTabs = !this.tabs.length;
    this.tabs = tabs;
    this.tabsReady = true;
    if (!this.options) {
      if (firstTabs) this.selectedIndex = defaultIndex;
      return;
    }
    this.resolveTab();
  }

  selectTab(index: number): void {
    if (index === this.selectedIndex || index < 0 || index >= this.tabs.length)
      return;
    this.selectedIndex = index;
    this.state = { tab: this.tabs[index] };
    this.restoreChildren();
    this.options?.onChange?.({ ...this.state });
  }

  child(tab?: string): DialogNavigationOptions | undefined {
    if (!this.options) return undefined;
    let child = this.children.get(tab);
    if (!child) {
      const changes = new Subject<DialogNavigationState>();
      const generation = this.generation;
      child = {
        changes,
        options: {
          initialState: this.childState(tab),
          stateChanges: changes,
          onChange: (state) => {
            if (generation !== this.generation || tab !== this.state.tab)
              return;
            const next = {
              ...(tab ? { tab } : {}),
              ...(state.section ? { section: state.section } : {}),
            };
            if (
              next.tab === this.state.tab &&
              next.section === this.state.section
            )
              return;
            this.state = next;
            this.restoreChildren();
            this.options?.onChange?.({ ...next });
          },
        },
      };
      this.children.set(tab, child);
    }
    return child.options;
  }

  destroy(): void {
    this.generation++;
    this.subscription?.unsubscribe();
    this.children.forEach((child) => child.changes.complete());
    this.children.clear();
    this.tabs = [];
    this.tabsReady = false;
  }

  private resolveTab(): void {
    if (!this.tabs.length) {
      if (this.tabsReady && this.state.tab !== undefined) {
        this.state = this.state.section ? { section: this.state.section } : {};
        this.selectedIndex = 0;
        this.restoreChildren();
        this.options?.onChange?.({ ...this.state });
      }
      return;
    }
    const index = this.tabs.findIndex((id) => id === this.state.tab);
    this.selectedIndex = Math.max(0, index);
    const tab = this.tabs[this.selectedIndex];
    if (tab === this.state.tab) return;
    this.state = { ...this.state, tab };
    this.restoreChildren();
    this.options?.onChange?.({ ...this.state });
  }

  private childState(tab?: string): DialogNavigationState {
    return tab === this.state.tab && this.state.section
      ? { section: this.state.section }
      : {};
  }

  private restoreChildren(): void {
    this.children.forEach((child, tab) => {
      const state = this.childState(tab);
      child.options.initialState = state;
      child.changes.next(state);
    });
  }
}
