import type { Device } from "@/types/device";
import type { SortKey } from "@/lib/comparison";

export interface ComparisonState {
  readonly selectedIds: readonly string[];
  readonly devices: Readonly<Record<string, Device>>;
  readonly enabledCategories: readonly string[];
  readonly highlightDiffs: boolean;
  readonly sortKey: SortKey;
}

export type ComparisonAction =
  | { type: "ADD_DEVICE"; id: string; device: Device }
  | { type: "REMOVE_DEVICE"; id: string }
  | { type: "CLEAR_ALL" }
  | { type: "TOGGLE_CATEGORY"; categoryId: string }
  | { type: "ENABLE_ALL_CATEGORIES"; categoryIds: readonly string[] }
  | { type: "DISABLE_ALL_CATEGORIES" }
  | { type: "TOGGLE_HIGHLIGHT" }
  | { type: "SET_SORT"; sortKey: SortKey }
  | { type: "RESTORE"; state: Partial<ComparisonState> };
