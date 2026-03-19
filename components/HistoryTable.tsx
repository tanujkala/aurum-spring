"use client";

import type { HistoryEntry } from "@/lib/types";

interface HistoryTableProps {
  history: HistoryEntry[];
}

export function HistoryTable({ history }: HistoryTableProps) {
  return (
    <div className="history-section">
      <h3>Trigger History</h3>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Gold</th>
            <th>High</th>
            <th>DD%</th>
            <th>Zone</th>
            <th>Source</th>
            <th>Macro Score</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, idx) => (
            <tr key={idx}>
              <td>{entry.timestamp}</td>
              <td>${entry.goldPrice.toFixed(2)}</td>
              <td>{entry.recentHigh ? `$${entry.recentHigh.toFixed(0)}` : "—"}</td>
              <td>
                <span style={{ color: (entry.drawdownPct || 0) > 5 ? "var(--accent-red)" : "inherit" }}>
                  {entry.drawdownPct ? `${entry.drawdownPct.toFixed(1)}%` : "—"}
                </span>
              </td>
              <td style={{ fontSize: "0.7rem", fontWeight: 600 }}>{entry.goldZone || "—"}</td>
              <td><span className="mode-pill">{entry.zoneSource || "Auto"}</span></td>
              <td><strong>{entry.compositeScore?.toFixed(1) || "N/A"}</strong></td>
              <td className="reason-cell">
                <div className="reason-text-truncate">{entry.reason}</div>
                <div className="reason-tooltip">
                  <strong>Evaluation Rationale:</strong>
                  <p style={{ marginTop: "0.5rem" }}>{entry.reason}</p>
                </div>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", opacity: 0.5 }}>
                No history yet. Run an evaluation.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <style jsx>{`
        .mode-pill {
          font-size: 0.6rem;
          background: rgba(255,255,255,0.05);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .reason-text-truncate {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

