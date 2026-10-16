/** @format */

import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from "@angular/animations";
import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  ErrorHandler,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { SectionTabsIntl } from "./section-tabs-intl";
import { SECTION_SELECTION_HANDLER } from "./section-selection-handler";
import {
  SectionTabComponent,
  SectionTabCounter,
  SectionTabType,
} from "./section-tab.component";
import { SectionTabsFooterDirective } from "./directives/section-tabs-footer.directive";
import { SectionTabsMenuHeaderDirective } from "./directives/section-tabs-menu-header.directive";

export interface SectionTabItem {
  tab: SectionTabComponent;
  type: SectionTabType;
  index: number;
  renderIndex: number;
  queryParamValue?: string;
  selected: boolean;
  disabled: boolean;
  buttonId: string;
  panelId: string;
  statusDoneLabel?: string;
  statusTotalLabel?: string;
  progress?: number;
  labelTemplate?: TemplateRef<unknown>;
  contentTemplate?: TemplateRef<unknown>;
}

export const sectionTabsSlideTopTransitions = [
  query(
    ":enter, :leave",
    style({
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "auto",
    }),
    {
      optional: true,
    },
  ),
  group([
    query(
      ":enter",
      [
        style({ opacity: 0, transform: "translateY(100%)" }),
        animate(
          ".3s ease-out",
          style({ opacity: 1, transform: "translateY(0%)" }),
        ),
      ],
      { optional: true },
    ),
    query(
      ":leave",
      [
        style({ opacity: 1, transform: "translateY(0%)" }),
        animate(
          ".3s ease-out",
          style({ opacity: 0, transform: "translateY(-100%)" }),
        ),
      ],
      { optional: true },
    ),
  ]),
];

export const sectionTabsSlideBottomTransitions = [
  query(
    ":enter, :leave",
    style({
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "auto",
    }),
    {
      optional: true,
    },
  ),
  group([
    query(
      ":enter",
      [
        style({ opacity: 0, transform: "translateY(-100%)" }),
        animate(
          ".3s ease-out",
          style({ opacity: 1, transform: "translateY(0%)" }),
        ),
      ],
      { optional: true },
    ),
    query(
      ":leave",
      [
        style({ opacity: 1, transform: "translateY(0%)" }),
        animate(
          ".3s ease-out",
          style({ opacity: 0, transform: "translateY(100%)" }),
        ),
      ],
      { optional: true },
    ),
  ]),
];

