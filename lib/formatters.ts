import type { CameraModule } from "@/types/device";
import type { SpecField } from "@/types/spec";

// ===== 数値フォーマット =====

export function formatNumber(value: number, format?: string): string {
  switch (format) {
    case "currency":
      return `¥${value.toLocaleString()}`;
    case "decimal1":
      return value.toFixed(1);
    case "aperture":
      return `f/${value}`;
    default:
      return value.toLocaleString();
  }
}

// ===== ストレージ配列 =====

export function formatStorageList(values: number[]): string {
  return values.map((v) => `${v}GB`).join(" / ");
}

// ===== カメラモジュール（構造化返却 — \n依存なし） =====

export interface FormattedCameraLine {
  text: string;
}

export function formatCameraModules(modules: CameraModule[]): FormattedCameraLine[] {
  return modules.map((m) => {
    let s = `${m.mp}MP ${m.label} f/${m.aperture}`;
    if (m.sensor) s += ` [${m.sensor}]`;
    if (m.ois) s += " OIS";
    if (m.zoom) s += ` ${m.zoom}x`;
    return { text: s };
  });
}

// ===== 汎用スペック値フォーマット（DefaultCell用） =====

export function formatSpecValue(value: unknown, field: SpecField): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "○" : "✕";

  if (typeof value === "number") {
    return formatNumber(value, field.format);
  }

  if (field.format === "storageList" && Array.isArray(value)) {
    // number[] ガード: 全要素がnumberか検証
    const nums = value.filter((v): v is number => typeof v === "number");
    return formatStorageList(nums);
  }

  // cameraModules は CameraModulesCell で構造化表示する
  // ここではフォールバック（フラット文字列）
  if (field.format === "cameraModules" && Array.isArray(value)) {
    // CameraModule[] ガード: label属性の存在で判別
    const modules = value.filter(
      (v): v is CameraModule => typeof v === "object" && v !== null && "label" in v
    );
    return formatCameraModules(modules)
      .map((l) => l.text)
      .join(" / ");
  }

  return String(value);
}

// ===== ブランド名 =====

const BRAND_NAMES: Record<string, string> = {
  samsung: "Samsung",
  apple: "Apple",
  google: "Google",
  sony: "Sony",
  sharp: "SHARP",
  xiaomi: "Xiaomi",
  oppo: "OPPO",
  asus: "ASUS",
  motorola: "Motorola",
  nothing: "Nothing",
};

export function formatBrandName(brandId: string): string {
  return BRAND_NAMES[brandId] ?? brandId;
}
