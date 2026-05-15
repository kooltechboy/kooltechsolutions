"use client";
import { useState, useEffect } from "react";
import { PenSquare, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function BlogCMSPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    console.log("CMS: Fetching posts from Supabase...");
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("CMS: Supabase Error:", error);
        setError(`DATABASE CONNECTION FAILED: ${error.message} (Code: ${error.code})`);
      } else {
        console.log("CMS: Successfully fetched", data?.length || 0, "posts");
        setPosts(data || []);
      }
    } catch (err: any) {
      console.error("CMS: Unexpected error:", err);
      setError(`CRITICAL SYSTEM ERROR: ${err.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      fetchPosts();
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", background: "rgba(0,212,255,0.1)", borderRadius: "6px", marginBottom: "1rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: loading ? "#FFB300" : "#00E676" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-accent-400)" }}>
              {loading ? "CONNECTING TO SUPABASE..." : "LIVE DATABASE CONNECTED"}
            </span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Content Management (CMS)
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Publish and manage blog posts, technical articles, and insights.
          </p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <PenSquare size={18} /> New Article
        </Link>
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.3)", borderRadius: "8px", color: "#FF4444", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          <strong>Database Error:</strong> {error}
        </div>
      )}

      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Article Title", "Author", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    Loading articles...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No articles found. Create one to get started.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
                    <td style={{ padding: "1.25rem 1.5rem", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                      {post.title}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{post.author_name}</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span style={{
                        padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: post.status === "Published" ? "rgba(0,230,118,0.1)" : "rgba(255,179,0,0.1)",
                        color: post.status === "Published" ? "var(--color-success)" : "var(--color-warning)"
                      }}>
                        {post.status}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                      {new Date(post.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link 
                          href={`/blog/${post.slug}`} 
                          target="_blank" 
                          style={{ 
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "32px", height: "32px", borderRadius: "6px",
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer", color: "var(--color-neutral-400)", transition: "all 0.2s" 
                          }}
                          className="action-btn"
                          title="View Live"
                        >
                          <Eye size={16} />
                        </Link>
                        
                        <Link 
                          href={`/admin/blog/edit/${post.id}`} 
                          style={{ 
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "32px", height: "32px", borderRadius: "6px",
                            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
                            cursor: "pointer", color: "var(--color-accent-400)", transition: "all 0.2s" 
                          }}
                          className="action-btn"
                          title="Edit Article"
                        >
                          <Edit size={16} />
                        </Link>

                        <button 
                          onClick={() => handleDelete(post.id)} 
                          style={{ 
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "32px", height: "32px", borderRadius: "6px",
                            background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)",
                            cursor: "pointer", color: "#FF4444", transition: "all 0.2s" 
                          }}
                          className="action-btn"
                          title="Delete Article"
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
    </div>
  );
}
