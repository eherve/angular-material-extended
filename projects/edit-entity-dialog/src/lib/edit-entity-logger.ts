import { InjectionToken, isDevMode } from "@angular/core";

export interface EditEntityLogger {
  debug(message: string, updates: Readonly<Record<string, unknown>>): void;
}

/** Override this token to route detected form changes to an application logger. */
export const EDIT_ENTITY_LOGGER = new InjectionToken<EditEntityLogger>(
  "EDIT_ENTITY_LOGGER",
  {
    providedIn: "root",
    factory: () => ({
      debug(message, updates): void {
        if (isDevMode()) console.debug(message, updates);
      },
    }),
  },
);
