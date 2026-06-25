"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Download,
  FileText,
  Upload,
  Loader2,
  Gift,
  Edit2,
  X,
  Save,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
}

interface LeadMagnet {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string;
  pdf_filename: string | null;
  cta_button_text: string;
  active: boolean;
  download_count: number;
  created_at: string;
  post_id: string | null;
  posts: { id: string; title: string; slug: string } | null;
}

const emptyForm = {
  title: "",
  description: "",
  cta_button_text: "Download Free Guide",
  post_id: "",
};

export default function LeadMagnetsPage() {
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, pRes] = await Promise.all([
        fetch("/api/admin/lead-magnets"),
        fetch("/api/admin/blog"),
      ]);
      const [mData, pData] = await Promise.all([mRes.json(), pRes.json()]);
      setMagnets(mData || []);
      // only English published posts
      setPosts(
        (pData || []).filter(
          (p: Post & { lang?: string; status?: string }) =>
            (p.lang || "en") === "en" && p.status === "Published"
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setFormError("Please select a PDF file to upload.");
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("cta_button_text", formData.cta_button_text);
      if (formData.post_id) fd.append("post_id", formData.post_id);
      fd.append("pdf", pdfFile);

      const res = await fetch("/api/admin/lead-magnets", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");

      setShowForm(false);
      setFormData(emptyForm);
      setPdfFile(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    }
    setSubmitting(false);
  };

  const handleToggle = async (magnet: LeadMagnet) => {
    try {
      await fetch("/api/admin/lead-magnets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: magnet.id, active: !magnet.active }),
      });
      await load();
    } catch {
      alert("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead magnet? This will also remove the PDF from storage.")) return;
    try {
      const res = await fetch(`/api/admin/lead-magnets?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      await load();
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleInlineEdit = async (id: string, field: string, value: string) => {
    try {
      await fetch("/api/admin/lead-magnets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      setEditingId(null);
      await load();
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <Link
            href="/admin/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--color-neutral-500)",
              fontSize: "0.8125rem",
              textDecoration: "none",
              marginBottom: "0.75rem",
            }}
          >
            <ArrowLeft size={14} /> Back to CMS
          </Link>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: 0,
            }}
          >
            <Gift size={24} color="#00D4FF" /> Lead Magnets
          </h1>
          <p
            style={{
              color: "var(--color-neutral-500)",
              fontSize: "0.875rem",
              marginTop: "0.25rem",
            }}
          >
            Create gated PDF resources attached to blog posts to capture leads.
          </p>
        </div>

        <button
          onClick={() => { setShowForm(true); setFormError(null); }}
          className="btn-primary"
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Plus size={18} /> New Lead Magnet
        </button>
      </div>

      {/* KPI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total Magnets", value: magnets.length, color: "#00D4FF" },
          { label: "Active", value: magnets.filter((m) => m.active).length, color: "#00E676" },
          {
            label: "Total Downloads",
            value: magnets.reduce((s, m) => s + (m.download_count || 0), 0),
            color: "#A855F7",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="glass-card"
            style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "10px",
                background: `${kpi.color}18`,
                color: kpi.color,
              }}
            >
              <Gift size={22} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "rgba(255,68,68,0.1)",
            border: "1px solid rgba(255,68,68,0.3)",
            borderRadius: "8px",
            color: "#FF4444",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div
          className="glass-card"
          style={{
            padding: "2rem",
            borderRadius: "16px",
            marginBottom: "2rem",
            border: "1px solid rgba(0,212,255,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "1.125rem",
                color: "white",
                margin: 0,
              }}
            >
              New Lead Magnet
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-neutral-500)" }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 240px" }}>
                <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>
                  Title *
                </label>
                <input
                  required
                  className="input-field"
                  placeholder="E.g., The Ultimate Cybersecurity Checklist"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>
                  CTA Button Text
                </label>
                <input
                  className="input-field"
                  value={formData.cta_button_text}
                  onChange={(e) => setFormData((p) => ({ ...p, cta_button_text: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>
                Description (shown in the blog sidebar)
              </label>
              <textarea
                className="input-field"
                style={{ minHeight: "70px", resize: "vertical", padding: "0.75rem" }}
                placeholder="A short description of what readers will get..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>
                Link to Blog Post (optional)
              </label>
              <select
                className="input-field"
                value={formData.post_id}
                onChange={(e) => setFormData((p) => ({ ...p, post_id: e.target.value }))}
              >
                <option value="">— No post linked (standalone) —</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>
                PDF File * (max 25 MB)
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${pdfFile ? "rgba(0,230,118,0.4)" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: "10px",
                  padding: "1.25rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: pdfFile ? "rgba(0,230,118,0.04)" : "rgba(0,0,0,0.2)",
                  transition: "all 0.2s",
                }}
              >
                {pdfFile ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#00E676" }}>
                    <FileText size={18} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{pdfFile.name}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-neutral-500)" }}>
                      ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} style={{ color: "var(--color-neutral-600)", marginBottom: "0.4rem" }} />
                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-neutral-400)" }}>
                      Click to select PDF · Max 25 MB
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPdfFile(f);
                  }}
                />
              </div>
            </div>

            {formError && (
              <div style={{ padding: "0.75rem 1rem", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "8px", color: "#FF4444", fontSize: "0.875rem" }}>
                {formError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--color-neutral-300)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ padding: "0.625rem 1.5rem", borderRadius: "8px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                ) : (
                  <><Save size={16} /> Create Lead Magnet</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Lead Magnet", "Linked Post", "Downloads", "Status", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.875rem 1.5rem",
                      color: "var(--color-neutral-500)",
                      fontSize: "0.75rem",
                      textAlign: "left",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: "0 auto" }} />
                  </td>
                </tr>
              ) : magnets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    <Gift size={32} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>No lead magnets yet. Create your first one above.</p>
                  </td>
                </tr>
              ) : (
                magnets.map((m) => (
                  <tr
                    key={m.id}
                    style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}
                    className="cms-table-row"
                  >
                    {/* Title + PDF */}
                    <td style={{ padding: "1rem 1.5rem", maxWidth: "280px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div
                          style={{
                            padding: "0.6rem",
                            borderRadius: "8px",
                            background: "rgba(0,212,255,0.08)",
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={16} color="#00D4FF" />
                        </div>
                        <div>
                          <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{m.title}</div>
                          <div style={{ color: "var(--color-neutral-600)", fontSize: "0.72rem", marginTop: "0.15rem" }}>
                            📎 {m.pdf_filename || m.pdf_url.split("/").pop()}
                          </div>
                          <div style={{ color: "var(--color-neutral-500)", fontSize: "0.72rem" }}>
                            CTA: {m.cta_button_text}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Linked post */}
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem" }}>
                      {m.posts ? (
                        <Link
                          href={`/blog/${m.posts.slug}`}
                          target="_blank"
                          style={{ color: "#00D4FF", textDecoration: "none", fontSize: "0.8125rem" }}
                        >
                          {m.posts.title.length > 40
                            ? m.posts.title.substring(0, 40) + "…"
                            : m.posts.title}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--color-neutral-600)" }}>— standalone —</span>
                      )}
                    </td>

                    {/* Downloads */}
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-300)", fontSize: "0.9375rem", fontWeight: 700 }}>
                        <Download size={14} color="#A855F7" />
                        {m.download_count ?? 0}
                      </div>
                    </td>

                    {/* Status toggle */}
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.625rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: m.active ? "rgba(0,230,118,0.1)" : "rgba(255,179,0,0.1)",
                            color: m.active ? "var(--color-success)" : "var(--color-warning)",
                          }}
                        >
                          {m.active ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() => handleToggle(m)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: m.active ? "var(--color-success)" : "var(--color-neutral-500)", display: "flex", alignItems: "center" }}
                          title={m.active ? "Deactivate" : "Activate"}
                        >
                          {m.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "1rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                      {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleDelete(m.id)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", cursor: "pointer", color: "#FF4444" }}
                          className="action-btn"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .cms-table-row:hover { background: rgba(0,212,255,0.02); }
        .action-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
