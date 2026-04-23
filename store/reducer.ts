import type { ComparisonState, ComparisonAction } from "./types";

export const initialState: ComparisonState = {
  selectedIds: [],
  devices: {},
  enabledCategories: [],
  highlightDiffs: true,
  sortKey: "selected",
};

export function comparisonReducer(
  state: ComparisonState,
  action: ComparisonAction
): ComparisonState {
  switch (action.type) {
    case "ADD_DEVICE": {
      if (state.selectedIds.includes(action.id)) return state;
      return {
        ...state,
        selectedIds: [...state.selectedIds, action.id],
        devices: { ...state.devices, [action.id]: action.device },
      };
    }

    case "REMOVE_DEVICE": {
      const { [action.id]: _, ...rest } = state.devices;
      return {
        ...state,
        selectedIds: state.selectedIds.filter((id) => id !== action.id),
        devices: rest,
      };
    }

    case "CLEAR_ALL":
      return { ...state, selectedIds: [], devices: {} };

    case "TOGGLE_CATEGORY": {
      const exists = state.enabledCategories.includes(action.categoryId);
      return {
        ...state,
        enabledCategories: exists
          ? state.enabledCategories.filter((id) => id !== action.categoryId)
          : [...state.enabledCategories, action.categoryId],
      };
    }

    case "ENABLE_ALL_CATEGORIES":
      return { ...state, enabledCategories: action.categoryIds };

    case "DISABLE_ALL_CATEGORIES":
      return { ...state, enabledCategories: [] };

    case "TOGGLE_HIGHLIGHT":
      return { ...state, highlightDiffs: !state.highlightDiffs };

    case "SET_SORT":
      return { ...state, sortKey: action.sortKey };

    case "RESTORE":
      return { ...state, ...action.state };

    default:
      return state;
  }
}
