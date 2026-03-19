"use client";

import { useState, useEffect, useRef } from "react";
import type { MarketData, MarketResponse, ThresholdSettings, EvaluationResult, HistoryEntry } from "@/lib/types";
import { defaultSettings } from "@/lib/types";
import { evaluateState } from "@/lib/rulesEngine";
import { MetricCard } from "@/components/MetricCard";
import { ActionCard } from "@/components/ActionCard";
import { RuleBreakdown } from "@/components/RuleBreakdown";
import { HistoryTable } from "@/components/HistoryTable";
import { SettingsPanel } from "@/components/SettingsPanel";


export default function Dashboard() {
  const [currentData, setCurrentData] = useState<MarketData | null>(null);
  const [goldHistory, setGoldHistory] = useState<number[]>([]);
  const [dxyHistory, setDxyHistory] = useState<number[]>([]);
  const [yieldHistory, setYieldHistory] = useState<number[]>([]);

  const [settings, setSettings] = useState<ThresholdSettings>(defaultSettings);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [triggerHistory, setTriggerHistory] = useState<HistoryEntry[]>([]);

  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);

  const goldHistoryRef = useRef<number[]>([]);
  const dxyHistoryRef = useRef<number[]>([]);
  const yieldHistoryRef = useRef<number[]>([]);
  const settingsRef = useRef<ThresholdSettings>(defaultSettings);

  useEffect(() => { goldHistoryRef.current = goldHistory; }, [goldHistory]);
  useEffect(() => { dxyHistoryRef.current = dxyHistory; }, [dxyHistory]);
  useEffect(() => { yieldHistoryRef.current = yieldHistory; }, [yieldHistory]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Initial load
  useEffect(() => {
    const savedSettings = localStorage.getItem("aurum-settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Migration: merge with defaultSettings to ensure new fields are present
      const migrated = { ...defaultSettings, ...parsed };
      setSettings(migrated);
      settingsRef.current = migrated;
    }
    const savedHistory = localStorage.getItem("aurum-history");
    if (savedHistory) {
      setTriggerHistory(JSON.parse(savedHistory));
    }

    runEvaluation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = (newSettings: ThresholdSettings) => {
    setSettings(newSettings);
    settingsRef.current = newSettings;
    localStorage.setItem("aurum-settings", JSON.stringify(newSettings));
  };

  const runEvaluation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MarketResponse = await res.json();

      const allLive = data.live.gold && data.live.dxy && data.live.yield;
      setIsLive(allLive);

      // Update history from API
      const gH = data.goldHistory || [];
      const dH = data.dxyHistory || [];
      const yH = data.yieldHistory || [];
      
      goldHistoryRef.current = gH;
      dxyHistoryRef.current = dH;
      yieldHistoryRef.current = yH;
      setGoldHistory(gH);
      setDxyHistory(dH);
      setYieldHistory(yH);

      const newData: MarketData = {
        timestamp: data.timestamp,
        goldPrice: data.goldPrice,
        dxy: data.dxy,
        realYield: data.realYield,
      };

      const result = evaluateState(
        newData,
        goldHistoryRef.current,
        dxyHistoryRef.current,
        yieldHistoryRef.current,
        settingsRef.current
      );

      setCurrentData(newData);
      setEvaluation(result);
      setLastUpdated(new Date().toLocaleString());

      const newEntry: HistoryEntry = {
        timestamp: new Date().toLocaleTimeString(),
        goldPrice: newData.goldPrice,
        dxy: newData.dxy,
        realYield: newData.realYield,
        state: result.state,
        compositeScore: result.compositeScore,
        marketPhase: result.marketPhase,
        reason: result.reason,
        recentHigh: result.recentHigh,
        drawdownPct: result.drawdownPct,
        goldZone: result.currentGoldZone,
        zoneSource: result.zoneSource
      };

      setTriggerHistory((prev) => {
        const lastEntry = prev[0];
        const stateChanged = lastEntry && lastEntry.state !== result.state;
        
        const getThreshold = (score: number) => {
          if (score < 40) return 0;
          if (score < 60) return 40;
          if (score < 75) return 60;
          if (score < 85) return 75;
          return 85;
        };

        const scoreCrossedThreshold = lastEntry && getThreshold(lastEntry.compositeScore) !== getThreshold(result.compositeScore);

        if (stateChanged || scoreCrossedThreshold) {
          const alertMsg = `[ALERT] ${stateChanged ? "STATE CHANGE" : "THRESHOLD CROSS"}: ${result.state} | Score: ${result.compositeScore.toFixed(1)} | Gold: ${newData.goldPrice} | Drawdown: ${result.drawdownPct.toFixed(1)}% | Zone: ${result.currentGoldZone} | High: ${result.recentHigh}`;
          console.log(alertMsg);
        }
        const updated = [newEntry, ...prev].slice(0, 50);
        localStorage.setItem("aurum-history", JSON.stringify(updated));
        return updated;
      });

      // History is already updated above for the next run
    } catch (err) {
      console.error("[Dashboard] Failed to fetch /api/market:", err);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentData || !evaluation) {
    return (
      <div style={{ color: "white", padding: "2rem", fontFamily: "Inter, sans-serif" }}>
        Loading live data...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="title-group">
          <h1>Aurum Spring</h1>
          <p>Macro-timed gold accumulation dashboard</p>
        </div>
        <div className="header-actions">
          <span className="timestamp">Last updated: {lastUpdated}</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                background: isLive ? "rgba(16, 185, 129, 0.15)" : "rgba(100, 116, 139, 0.2)",
                color: isLive ? "#10b981" : "#64748b",
                border: `1px solid ${isLive ? "#10b981" : "#475569"}`,
                fontWeight: 600,
              }}
            >
              {isLive ? "● LIVE" : "○ MOCK"}
            </span>
            <button className="btn-primary" onClick={() => runEvaluation()} disabled={isLoading}>
              {isLoading ? "Fetching..." : "Run Evaluation Now"}
            </button>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Gold Price"
          value={`$${currentData.goldPrice.toFixed(2)}`}
          dailyChange={currentData.goldPrice - (goldHistory[goldHistory.length - 1] ?? currentData.goldPrice)}
          dailyChangeText={`${Math.abs(currentData.goldPrice - (goldHistory[goldHistory.length - 1] ?? currentData.goldPrice)).toFixed(2)}`}
          trendDirection="5-day trend"
          history={[...goldHistory, currentData.goldPrice]}
        />
        <MetricCard
          title="DXY"
          value={currentData.dxy.toFixed(3)}
          dailyChange={currentData.dxy - (dxyHistory[dxyHistory.length - 1] ?? currentData.dxy)}
          dailyChangeText={`${Math.abs(currentData.dxy - (dxyHistory[dxyHistory.length - 1] ?? currentData.dxy)).toFixed(3)}`}
          trendDirection="5-day trend"
          history={[...dxyHistory, currentData.dxy]}
        />
        <MetricCard
          title="US 10Y Real Yield"
          value={`${currentData.realYield.toFixed(2)}%`}
          dailyChange={currentData.realYield - (yieldHistory[yieldHistory.length - 1] ?? currentData.realYield)}
          dailyChangeText={`${Math.abs(currentData.realYield - (yieldHistory[yieldHistory.length - 1] ?? currentData.realYield)).toFixed(2)} bps`}
          trendDirection="5-day trend"
          history={[...yieldHistory, currentData.realYield]}
        />
      </div>

      <div className="middle-grid">
        <ActionCard evaluation={evaluation} />
        <RuleBreakdown evaluation={evaluation} />
      </div>

      <HistoryTable history={triggerHistory} />
      <SettingsPanel settings={settings} onSave={saveSettings} />
    </div>
  );
}
