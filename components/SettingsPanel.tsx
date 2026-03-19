"use client";

import { useState } from "react";
import type { ThresholdSettings, GoldZoneMode, VolatilityStrength } from "@/lib/types";

interface SettingsPanelProps {
  settings: ThresholdSettings;
  onSave: (newSettings: ThresholdSettings) => void;
}

export function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [formData, setFormData] = useState<ThresholdSettings>(settings);

  const handleChange = (key: keyof ThresholdSettings, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleNumberChange = (key: keyof ThresholdSettings, value: string) => {
    setFormData({ ...formData, [key]: Number(value) });
  };

  const handleSave = () => {
    onSave(formData);
    alert("Settings saved!");
  };

  return (
    <div className={`settings-section ${formData.goldZoneMode === 'MANUAL' ? 'mode-manual' : 'mode-auto'}`}>
      <div className="settings-header">
        <h3>Settings & Architecture</h3>
        <div className="mode-selector">
          <label>Gold Zone Mode:</label>
          <select 
            value={formData.goldZoneMode} 
            onChange={(e) => handleChange("goldZoneMode", e.target.value as GoldZoneMode)}
          >
            <option value="AUTO">Auto (recommended)</option>
            <option value="MANUAL">Manual (override)</option>
          </select>
        </div>
      </div>

      <div className="settings-container">
        {/* AUTO MODE SETTINGS */}
        <div className={`settings-group-wrapper ${formData.goldZoneMode === 'AUTO' ? 'active' : 'disabled'}`}>
          <h4 className="section-title">A. AUTO MODE SETTINGS</h4>
          <div className="settings-grid">
            <div className="setting-group">
              <label>Swing High Lookback</label>
              <select value={formData.swingHighLookback} onChange={(e) => handleNumberChange("swingHighLookback", e.target.value)}>
                <option value={30}>30 Trading Days</option>
                <option value={60}>60 Trading Days</option>
                <option value={90}>90 Trading Days</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Volatility Adjustment</label>
              <div className="checkbox-group">
                <input type="checkbox" checked={formData.volatilityAdjustmentEnabled} onChange={(e) => handleChange("volatilityAdjustmentEnabled", e.target.checked)} />
                <select value={formData.volatilityAdjustmentStrength} onChange={(e) => handleChange("volatilityAdjustmentStrength", e.target.value as VolatilityStrength)}>
                  <option value="low">Low Sensitivity</option>
                  <option value="medium">Medium Sensitivity</option>
                  <option value="high">High Sensitivity</option>
                </select>
              </div>
            </div>
            <div className="setting-group">
              <label>Early Support (% Drawdown)</label>
              <div className="range-inputs">
                <input type="number" step="0.5" value={formData.earlySupportLowerPct} onChange={(e) => handleNumberChange("earlySupportLowerPct", e.target.value)} />
                <span>to</span>
                <input type="number" step="0.5" value={formData.earlySupportUpperPct} onChange={(e) => handleNumberChange("earlySupportUpperPct", e.target.value)} />
              </div>
            </div>
            <div className="setting-group">
              <label>Starter Buy (% Drawdown)</label>
              <div className="range-inputs">
                <input type="number" step="0.5" value={formData.starterBuyLowerPct} onChange={(e) => handleNumberChange("starterBuyLowerPct", e.target.value)} />
                <span>to</span>
                <input type="number" step="0.5" value={formData.starterBuyUpperPct} onChange={(e) => handleNumberChange("starterBuyUpperPct", e.target.value)} />
              </div>
            </div>
            <div className="setting-group">
              <label>Aggressive Add (% Drawdown)</label>
              <div className="range-inputs">
                <input type="number" step="0.5" value={formData.aggressiveAddLowerPct} onChange={(e) => handleNumberChange("aggressiveAddLowerPct", e.target.value)} />
                <span>to</span>
                <input type="number" step="0.5" value={formData.aggressiveAddUpperPct} onChange={(e) => handleNumberChange("aggressiveAddUpperPct", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* MANUAL MODE SETTINGS */}
        <div className={`settings-group-wrapper ${formData.goldZoneMode === 'MANUAL' ? 'active' : 'disabled'}`}>
          <h4 className="section-title">B. MANUAL MODE SETTINGS</h4>
          <div className="settings-grid">
            <div className="setting-group">
              <label>Starter Buy Price Range</label>
              <div className="range-inputs">
                <input type="number" step="1" value={formData.goldStarterLower} onChange={(e) => handleNumberChange("goldStarterLower", e.target.value)} />
                <span>to</span>
                <input type="number" step="1" value={formData.goldStarterUpper} onChange={(e) => handleNumberChange("goldStarterUpper", e.target.value)} />
              </div>
            </div>
            <div className="setting-group">
              <label>Aggressive Add Price Range</label>
              <div className="range-inputs">
                <input type="number" step="1" value={formData.goldAggressiveLower} onChange={(e) => handleNumberChange("goldAggressiveLower", e.target.value)} />
                <span>to</span>
                <input type="number" step="1" value={formData.goldAggressiveUpper} onChange={(e) => handleNumberChange("goldAggressiveUpper", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* RISK & GLOBAL SETTINGS */}
        <div className="settings-group-wrapper active">
          <h4>Risk & Macro Parameters</h4>
          <div className="settings-grid">
             <div className="setting-group">
              <label>Max Allocation Per Signal (%)</label>
              <input type="number" step="1" value={formData.maxAllocationPerSignal} onChange={(e) => handleNumberChange("maxAllocationPerSignal", e.target.value)} />
            </div>
            <div className="setting-group">
              <label>Hard Risk Floor ($)</label>
              <input type="number" step="1" value={formData.hardRiskFloor} onChange={(e) => handleNumberChange("hardRiskFloor", e.target.value)} />
            </div>
            <div className="setting-group">
              <label>Do Not Buy Above ($)</label>
              <input type="number" step="1" value={formData.doNotBuyAbovePrice} onChange={(e) => handleNumberChange("doNotBuyAbovePrice", e.target.value)} />
            </div>
            <div className="setting-group">
              <label>DXY Weak / Strong</label>
              <div className="range-inputs">
                <input type="number" step="0.1" value={formData.dxyWeak} onChange={(e) => handleNumberChange("dxyWeak", e.target.value)} />
                <span>/</span>
                <input type="number" step="0.1" value={formData.dxyStrong} onChange={(e) => handleNumberChange("dxyStrong", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="save-btn" onClick={handleSave}>Save Settings</button>
      </div>

      <style jsx>{`
        .settings-section {
          transition: border-color 0.3s ease;
          border-left: 4px solid transparent;
          padding-left: 1rem;
        }
        .mode-auto {
          border-left-color: #3b82f6;
        }
        .mode-manual {
          border-left-color: #f59e0b;
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
          gap: 1rem;
        }
        @media (max-width: 640px) {
            .settings-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
        .mode-selector {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .mode-selector select {
          background: #1e293b;
          color: white;
          border: 1px solid #334155;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .settings-group-wrapper {
          padding: 1.25rem;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }
        .settings-group-wrapper.disabled {
          opacity: 0.3;
          pointer-events: none;
          filter: grayscale(0.8);
        }
        .section-title {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #94a3b8;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
        }
        .mode-auto .active .section-title {
          color: #60a5fa;
        }
        .mode-manual .active .section-title {
          color: #fbbf24;
        }
        .range-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .checkbox-group select {
           background: #1e293b;
           color: white;
           border: 1px solid #334155;
           padding: 0.2rem 0.4rem;
           border-radius: 4px;
           font-size: 0.8rem;
        }
        .settings-footer {
          margin-top: 2rem;
          display: flex;
          justify-content: flex-end;
        }
        input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }
        .save-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .save-btn:hover {
          background: #2563eb;
        }
        .mode-manual .save-btn {
          background: #f59e0b;
        }
        .mode-manual .save-btn:hover {
          background: #d97706;
        }
      `}</style>
    </div>
  );
}
