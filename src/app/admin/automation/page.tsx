import type { Metadata } from "next";
import { Zap, Play, Pause, Clock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Automation" };

const workflows = [
  { id: "wf-1", name: "High CPU Alert \u2192 Create Ticket", trigger: "Wazuh Alert", status: "Active", runs: 142 },
  { id: "wf-2", name: "SLA Breach Warning \u2192 Slack", trigger: "Ticket Age > 3h", status: "Active", runs: 28 },
  { id: "wf-3", name: "New Lead \u2192 Welcome Email Series", trigger: "Form Submit", status: "Paused", runs: 0 },
  { id: "wf-4", name: "Failed Backup \u2192 PagerDuty", trigger: "Veeam API", status: "Active", runs: 3 },
  { id: "wf-5", name: "Auto-Close Stale Tickets", trigger: "Schedule (Daily)", status: "Active", runs: 812 },
];

export default function AutomationPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Workflows & Automation
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Automate tedious tasks using trigger-based workflow rules.
          </p>
        </div>
        <button className="btn-primary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px" }}>
          <Zap size={18} /> Create Workflow
        </button>
      </div>

      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
              {["Workflow Name", "Trigger", "Status", "Total Runs", "Action"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workflows.map((wf) => (
              <tr key={wf.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
                <td style={{ padding: "1.25rem 1.5rem", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Zap size={16} color="var(--color-accent-500)" /> {wf.name}
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                  <div style={{ display: "inline-block", background: "rgba(0,212,255,0.1)", padding: "0.25rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {wf.trigger}
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: wf.status === "Active" ? "var(--color-success)" : "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 600 }}>
                    {wf.status === "Active" ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />} {wf.status}
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem", fontWeight: 600 }}>
                  {wf.runs.toLocaleString()}
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <button style={{ 
                    padding: "0.375rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                    background: wf.status === "Active" ? "rgba(255,68,68,0.1)" : "rgba(0,230,118,0.1)",
                    border: "none", color: wf.status === "Active" ? "var(--color-danger)" : "var(--color-success)"
                  }}>
                    {wf.status === "Active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
