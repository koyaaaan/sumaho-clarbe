import type { Device } from "@/types/device";
import type { SpecField } from "@/types/spec";

export interface CellProps {
  device: Device;
  field: SpecField;
  colorClass: string;
}
