// ===== URL ↔ State 変換 =====
// ?devices=galaxy-s25-ultra,iphone-16-pro-max&diff=1

export interface UrlState {
  deviceIds: string[];
  highlightDiffs: boolean;
}

export function parseUrlParams(): UrlState {
  if (typeof window === "undefined") {
    return { deviceIds: [], highlightDiffs: true };
  }
  const params = new URLSearchParams(window.location.search);
  const devicesParam = params.get("devices");
  const diffParam = params.get("diff");

  return {
    deviceIds: devicesParam ? devicesParam.split(",").filter(Boolean) : [],
    highlightDiffs: diffParam !== "0",
  };
}

export function buildUrl(deviceIds: readonly string[], highlightDiffs: boolean): string {
  const params = new URLSearchParams();
  if (deviceIds.length > 0) {
    params.set("devices", deviceIds.join(","));
  }
  if (!highlightDiffs) {
    params.set("diff", "0");
  }
  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

export function pushUrl(deviceIds: readonly string[], highlightDiffs: boolean): void {
  if (typeof window === "undefined") return;
  const url = buildUrl(deviceIds, highlightDiffs);
  window.history.replaceState(null, "", url);
}
