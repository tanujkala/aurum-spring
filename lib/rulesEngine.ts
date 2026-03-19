import type { MarketData, EvaluationResult, ThresholdSettings, AppState, MarketPhase, GoldZoneMode, VolatilityStrength } from "./types";

const getMA = (data: number[], periods: number) => {
  const recent = data.slice(-periods);
  if (recent.length === 0) return 0;
  return recent.reduce((a, b) => a + b, 0) / periods;
};

const getMax = (data: number[], periods: number) => {
  const recent = data.slice(-periods);
  if (recent.length === 0) return 0;
  return Math.max(...recent);
};

const getSlope = (data: number[], periods: number) => {
  const recent = data.slice(-periods);
  if (recent.length < periods) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < periods; i++) {
    sumX += i;
    sumY += recent[i];
    sumXY += i * recent[i];
    sumXX += i * i;
  }
  return (periods * sumXY - sumX * sumY) / (periods * sumXX - sumX * sumX);
};

const getDailyChangePercent = (data: number[]) => {
  if (data.length < 2) return 0;
  return ((data[data.length - 1] - data[data.length - 2]) / data[data.length - 2]) * 100;
};

const getVolatility = (data: number[], periods: number) => {
  const recent = data.slice(-periods);
  if (recent.length < 2) return 0;
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance = recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recent.length;
  return Math.sqrt(variance);
};

// ─── NEW DYNAMIC LOGIC FUNCTIONS ─────────────────────────────────────────────

export const getRecentSwingHigh = (prices: number[], lookback: number) => {
  return getMax(prices, lookback);
};

export const getCurrentDrawdownPct = (currentPrice: number, recentHigh: number) => {
  if (recentHigh <= 0) return 0;
  return ((recentHigh - currentPrice) / recentHigh) * 100;
};

export const getAverageAbsDailyMovePct = (prices: number[], periods: number = 14) => {
  const recent = prices.slice(-(periods + 1));
  if (recent.length < 2) return 0;
  
  let totalAbsMove = 0;
  for (let i = 1; i < recent.length; i++) {
    const move = Math.abs((recent[i] - recent[i - 1]) / recent[i - 1]) * 100;
    totalAbsMove += move;
  }
  return totalAbsMove / (recent.length - 1);
};

export const getVolatilityAdjustment = (volPct: number) => {
  // volAdj = clamp(0.5 * (volPct - 1.0), -0.5, +1.0)
  const adj = 0.5 * (volPct - 1.0);
  return Math.max(-0.5, Math.min(1.0, adj));
};

export const getAdjustedZoneConfig = (settings: ThresholdSettings, volAdj: number) => {
  return {
    earlySupportLower: settings.earlySupportLowerPct + volAdj,
    earlySupportUpper: settings.earlySupportUpperPct + volAdj,
    starterLower: settings.starterBuyLowerPct + volAdj,
    starterUpper: settings.starterBuyUpperPct + volAdj,
    aggressiveLower: settings.aggressiveAddLowerPct + volAdj,
    aggressiveUpper: settings.aggressiveAddUpperPct + volAdj,
    panicThreshold: settings.oversoldExtensionThresholdPct + volAdj
  };
};

export const getPriceFromDrawdownPct = (recentHigh: number, d: number) => {
  return recentHigh * (1 - d / 100);
};

export const getDynamicGoldZones = (recentHigh: number, adjustedConfig: any) => {
  const calcPrice = (d: number) => Math.round(getPriceFromDrawdownPct(recentHigh, d) * 100) / 100;

  return {
    earlySupport: [calcPrice(adjustedConfig.earlySupportUpper), calcPrice(adjustedConfig.earlySupportLower)] as [number, number],
    starterBuy: [calcPrice(adjustedConfig.starterUpper), calcPrice(adjustedConfig.starterLower)] as [number, number],
    aggressiveAdd: [calcPrice(adjustedConfig.aggressiveUpper), calcPrice(adjustedConfig.aggressiveLower)] as [number, number],
    panicThreshold: calcPrice(adjustedConfig.panicThreshold)
  };
};

export const getGoldZone = (drawdownPct: number, config: any) => {
  if (drawdownPct >= config.panicThreshold) return "Panic Extension";
  if (drawdownPct >= config.aggressiveLower && drawdownPct < config.aggressiveUpper) return "Aggressive Add";
  if (drawdownPct >= config.starterLower && drawdownPct < config.starterUpper) return "Starter Buy";
  if (drawdownPct >= config.earlySupportLower && drawdownPct < config.earlySupportUpper) return "Early Support";
  if (drawdownPct < config.earlySupportLower) return "Extended / No Edge";
  return "Outside Zones";
};

