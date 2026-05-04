import type { Metadata } from "next";
import { PenSquare, Edit, Trash2, Eye } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Blog CMS" };

const posts = [
  { id: 1, title: "Zero Trust Architecture: A Guide for Modern MSPs", author: "Daniel W.", status: "Published", date: "May 01, 2026", views: "1.2k" },
  { id: 2, title: "Why Your Business Needs MDR in 2026", author: "Daniel W.", status: "Draft", date: "—", views: "0" },
  { id: 3, title: "Migrating to the Cloud: Avoid These 5 Costly Mistakes", author: "Sarah K.", status: "Published", date: "Apr 28, 2026", views: "856" },
  { id: 4, title: "The Future of AI in IT Operations (AIOps)", author: "Daniel W.", status: "Published", date: "Apr 15, 2026", views: "3.4k" },
];

export default function BlogCMSPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Content Management (CMS)
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Publish and manage blog posts, technical articles, and insights.
          </p>
        </div>
        <button className="btn-primary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px" }}>
          <PenSquare size={18} /> New Article
        </button>
      </div>

      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Article Title", "Author", "Status", "Date", "Views", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
                  <td style={{ padding: "1.25rem 1.5rem", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                    {post.title}
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{post.author}</td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <span style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                      background: post.status === "Published" ? "rgba(0,230,118,0.1)" : "rgba(255,179,0,0.1)",
                      color: post.status === "Published" ? "var(--color-success)" : "var(--color-warning)"
                    }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>{post.date}</td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem", fontWeight: 600 }}>{post.views}</td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-neutral-400)" }}><Eye size={16} /></button>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-accent-500)" }}><Edit size={16} /></button>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)" }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
