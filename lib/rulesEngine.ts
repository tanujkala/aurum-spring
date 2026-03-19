import type { MarketData, EvaluationResult, ThresholdSettings, AppState } from "./types";

const getMA = (data: number[], periods: number) => {
  const recent = data.slice(-periods);
  return recent.reduce((a, b) => a + b, 0) / periods;
};

const getMax = (data: number[], periods: number) =>
  Math.max(...data.slice(-periods));

const getSlope = (data: number[], periods: number) => {
  const recent = data.slice(-periods);
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < periods; i++) {
    sumX += i;
    sumY += recent[i];
    sumXY += i * recent[i];
    sumXX += i * i;
  }
  return (periods * sumXY - sumX * sumY) / (periods * sumXX - sumX * sumX);
};

const getDailyChange = (data: number[]) => {
  if (data.length < 2) return 0;
  return data[data.length - 1] - data[data.length - 2];
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

  const dxy5DayHigh = getMax(_dxy, 5);
  const isDxyNewHigh = dxy >= dxy5DayHigh;
  const yield5DayHigh = getMax(_yield, 5);
  const isYieldNewHigh = realYield >= yield5DayHigh;

  const dxy5DayMA = getMA(_dxy, 5);
  const yieldSlope3 = getSlope(_yield, 3);
  const yieldSlope5 = getSlope(_yield, 5);

  const yieldDailyChange = getDailyChange(_yield);
  const isYieldFlattening = Math.abs(yieldDailyChange) <= settings.realYieldFlatThreshold;
  const isYieldFalling = yieldSlope3 < 0 || yieldSlope5 < 0;

  const isDxyLowerHighs = getSlope(_dxy, 5) < 0;

  let state: AppState = "WAIT";
  let confidence = 0;
  let action = "No edge. Macro and price are not aligned.";
  let reason = "Conditions do not meet criteria for any active stance.";

  let goldAlignment = 0;
  let dxyAlignment = 0;
  let yieldAlignment = 0;

  // 1. DO NOT BUY
  if (getSlope(_gold, 3) < 0 && isDxyNewHigh && isYieldNewHigh) {
    state = "DO NOT BUY";
    confidence = 90;
    action = "Macro is hostile. Preserve capital and wait.";
    reason = "Gold is falling while DXY and real yields are making new 5-day highs.";
    return { state, confidence, action, reason };
  }

  // Momentum re-entry
  const isMomentumZone = goldPrice >= settings.goldMomentumLower && goldPrice <= settings.goldMomentumUpper;
  if (isMomentumZone && dxy < settings.dxyWeak && getSlope(_dxy, 5) < -0.05 && isYieldFalling) {
    state = "ADD";
    confidence = 85;
    action = "Trend resumption likely. Add on strength, not all at once.";
    reason = "Gold has reclaimed momentum zone, DXY is clearly weakening, and real yields are decisively falling.";
    return { state, confidence, action, reason };
  }

  // Alignments
  if (goldPrice >= settings.goldAggressiveLower && goldPrice <= settings.goldAggressiveUpper) goldAlignment = 35;
  else if (goldPrice >= settings.goldStarterLower && goldPrice <= settings.goldStarterUpper) goldAlignment = 25;
  else if (goldPrice >= settings.goldReclaim) goldAlignment = 20;

  if (dxy < settings.dxyWeak) dxyAlignment = 30;
  else if (!isDxyNewHigh && dxy < dxy5DayMA) dxyAlignment = 20;
  else if (!isDxyNewHigh) dxyAlignment = 10;

  if (isYieldFalling) yieldAlignment = 35;
  else if (isYieldFlattening) yieldAlignment = 20;
  else if (!isYieldNewHigh) yieldAlignment = 10;

  confidence = goldAlignment + dxyAlignment + yieldAlignment;

  // AGGRESSIVE ADD
  if (goldPrice >= settings.goldAggressiveLower && goldPrice <= settings.goldAggressiveUpper) {
    if (getSlope(_dxy, 3) <= 0.01 && !isYieldNewHigh && (isYieldFlattening || isYieldFalling) && !isDxyNewHigh) {
      state = "AGGRESSIVE ADD";
      confidence = Math.max(80, Math.min(95, confidence + 20));
      action = "Forced liquidation zone likely. Add aggressively but in tranches.";
      reason = "Gold in deep value zone, DXY acceleration has stopped, and real yields are flat/down.";
      return { state, confidence, action, reason };
    }
  }

  // ADD
  const isHolding4700 = goldPrice >= 4700;
  const isReclaimed4850 = goldPrice >= settings.goldReclaim;
  if (isHolding4700 || isReclaimed4850) {
    if ((dxy < dxy5DayMA || isDxyLowerHighs) && isYieldFalling) {
      state = "ADD";
      confidence = Math.max(75, Math.min(90, confidence + 10));
      action = "Increase allocation. Price and macro are aligning.";
      reason = "Gold holding support/reclaim, DXY showing weakness, and real yields falling over recent observations.";
      return { state, confidence, action, reason };
    }
  }

  // STARTER BUY
  if (goldPrice >= settings.goldStarterLower && goldPrice <= settings.goldStarterUpper) {
    if (!isDxyNewHigh && !isYieldNewHigh) {
      state = "STARTER BUY";
      confidence = Math.max(60, Math.min(75, confidence + 10));
      action = "Begin scaling in lightly. Support is active but macro confirmation is incomplete.";
      reason = "Gold in starter buy zone. DXY and Yields are not making new 5-day highs.";
      return { state, confidence, action, reason };
    }
  }

  return { state, confidence, action, reason };
};