export const getGoldScore = (zone: string) => {
  switch (zone) {
    case "Extended / No Edge": return 10;
    case "Early Support": return 65;
    case "Starter Buy": return 85;
    case "Aggressive Add": return 100;
    case "Panic Extension": return 90;
    default: return 10;
  }
};

export const evaluateGoldEngine = (prices: number[], currentPrice: number, settings: ThresholdSettings) => {
  const recentHigh = getRecentSwingHigh(prices, settings.swingHighLookback);
  const drawdownPct = getCurrentDrawdownPct(currentPrice, recentHigh);
  const volatilityPct = getAverageAbsDailyMovePct(prices, 14);
  
  const volAdj = settings.volatilityAdjustmentEnabled ? getVolatilityAdjustment(volatilityPct) : 0;
  const adjustedConfig = getAdjustedZoneConfig(settings, volAdj);
  const dynamicZones = getDynamicGoldZones(recentHigh, adjustedConfig);
  const currentZone = getGoldZone(drawdownPct, adjustedConfig);
  const goldScore = getGoldScore(currentZone);

  return {
    recentHigh,
    currentPrice,
    drawdownPct,
    volatilityPct,
    volatilityAdjustment: volAdj,
    adjustedConfig,
    zones: dynamicZones,
    currentZone,
    goldScore
  };
};

