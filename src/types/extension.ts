export interface ExtensionState {
  enabled: boolean;
}

export interface SatelliteClient {
  rfc: string;
  razonSocial: string;
  [key: string]: unknown;
}

export interface StorageData {
  enabled?: boolean;
  noFrecuent?: SatelliteClient[];
  [key: string]: unknown;
}

export interface GetStateMessage {
  action: 'getState';
}

export interface SetStateMessage {
  action: 'setState';
  enabled: boolean;
}

export interface GetClientsMessage {
  action: 'getClients';
}

export type ExtensionMessage = GetStateMessage | SetStateMessage | GetClientsMessage;

export interface StateResponse {
  enabled: boolean;
}

export interface SatLink {
  title?: string;
  name?: string;
  url: string;
  description?: string;
  tag?: string;
}

export interface BackupData {
  enabled?: boolean;
  noFrecuent?: unknown;
  timestamp?: string;
  [key: string]: unknown;
}