@Component({
  selector: "app-section-tabs",
  templateUrl: "./section-tabs.component.html",
  styleUrl: "./section-tabs.component.scss",
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [
    trigger("sectionTabsContentTransition", [
      transition(":increment", sectionTabsSlideTopTransitions),
      transition(":decrement", sectionTabsSlideBottomTransitions),
    ]),
  ],
})
export class SectionTabsComponent
  implements AfterContentInit, OnChanges, OnDestroy
{
  private static nextId = 0;

  @Input() selectedIndex = 0;
  @Input() queryParamKey?: string;

  @Output() selectedIndexChange = new EventEmitter<number>();

  @ContentChildren(SectionTabComponent, { descendants: true })
  private tabComponents!: QueryList<SectionTabComponent>;

  @ContentChild(SectionTabsMenuHeaderDirective)
  private menuHeaderDirective?: SectionTabsMenuHeaderDirective;

  @ContentChild(SectionTabsFooterDirective)
  private footerDirective?: SectionTabsFooterDirective;

  readonly intl = inject(SectionTabsIntl);

  readonly instanceId = `section-tabs-${SectionTabsComponent.nextId++}`;

  tabItems: SectionTabItem[] = [];
  activeTabItems: SectionTabItem[] = [];
  selectedTabItem?: SectionTabItem;
  menuHeaderTemplate?: TemplateRef<unknown>;
  footerTemplate?: TemplateRef<unknown>;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly handler = inject(SECTION_SELECTION_HANDLER, {
    optional: true,
  });
  private readonly errorHandler = inject(ErrorHandler);
  private handlerSubscription?: Subscription;
  private handlerGeneration = 0;
  private externalValue: string | null = null;
  private readonly subscriptions = new Subscription();
  private tabStateSubscriptions = new Subscription();
  private contentInitialized = false;

  ngAfterContentInit(): void {
    this.contentInitialized = true;
    this.subscriptions.add(
      this.intl.changes.subscribe(() => this.changeDetectorRef.markForCheck()),
    );
    this.refreshProjectedTemplates();
    this.refreshTabItems();
    this.synchronizeSelectionWithQueryParameter();
    this.bindSelectionHandler();
    this.subscriptions.add(
      this.tabComponents.changes.subscribe((): void => this.handleTabsChange()),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.contentInitialized) return;
    if (changes["queryParamKey"]) {
      this.bindSelectionHandler();
      this.synchronizeSelectionWithQueryParameter();
      return;
    }
    if (!changes["selectedIndex"]) return;
    this.synchronizeSelectionWithQueryParameter();
  }

  ngOnDestroy(): void {
    this.handlerGeneration++;
    this.handlerSubscription?.unsubscribe();
    this.subscriptions.unsubscribe();
    this.tabStateSubscriptions.unsubscribe();
  }

  selectTab(tabItem: SectionTabItem): void {
    if (!this.isSelectableTabItem(tabItem)) return;
    this.applySelectedIndex(tabItem.index, true);
    this.updateQueryParameter(tabItem);
  }

  private handleTabsChange(): void {
    this.refreshProjectedTemplates();
    this.refreshTabItems();
    this.synchronizeSelectionWithQueryParameter();
  }

  private handleTabStateChange(): void {
    this.refreshTabItems(false);
    this.synchronizeSelectionWithQueryParameter();
  }

  private refreshProjectedTemplates(): void {
    this.menuHeaderTemplate = this.menuHeaderDirective?.templateRef;
    this.footerTemplate = this.footerDirective?.templateRef;
  }

  private refreshTabItems(refreshSubscriptions = true): void {
    const tabs = this.tabComponents?.toArray() ?? [];
    this.tabItems = this.buildTabItems(tabs);
    if (refreshSubscriptions) this.refreshTabStateSubscriptions(tabs);
  }

  private buildTabItems(tabs: SectionTabComponent[]): SectionTabItem[] {
    let buttonIndex = 0;
    return tabs.map((tab, renderIndex): SectionTabItem => {
      const index = tab.type === "separator" ? -1 : buttonIndex++;
      return this.buildTabItem(tab, index, renderIndex);
    });
  }

  private refreshTabStateSubscriptions(tabs: SectionTabComponent[]): void {
    this.tabStateSubscriptions.unsubscribe();
    const subscription = new Subscription();
    tabs.forEach((tab): void => {
      subscription.add(
        tab.stateChanges.subscribe((): void => this.handleTabStateChange()),
      );
    });
    this.tabStateSubscriptions = subscription;
  }

  private buildTabItem(
    tab: SectionTabComponent,
    index: number,
    renderIndex: number,
  ): SectionTabItem {
    const isButton = tab.type === "button";

    return {
      tab,
      type: tab.type,
      index,
      renderIndex,
      queryParamValue: isButton ? tab.queryParamValue : undefined,
      selected: isButton && index === this.selectedIndex,
      disabled: isButton && tab.disabled,
      buttonId: `${this.instanceId}-button-${renderIndex}`,
      panelId: `${this.instanceId}-panel-${renderIndex}`,
      statusDoneLabel: isButton ? this.buildDoneLabel(tab.done) : undefined,
      statusTotalLabel: isButton
        ? this.buildTotalLabel(tab.done, tab.total, tab.totalMax)
        : undefined,
      progress:
        tab.progress && isButton
          ? this.buildProgress(tab.done, tab.total)
          : undefined,
      labelTemplate: tab.labelDirective?.templateRef,
      contentTemplate: isButton ? tab.contentDirective?.templateRef : undefined,
    };
  }

  private synchronizeSelectionWithQueryParameter(): void {
    const queryParamValue = this.getQueryParameterValue();
    if (queryParamValue === null) {
      this.applySelectedIndex(this.selectedIndex, false);
      return;
    }

    const queryParamTabItem = this.tabItems.find(
      (tabItem): boolean => tabItem.queryParamValue === queryParamValue,
    );
    if (!queryParamTabItem || !this.isSelectableTabItem(queryParamTabItem)) {
      this.applySelectedIndex(this.selectedIndex, false);
      return;
    }

    this.applySelectedIndex(queryParamTabItem.index, true);
  }

  private bindSelectionHandler(): void {
    const generation = ++this.handlerGeneration;
    this.handlerSubscription?.unsubscribe();
    this.externalValue = null;
    const key = this.queryParamKey;
    if (!this.handler || !key?.trim()) return;
    try {
      this.handlerSubscription = this.handler.observe(key).subscribe({
        next: (value): void => {
          if (generation !== this.handlerGeneration) return;
          this.externalValue = value;
          this.synchronizeSelectionWithQueryParameter();
          this.changeDetectorRef.markForCheck();
        },
        error: (error: unknown): void => {
          if (generation === this.handlerGeneration)
            this.errorHandler.handleError(error);
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  private getQueryParameterValue(): string | null {
    return this.externalValue;
  }

  private updateQueryParameter(tabItem: SectionTabItem): void {
    const key = this.queryParamKey;
    const value = tabItem.queryParamValue;
    if (
      !this.handler ||
      !key?.trim() ||
      value === undefined ||
      value === this.externalValue
    )
      return;
    try {
      const result = this.handler.select(key, value);
      if (result)
        void Promise.resolve(result).catch((error: unknown): void =>
          this.errorHandler.handleError(error),
        );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  private buildDoneLabel(done: SectionTabCounter): string | undefined {
    return this.hasCounterValue(done) ? `${done}` : undefined;
  }

  private buildTotalLabel(
    done: SectionTabCounter,
    total: SectionTabCounter,
    totalMax: SectionTabCounter,
  ): string | undefined {
    if (!this.hasCounterValue(done) || !this.hasCounterValue(total))
      return undefined;
    return `/${this.buildDisplayedTotal(total, totalMax)}`;
  }

  private buildDisplayedTotal(
    total: SectionTabCounter,
    totalMax: SectionTabCounter,
  ): string {
    const numericTotal = this.toNumericCounter(total);
    const numericTotalMax = this.toNumericCounter(totalMax);
    if (
      numericTotal !== undefined &&
      numericTotalMax !== undefined &&
      numericTotal > numericTotalMax
    ) {
      return `+${numericTotalMax}`;
    }
    return `${total}`;
  }

  private toNumericCounter(value: SectionTabCounter): number | undefined {
    if (typeof value === "number")
      return Number.isFinite(value) ? value : undefined;
    if (typeof value !== "string" || value.trim() === "") return undefined;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }

  private buildProgress(
    done: SectionTabCounter,
    total: SectionTabCounter,
  ): number | undefined {
    if (typeof done !== "number" || typeof total !== "number" || total <= 0)
      return undefined;
    return Math.min(Math.max((done / total) * 100, 0), 100);
  }

  private hasCounterValue(value: SectionTabCounter): boolean {
    return value !== undefined && value !== null && value !== "";
  }

  private applySelectedIndex(index: number, emitChange: boolean): void {
    const selectedIndex = this.getSafeSelectedIndex(index);
    if (selectedIndex === undefined) {
      this.clearSelection();
      return;
    }

    const selectionChanged =
      this.selectedIndex !== selectedIndex ||
      this.selectedTabItem?.index !== selectedIndex;
    this.selectedIndex = selectedIndex;
    this.refreshSelection();
    if (emitChange && selectionChanged)
      this.selectedIndexChange.emit(selectedIndex);
  }

  private getSafeSelectedIndex(index: number): number | undefined {
    const selectableTabItems = this.getSelectableTabItems();
    const requestedTabItem = selectableTabItems.find(
      (tabItem): boolean => tabItem.index === index,
    );
    if (requestedTabItem && !requestedTabItem.disabled)
      return requestedTabItem.index;
    return selectableTabItems.find((tabItem): boolean => !tabItem.disabled)
      ?.index;
  }

  private refreshSelection(): void {
    this.tabItems = this.tabItems.map(
      (tabItem): SectionTabItem => ({
        ...tabItem,
        selected:
          this.isButtonTabItem(tabItem) && tabItem.index === this.selectedIndex,
      }),
    );
    this.selectedTabItem = this.tabItems.find(
      (tabItem): boolean => tabItem.selected,
    );
    this.activeTabItems = this.selectedTabItem ? [this.selectedTabItem] : [];
  }

  private clearSelection(): void {
    this.tabItems = this.tabItems.map(
      (tabItem): SectionTabItem => ({ ...tabItem, selected: false }),
    );
    this.selectedTabItem = undefined;
    this.activeTabItems = [];
  }

  private getSelectableTabItems(): SectionTabItem[] {
    return this.tabItems.filter((tabItem): boolean =>
      this.isButtonTabItem(tabItem),
    );
  }

  private isSelectableTabItem(tabItem: SectionTabItem): boolean {
    return this.isButtonTabItem(tabItem) && !tabItem.disabled;
  }

  private isButtonTabItem(tabItem: SectionTabItem): boolean {
    return tabItem.type === "button";
  }
}
