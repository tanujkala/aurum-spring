export type MarketPhase = "Compression" | "Breakdown" | "Liquidation" | "Stabilization" | "Expansion";

export interface MarketData {
  timestamp: string;
  goldPrice: number;
  dxy: number;
  realYield: number;
}

export interface MarketResponse extends MarketData {
  cached: boolean;
  live: { gold: boolean; dxy: boolean; yield: boolean };
  goldHistory: number[];
  dxyHistory: number[];
  yieldHistory: number[];
}

export type AppState = "WAIT" | "STARTER BUY" | "ADD" | "AGGRESSIVE ADD" | "DO NOT BUY";
export type GoldZoneMode = "Auto" | "Manual";
export type VolatilityStrength = "low" | "medium" | "high";

export interface EvaluationResult {
  state: AppState;
  compositeScore: number;
  marketPhase: MarketPhase;
  usdPressure: "Low" | "Medium" | "High";
  realYieldPressure: "Low" | "Medium" | "High";
  suggestedAllocation: string;
  action: string;
  reason: string;
  scores: {
    gold: number;
    dxy: number;
    realYield: number;
  };
  // Dynamic Metrics
  recentHigh: number;
  drawdownPct: number;
  volatilityPct: number;
  volatilityAdjustment: number;
  currentGoldZone: string;
  zoneSource: GoldZoneMode;
  dynamicZones: {
    earlySupport: [number, number];
    starterBuy: [number, number];
    aggressiveAdd: [number, number];
    panicThreshold: number;
  };
  adjustedConfig?: {
    earlySupportLower: number;
    earlySupportUpper: number;
    starterLower: number;
    starterUpper: number;
    aggressiveLower: number;
    aggressiveUpper: number;
    panicThreshold: number;
  };
}

export interface ThresholdSettings {
  // Mode
  goldZoneMode: GoldZoneMode;
  
  // Auto Mode Settings
  swingHighLookback: 30 | 60 | 90;
  earlySupportLowerPct: number;
  earlySupportUpperPct: number;
  starterBuyLowerPct: number;
  starterBuyUpperPct: number;
  aggressiveAddLowerPct: number;
  aggressiveAddUpperPct: number;
  oversoldExtensionThresholdPct: number;
  volatilityAdjustmentEnabled: boolean;
  volatilityAdjustmentStrength: VolatilityStrength;

  // Manual Mode Settings
  goldStarterLower: number;
  goldStarterUpper: number;
  goldAggressiveLower: number;
  goldAggressiveUpper: number;
  
  // Risk & Global
  maxAllocationPerSignal: number;
  doNotBuyAbovePrice: number;
  hardRiskFloor: number;

  // Macro Settings
  dxyWeak: number;
  dxyStrong: number;
  realYieldLookback: number;
  realYieldFlatThreshold: number;
}

export const defaultSettings: ThresholdSettings = {
  goldZoneMode: "Auto",
  
  // Auto defaults
  swingHighLookback: 60,
  earlySupportLowerPct: 5,
  earlySupportUpperPct: 8,
  starterBuyLowerPct: 8,
  starterBuyUpperPct: 12,
  aggressiveAddLowerPct: 12,
  aggressiveAddUpperPct: 18,
  oversoldExtensionThresholdPct: 18,
  volatilityAdjustmentEnabled: true,
  volatilityAdjustmentStrength: "medium",

  // Manual defaults (existing)
  goldStarterLower: 4680,
  goldStarterUpper: 4725,
  goldAggressiveLower: 4550,
  goldAggressiveUpper: 4625,

  // Risk & Global defaults
  maxAllocationPerSignal: 15,
  doNotBuyAbovePrice: 5200,
  hardRiskFloor: 4000,

  // Macro defaults
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
  compositeScore: number;
  marketPhase: string;
  reason: string;
  // Expanded for refactor
  recentHigh?: number;
  drawdownPct?: number;
  goldZone?: string;
  zoneSource?: string;
}