export const evaluateState = (
  currentOpt: MarketData,
  goldHistory: number[],
  dxyHistory: number[],
  yieldHistory: number[],
  settings: ThresholdSettings
): EvaluationResult => {
  const { goldPrice, dxy, realYield } = currentOpt;

  const _gold = [...goldHistory, goldPrice];
  const _dxy = [...dxyHistory, dxy];
  const _yield = [...yieldHistory, realYield];

  // 1. Gold Zone Calculations
  const goldEngine = evaluateGoldEngine(goldHistory, goldPrice, settings);
  const { recentHigh, drawdownPct, volatilityPct, volatilityAdjustment, adjustedConfig, zones: dynamicZones, currentZone: currentGoldZone, goldScore } = goldEngine;
  
  const zoneSource = settings.goldZoneMode;
  
  // Handle Manual Mode Override for goldScore/currentGoldZone if needed
  let finalGoldScore = goldScore;
  let finalGoldZone = currentGoldZone;

  if (settings.goldZoneMode === "Manual") {
    if (goldPrice >= settings.goldAggressiveLower && goldPrice <= settings.goldAggressiveUpper) {
      finalGoldScore = 100;
      finalGoldZone = "Aggressive Add (Manual)";
    } else if (goldPrice >= settings.goldStarterLower && goldPrice <= settings.goldStarterUpper) {
      finalGoldScore = 85;
      finalGoldZone = "Starter Buy (Manual)";
    } else {
      finalGoldScore = 10;
      finalGoldZone = "Outside Manual Zones";
    }
  }

  // Hard override: Do not buy above price
  if (goldPrice > settings.doNotBuyAbovePrice) {
    finalGoldScore = 5;
  }

  // 2. Real Yield Score
  const yieldSlope3 = getSlope(_yield, 3);
  const yieldSlope5 = getSlope(_yield, 5);
  const yield5DayHigh = getMax(_yield.slice(0, -1), 5); 
  const isYieldNewHigh = realYield >= yield5DayHigh;
  const yieldDailyChange = _yield.length >= 2 ? Math.abs(_yield[_yield.length - 1] - _yield[_yield.length - 2]) : 0;

  let realYieldScore = 40;
  if (yieldSlope3 < 0 && yieldSlope5 < 0) realYieldScore = 100;
  else if (yieldDailyChange <= settings.realYieldFlatThreshold) realYieldScore = 70;
  else if (isYieldNewHigh) realYieldScore = 10;
  else if (yieldSlope3 > 0) realYieldScore = 40;

  // 3. DXY Score
  const dxySlope5 = getSlope(_dxy, 5);
  const dxy5DayHigh = getMax(_dxy.slice(0, -1), 5);
  const isDxyNewHigh = dxy >= dxy5DayHigh;
  
  let dxyScore = 40;
  if (dxySlope5 < 0) dxyScore = 100;
  else if (Math.abs(getDailyChangePercent(_dxy)) < 0.05) dxyScore = 70; 
  else if (isDxyNewHigh) dxyScore = 10;
  else if (dxySlope5 > 0) dxyScore = 40;

  // 4. Composite Score
  const compositeScore = (finalGoldScore * 0.40) + (realYieldScore * 0.30) + (dxyScore * 0.30);

  // 5. Map Score to State
  let state: AppState = "WAIT";
  let suggestedAllocation = "No action";
  let action = "Macro and price are not aligned. No clear edge.";

  if (compositeScore >= 85) {
    state = "AGGRESSIVE ADD";
    suggestedAllocation = `Deploy up to ${settings.maxAllocationPerSignal}%`;
    action = finalGoldZone === "Panic Extension" 
      ? `Gold entered Panic Extension (${drawdownPct.toFixed(1)}% drawdown). High opportunity but requires macro stabilization.` 
      : `Gold in Aggressive Add zone (${drawdownPct.toFixed(1)}% DD). Forced liquidation likely. Deploy capital in tranches.`;
  } else if (compositeScore >= 75) {
    state = "ADD";
    suggestedAllocation = "Deploy 20–30%";
    action = `Gold in ${finalGoldZone} (${drawdownPct.toFixed(1)}% DD). Macro and price are aligning. Increase allocation.`;
  } else if (compositeScore >= 60) {
    state = "STARTER BUY";
    suggestedAllocation = "Deploy 10–15%";
    action = `Gold entered ${finalGoldZone} based on ${settings.swingHighLookback}-day drawdown. Current DD = ${drawdownPct.toFixed(1)}%.`;
  } else if (compositeScore >= 40) {
    // Guardrail: If in a buy zone and macro is not hostile (< 40 is hostile), promote from WAIT to STARTER BUY
    if (finalGoldZone === "Starter Buy" || finalGoldZone === "Aggressive Add" || finalGoldZone === "Panic Extension") {
      state = "STARTER BUY";
      suggestedAllocation = "Deploy 5-10% (Guardrail)";
      action = `Gold in ${finalGoldZone} (${drawdownPct.toFixed(1)}% DD). Maintaining starter position despite mixed macro signals.`;
    } else {
      state = "WAIT";
      suggestedAllocation = "No action";
      action = `Gold drawdown is ${drawdownPct.toFixed(1)}% (${finalGoldZone}). Macro and price are not aligned. No clear edge.`;
    }
  } else {
    state = "DO NOT BUY";
    suggestedAllocation = "Reduce / hold cash";
    action = `Macro conditions are hostile (Composite: ${compositeScore.toFixed(0)}). Preserve capital despite ${drawdownPct.toFixed(1)}% drawdown.`;
  }

  // Risk Overrides
  if (goldPrice < settings.hardRiskFloor) {
    state = "DO NOT BUY";
    action = "Price below hard risk floor. System pause mandatory.";
  }

  // 6. Market Phase Classification
  const goldVolatility5 = getVolatility(_gold, 5);
  const goldChange = getDailyChangePercent(_gold);
  const goldSlope5 = getSlope(_gold, 5);
  
  let marketPhase: MarketPhase = "Stabilization";
  if (goldChange < -2.0) marketPhase = "Liquidation";
  else if (goldSlope5 < -5) marketPhase = "Breakdown";
  else if (goldSlope5 > 5 && goldVolatility5 > 5) marketPhase = "Expansion";
  else if (goldVolatility5 < 10) marketPhase = "Compression";
  else marketPhase = "Stabilization";

  // 7. Macro Pressure Meters
  const usdPressure: "Low" | "Medium" | "High" = dxySlope5 < 0 ? "Low" : isDxyNewHigh ? "High" : "Medium";
  const realYieldPressure: "Low" | "Medium" | "High" = yieldSlope3 < 0 ? "Low" : isYieldNewHigh ? "High" : "Medium";

  const reason = `Gold (${settings.goldZoneMode}): ${finalGoldZone} (Score: ${finalGoldScore.toFixed(0)}, DD: ${drawdownPct.toFixed(1)}%). DXY: ${dxyScore.toFixed(0)}, Yield: ${realYieldScore.toFixed(0)}. Vol: ${volatilityPct.toFixed(2)}% (Adj: ${volatilityAdjustment.toFixed(2)}).`;

  return {
    state,
    compositeScore,
    marketPhase,
    usdPressure,
    realYieldPressure,
    suggestedAllocation,
    action,
    reason,
    scores: {
      gold: finalGoldScore,
      dxy: dxyScore,
      realYield: realYieldScore
    },
    recentHigh,
    drawdownPct,
    volatilityPct,
    volatilityAdjustment,
    currentGoldZone: finalGoldZone,
    zoneSource: settings.goldZoneMode,
    dynamicZones,
    adjustedConfig
  };
};

