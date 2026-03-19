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
            <th>DXY</th>
            <th>US 10Y %</th>
            <th>State</th>
            <th>Score</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, idx) => (
            <tr key={idx}>
              <td>{entry.timestamp}</td>
              <td>{entry.goldPrice.toFixed(2)}</td>
              <td>{entry.dxy.toFixed(3)}</td>
              <td>{entry.realYield.toFixed(2)}</td>
              <td><strong>{entry.state}</strong></td>
              <td>{entry.confidence}</td>
              <td style={{ maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {entry.reason}
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", opacity: 0.5 }}>
                No history yet. Run an evaluation.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
