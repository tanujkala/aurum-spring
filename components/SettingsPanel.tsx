"use client";

import { useState } from "react";
import type { ThresholdSettings } from "@/lib/types";

interface SettingsPanelProps {
  settings: ThresholdSettings;
  onSave: (newSettings: ThresholdSettings) => void;
}

export function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [formData, setFormData] = useState<ThresholdSettings>(settings);

  const handleChange = (key: keyof ThresholdSettings, value: string) => {
    setFormData({ ...formData, [key]: Number(value) });
  };

  const handleSave = () => {
    onSave(formData);
    alert("Settings saved!");
  };

  return (
    <div className="settings-section">
      <h3>Settings</h3>
      <div className="settings-grid">
        <div className="setting-group">
          <label>Starter Buy Lower</label>
          <input type="number" step="1" value={formData.goldStarterLower} onChange={(e) => handleChange("goldStarterLower", e.target.value)} />
        </div>
        <div className="setting-group">
          <label>Starter Buy Upper</label>
          <input type="number" step="1" value={formData.goldStarterUpper} onChange={(e) => handleChange("goldStarterUpper", e.target.value)} />
        </div>
        <div className="setting-group">
          <label>Add Trigger Reclaim</label>
          <input type="number" step="1" value={formData.goldReclaim} onChange={(e) => handleChange("goldReclaim", e.target.value)} />
        </div>
        <div className="setting-group">
          <label>Aggressive Lower</label>
          <input type="number" step="1" value={formData.goldAggressiveLower} onChange={(e) => handleChange("goldAggressiveLower", e.target.value)} />
        </div>
        <div className="setting-group">
          <label>Aggressive Upper</label>
          <input type="number" step="1" value={formData.goldAggressiveUpper} onChange={(e) => handleChange("goldAggressiveUpper", e.target.value)} />
        </div>
        <div className="setting-group">
          <label>DXY Weak Threshold</label>
          <input type="number" step="0.1" value={formData.dxyWeak} onChange={(e) => handleChange("dxyWeak", e.target.value)} />
        </div>
        <div className="setting-group">
          <label>DXY Strong Threshold</label>
          <input type="number" step="0.1" value={formData.dxyStrong} onChange={(e) => handleChange("dxyStrong", e.target.value)} />
        </div>
        <div className="setting-group">
          <label>Yield Flat Threshold</label>
          <input type="number" step="0.01" value={formData.realYieldFlatThreshold} onChange={(e) => handleChange("realYieldFlatThreshold", e.target.value)} />
        </div>
      </div>
      <button className="save-btn" onClick={handleSave}>Save Settings</button>
    </div>
  );
}
