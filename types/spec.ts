import type { SpecKey } from "./device";

// ===== format値をtype別に制限 =====

type NumericFormat = "currency" | "decimal1" | "aperture" | "updateYears" | "securityYears" | "updateTimeline";
type StringFormat = "carrier" | "bands" | "bandLock";
type ArrayFormat = "storageList";
type ObjectFormat = "cameraModules" | "carrierBandDetail";

// ===== SpecField: discriminated union =====
// type別にformatとhigherIsBetterを制約

interface SpecFieldBase {
  key: SpecKey;
  label: string;
  unit?: string;
}

export interface NumericSpecField extends SpecFieldBase {
  type: "number";
  higherIsBetter?: boolean;
  format?: NumericFormat;
}

interface StringSpecField extends SpecFieldBase {
  type: "string";
  format?: StringFormat;
}

interface BooleanSpecField extends SpecFieldBase {
  type: "boolean";
  format?: never; // booleanにformatは不要
}

interface ArraySpecField extends SpecFieldBase {
  type: "array";
  format?: ArrayFormat;
}

interface ObjectSpecField extends SpecFieldBase {
  type: "object";
  format?: ObjectFormat;
}

export type NonNumericSpecField = StringSpecField | BooleanSpecField | ArraySpecField | ObjectSpecField;

export type SpecField = NumericSpecField | NonNumericSpecField;

// ===== カテゴリ =====

export interface SpecCategory {
  id: string;
  label: string;
  defaultOpen: boolean;
  fields: SpecField[];
}

// ===== 型ガード =====

export function isNumericField(field: SpecField): field is NumericSpecField {
  return field.type === "number";
}
