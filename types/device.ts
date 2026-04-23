// ===== カメラモジュール型 =====

export interface CameraModule {
  label: string;
  mp: number;
  sensor?: string;
  aperture: number;
  ois: boolean;
  zoom?: number;
}

// ===== キャリア別バンド詳細型 =====

export interface CarrierBandDetail {
  modelNumber: string;
  fiveG: string[];
  fourG: string[];
  missingBands?: string[];
}

export interface CarrierBands {
  shared: boolean;
  docomo?: CarrierBandDetail;
  au?: CarrierBandDetail;
  softbank?: CarrierBandDetail;
  rakuten?: CarrierBandDetail;
  simfree?: CarrierBandDetail;
}

// ===== SpecValueMap: キーと値の型を完全対応 =====

export type SpecValueMap = {
  "basic.price": number;
  "basic.weight": number;
  "basic.height": number;
  "basic.width": number;
  "basic.depth": number;
  "basic.ipRating": string;

  "variant.docomo": string;
  "variant.au": string;
  "variant.softbank": string;
  "variant.rakuten": string;
  "variant.simfree": string;

  "display.size": number;
  "display.resolution": string;
  "display.refreshRate": number;
  "display.panelType": string;
  "display.peakBrightness": number;

  "processor.soc": string;
  "processor.process": string;
  "processor.gpu": string;

  "memory.ram": number;
  "memory.storageOptions": number[];
  "memory.storageType": string;
  "memory.expandable": boolean;

  "camera.rearModules": CameraModule[];
  "camera.mainMP": number;
  "camera.mainAperture": number;
  "camera.mainSensor": string;
  "camera.ultrawideSensor": string;
  "camera.telephotoSensor": string;
  "camera.telephotoZoom": number;
  "camera.frontMP": number;
  "camera.frontAperture": number;
  "camera.videoMaxRes": string;

  "battery.capacity": number;
  "battery.wiredCharging": number;
  "battery.wirelessCharging": number;
  "battery.reverseCharging": boolean;

  "connectivity.fiveG": boolean;
  "connectivity.fiveGSub6": string;
  "connectivity.fiveGMmwave": string;
  "connectivity.fourGBands": string;
  "connectivity.bandLock": string;
  "connectivity.carrierBands": CarrierBands;
  "connectivity.wifi": string;
  "connectivity.bluetooth": string;
  "connectivity.nfc": boolean;
  "connectivity.usb": string;
  "connectivity.sim": string;

  "os.initial": string;
  "os.updateYears": number;
  "os.securityYears": number;
  "os.releaseYear": number;
  "os.updateUntil": number;
  "os.securityUntil": number;

  "audio.stereoSpeaker": boolean;
  "audio.headphoneJack": boolean;

  "biometrics.fingerprint": string;
  "biometrics.face": boolean;
};

// ===== SpecKey: SpecValueMapから自動導出 =====

export type SpecKey = keyof SpecValueMap;

// ===== SpecValue: 全値型の合併（キー不明時のフォールバック） =====

export type SpecValue = SpecValueMap[SpecKey];

// ===== DeviceSpecs: キーごとに正しい型 + null許容 =====

export type DeviceSpecs = {
  [K in SpecKey]?: SpecValueMap[K] | null;
};

// ===== デバイス型 =====

export interface Device {
  id: string;
  brandId: string;
  name: string;
  releaseDate: string;
  region: string;
  imageUrl: string;
  specs: DeviceSpecs;
}

// ===== 検索・選択UI用の軽量型 =====

export interface DeviceListItem {
  id: string;
  brandId: string;
  name: string;
  releaseDate: string;
  region: string;
  imageUrl: string;
}
