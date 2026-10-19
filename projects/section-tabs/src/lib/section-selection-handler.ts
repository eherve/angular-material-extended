import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface SectionSelectionHandler {
  observe(key: string): Observable<string | null>;
  select(key: string, value: string): void | Promise<void>;
}

export const SECTION_SELECTION_HANDLER =
  new InjectionToken<SectionSelectionHandler>("SECTION_SELECTION_HANDLER");
