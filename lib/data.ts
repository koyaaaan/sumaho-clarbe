import type { Device, DeviceListItem } from "@/types/device";
import type { SpecCategory } from "@/types/spec";
import deviceIndex from "@/data/index.json";
import { specFields } from "@/data/spec-fields";

// ===== データアクセス層 =====
// Phase1: 静的JSONから読み込み
// Phase2: ここだけSupabase Clientに差し替える

const deviceCache = new Map<string, Device>();

export function getDeviceList(): DeviceListItem[] {
  return deviceIndex as DeviceListItem[];
}

export async function getDevice(id: string): Promise<Device | null> {
  if (deviceCache.has(id)) {
    return deviceCache.get(id)!;
  }

  try {
    const mod = await import(`@/data/devices/${id}.json`);
    const device = mod.default as Device;
    deviceCache.set(id, device);
    return device;
  } catch {
    console.error(`Device not found: ${id}`);
    return null;
  }
}

export function getSpecFields(): SpecCategory[] {
  return specFields;
}
