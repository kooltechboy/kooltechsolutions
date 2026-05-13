"use client";
import { useState } from "react";
import { FolderOpen, FileText, Shield, Book, Download, Search, Lock } from "lucide-react";

const documentCategories = [
  {
    name: "Service Agreements",
    icon: FileText,
    color: "#00D4FF",
    docs: [
      { name: "Master Service Agreement (MSA)", date: "Jan 15, 2026", size: "2.4 MB", type: "PDF", locked: false },
      { name: "Service Level Agreement (SLA)", date: "Jan 15, 2026", size: "1.1 MB", type: "PDF", locked: false },
      { name: "Acceptable Use Policy", date: "Jan 15, 2026", size: "0.8 MB", type: "PDF", locked: false },
    ],
  },
  {
    name: "Security & Compliance",
    icon: Shield,
    color: "#A855F7",
    docs: [
      { name: "Security Assessment Report Q1 2026", date: "Apr 1, 2026", size: "5.2 MB", type: "PDF", locked: false },
      { name: "Penetration Test Results (Confidential)", date: "Mar 14, 2026", size: "3.8 MB", type: "PDF", locked: true },
      { name: "Compliance Posture Report (HIPAA)", date: "Apr 15, 2026", size: "2.9 MB", type: "PDF", locked: false },
    ],
  },
  {
    name: "Runbooks & Procedures",
    icon: Book,
    color: "#00E676",
    docs: [
      { name: "Incident Response Playbook", date: "Feb 1, 2026", size: "1.7 MB", type: "PDF", locked: false },
      { name: "Backup & Recovery Procedure", date: "Feb 1, 2026", size: "1.2 MB", type: "PDF", locked: false },
      { name: "Change Management Process", date: "Mar 1, 2026", size: "0.9 MB", type: "PDF", locked: false },
    ],
  },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const allDocs = documentCategories.flatMap(c => c.docs.map(d => ({ ...d, category: c.name })));
  const filtered = search ? allDocs.filter(d => d.name.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Document <span className="gradient-text">Repository</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          All contracts, security reports, compliance documents, and operational runbooks.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: "440px", marginBottom: "2rem" }}>
        <Search size={16} color="var(--color-neutral-400)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", paddingLeft: "2.75rem", padding: "0.75rem 1rem 0.75rem 2.75rem", borderRadius: "10px", border: "1px solid rgba(75,132,200,0.2)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "0.875rem", outline: "none" }}
        />
      </div>

      {/* Search Results */}
      {filtered ? (
        <div className="kpi-card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1rem" }}>
            Search Results ({filtered.length})
          </h2>
          {filtered.map(doc => (
            <DocRow key={doc.name} doc={doc} color="#00D4FF" />
          ))}
          {filtered.length === 0 && <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>No documents match your search.</p>}
        </div>
      ) : (
        documentCategories.map(cat => {
          const CatIcon = cat.icon;
          return (
            <div key={cat.name} className="kpi-card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "8px", background: `${cat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CatIcon size={18} color={cat.color} />
                </div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>{cat.name}</h2>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--color-neutral-500)" }}>{cat.docs.length} files</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {cat.docs.map(doc => <DocRow key={doc.name} doc={doc} color={cat.color} />)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function DocRow({ doc, color }: { doc: any; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(75,132,200,0.07)", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: "6px", background: `${color}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {doc.locked ? <Lock size={14} color="#FF4444" /> : <FileText size={14} color={color} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: doc.locked ? "var(--color-neutral-400)" : "white", fontWeight: 500, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
          <div style={{ color: "var(--color-neutral-500)", fontSize: "0.72rem" }}>{doc.date} · {doc.size}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <span style={{ padding: "0.15rem 0.5rem", background: "rgba(75,132,200,0.1)", borderRadius: "4px", color: "var(--color-neutral-400)", fontSize: "0.68rem", fontWeight: 600 }}>{doc.type}</span>
        {doc.locked ? (
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#FF4444", fontSize: "0.75rem" }}><Lock size={12} /> Restricted</span>
        ) : (
          <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "6px", color: "var(--color-accent-500)", fontSize: "0.75rem", padding: "0.35rem 0.75rem", cursor: "pointer", fontWeight: 600 }}>
            <Download size={13} /> Download
          </button>
        )}
      </div>
    </div>
  );
}
