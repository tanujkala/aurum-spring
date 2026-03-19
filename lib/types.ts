export interface MarketData {
  timestamp: string;
  goldPrice: number;
  dxy: number;
  realYield: number;
}

export interface MarketResponse extends MarketData {
  cached: boolean;
  live: { gold: boolean; dxy: boolean; yield: boolean };
}

export type AppState = "WAIT" | "STARTER BUY" | "ADD" | "AGGRESSIVE ADD" | "DO NOT BUY";

export interface EvaluationResult {
  state: AppState;
  confidence: number;
  action: string;
  reason: string;
}

export interface ThresholdSettings {
  goldStarterLower: number;
  goldStarterUpper: number;
  goldReclaim: number;
  goldMomentumLower: number;
  goldMomentumUpper: number;
  goldAggressiveLower: number;
  goldAggressiveUpper: number;
  dxyWeak: number;
  dxyStrong: number;
  realYieldLookback: number;
  realYieldFlatThreshold: number;
}

export const defaultSettings: ThresholdSettings = {
  goldStarterLower: 4680,
  goldStarterUpper: 4725,
  goldReclaim: 4850,
  goldMomentumLower: 5000,
  goldMomentumUpper: 5100,
  goldAggressiveLower: 4550,
  goldAggressiveUpper: 4625,
  dxyWeak: 99,
  dxyStrong: 100,
  realYieldLookback: 5,
  realYieldFlatThreshold: 0.05,
};

export interface HistoryEntry {
  timestamp: string;
  goldPrice: number;
  dxy: number;
  realYield: number;
  state: string;
  confidence: number;
  reason: string;
}
