import type { Device, SpecKey, SpecValueMap } from "@/types/device";
import type { SpecField } from "@/types/spec";
import { isNumericField } from "@/types/spec";

// ===== 差分結果型 =====

export type DiffResult = "best" | "worst" | "same" | "neutral";

// ===== 型安全なスペック値取得（asキャスト不要） =====

export function getSpecValue<K extends SpecKey>(
  device: Device,
  key: K
): SpecValueMap[K] | null {
  return device.specs[key] ?? null;
}

// ===== 数値差分判定（内部ヘルパー） =====

function compareNumericValues(
  values: (number | null)[],
  higherIsBetter: boolean
): DiffResult[] {
  const valid = values.filter((v): v is number => v !== null);

  if (valid.length < 2) {
    return values.map(() => "neutral");
  }

  const best = higherIsBetter ? Math.max(...valid) : Math.min(...valid);
  const worst = higherIsBetter ? Math.min(...valid) : Math.max(...valid);

  if (best === worst) {
    return values.map((v) => (v === null ? "neutral" : "same"));
  }

  return values.map((v) => {
    if (v === null) return "neutral";
    if (v === best) return "best";
    if (v === worst) return "worst";
    return "same";
  });
}

// ===== 差分戦略（タイプ別・拡張容易） =====

type DiffStrategy = (devices: Device[], field: SpecField) => DiffResult[];

const numericStrategy: DiffStrategy = (devices, field) => {
  if (!isNumericField(field) || field.higherIsBetter === undefined) {
    return devices.map(() => "neutral");
  }
  const values = devices.map((d) => {
    const v = getSpecValue(d, field.key);
    return typeof v === "number" ? v : null;
  });
  return compareNumericValues(values, field.higherIsBetter);
};

const booleanStrategy: DiffStrategy = (devices, field) => {
  const values = devices.map((d) => {
    const v = getSpecValue(d, field.key);
    return typeof v === "boolean" ? v : null;
  });
  const hasTrue = values.some((v) => v === true);
  const hasFalse = values.some((v) => v === false);
  if (hasTrue && hasFalse) {
    return values.map((v) => {
      if (v === null) return "neutral";
      return v ? "best" : "worst";
    });
  }
  return values.map((v) => (v === null ? "neutral" : "same"));
};

const diffStrategies: Partial<Record<SpecField["type"], DiffStrategy>> = {
  number: numericStrategy,
  boolean: booleanStrategy,
};

// ===== 1フィールドの差分計算 =====

export function computeFieldDiff(
  devices: Device[],
  field: SpecField
): DiffResult[] {
  const strategy = diffStrategies[field.type];
  if (!strategy) return devices.map(() => "neutral");
  return strategy(devices, field);
}

// ===== 並び替え（asキャスト排除済み） =====

export type SortKey = "selected" | "releaseDate" | "price";

export function sortDevices(
  devices: Device[],
  sortKey: SortKey,
  selectedOrder: readonly string[]
): Device[] {
  switch (sortKey) {
    case "selected":
      return [...devices].sort(
        (a, b) => selectedOrder.indexOf(a.id) - selectedOrder.indexOf(b.id)
      );
    case "releaseDate":
      return [...devices].sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    case "price": {
      return [...devices].sort((a, b) => {
        const pa = getSpecValue(a, "basic.price") ?? Infinity;
        const pb = getSpecValue(b, "basic.price") ?? Infinity;
        return pa - pb;
      });
    }
    default:
      return devices;
  }
}
