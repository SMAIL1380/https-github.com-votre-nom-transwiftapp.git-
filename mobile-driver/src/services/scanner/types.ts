export interface ScanResult {
  id: string;
  code: string;
  type: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  batteryLevel?: number;
  validated: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ScannerServiceInterface {
  scan(code: string): Promise<ScanResult>;
  validate(scan: ScanResult): Promise<ValidationResult>;
  save(scan: ScanResult): Promise<void>;
  getScanById(id: string): Promise<ScanResult | null>;
  getScans(): Promise<ScanResult[]>;
  clearScans(): Promise<void>;
}
