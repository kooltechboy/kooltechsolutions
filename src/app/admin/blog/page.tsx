"use client";
import { useState, useEffect } from "react";
import { PenSquare, Edit, Trash2, Eye, ToggleLeft, ToggleRight, FileText, CheckCircle, HelpCircle, Gift } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { getFallbackImage, getCategoryColor } from "@/utils/blog";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  read_time: string;
  status: string;
  author_name: string;
  created_at: string;
  image_url?: string;
  lang?: string;
  translated_from?: string | null;
}

export default function BlogCMSPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchPosts() {
      console.log("CMS: Fetching posts from secure admin API...");
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/blog");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed with status ${res.status}`);
        }
        const data = await res.json();
        console.log("CMS: Successfully fetched", data?.length || 0, "posts");
        setPosts(data || []);
        setFilteredPosts(data || []);
      } catch (err) {
        console.error("CMS: Fetch error:", err);
        setError(`DATABASE CONNECTION FAILED: ${err instanceof Error ? err.message : String(err)}`);
      }
      setLoading(false);
    }
    fetchPosts();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert("Error deleting: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert("Error updating status: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === "Published").length;
  const draftPosts = posts.filter(p => p.status !== "Published").length;

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
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
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/admin/blog/lead-magnets" className="btn-secondary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
            <Gift size={18} /> Lead Magnets
          </Link>
          <Link href="/admin/blog/new" className="btn-primary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <PenSquare size={18} /> New Article
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(0, 212, 255, 0.1)", color: "var(--color-accent-500)" }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>Total Articles</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{totalPosts}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(0, 230, 118, 0.1)", color: "var(--color-success)" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>Published</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{publishedPosts}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(255, 179, 0, 0.1)", color: "var(--color-warning)" }}>
            <HelpCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>Drafts</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{draftPosts}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(255, 179, 0, 0.1)", color: "#FFB300", fontSize: "1.25rem" }}>
            🌐
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>Spanish (ES)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{posts.filter(p => p.lang === 'es').length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 300px" }}>
          <input 
            placeholder="Search by title or author..." 
            className="input-field" 
            style={{ paddingLeft: "1rem", borderRadius: "8px", fontSize: "0.875rem" }} 
            onChange={(e) => {
              const term = e.target.value.toLowerCase();
              const filtered = posts.filter(p => 
                p.title.toLowerCase().includes(term) || 
                p.author_name.toLowerCase().includes(term)
              );
              setFilteredPosts(filtered);
            }}
          />
        </div>
        <select 
          className="input-field" 
          style={{ width: "200px", borderRadius: "8px", fontSize: "0.875rem" }}
          onChange={(e) => {
            const cat = e.target.value;
            if (cat === "All") {
              setFilteredPosts(posts);
            } else {
              setFilteredPosts(posts.filter(p => p.category === cat));
            }
          }}
        >
          <option value="All">All Categories</option>
          {["Cybersecurity", "Cloud", "AI & Automation", "Network", "Compliance", "News"].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select 
          className="input-field" 
          style={{ width: "140px", borderRadius: "8px", fontSize: "0.875rem" }}
          onChange={(e) => {
            const lang = e.target.value;
            if (lang === "All") {
              setFilteredPosts(posts);
            } else {
              setFilteredPosts(posts.filter(p => (p.lang || 'en') === lang));
            }
          }}
        >
          <option value="All">All Languages</option>
          <option value="en">🇺🇸 English</option>
          <option value="es">🇪🇸 Español</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.3)", borderRadius: "8px", color: "#FF4444", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          <strong>Database Error:</strong> {error}
        </div>
      )}

      {/* CMS Table */}
      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Article", "Lang", "Category", "Author", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    Loading articles...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No articles match your search.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const catColor = getCategoryColor(post.category);
                  return (
                    <tr key={post.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }} className="cms-table-row">
                      {/* Image + Title */}
                      <td style={{ padding: "1rem 1.5rem", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ width: "50px", height: "38px", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                            <img 
                              src={post.image_url || getFallbackImage(post.category)} 
                              alt="Thumbnail" 
                              onError={(e) => { e.currentTarget.src = getFallbackImage(post.category); }}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 700 }}>{post.title}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--color-neutral-500)", fontWeight: 400, marginTop: "0.15rem" }} title={post.excerpt}>
                              {post.excerpt.length > 60 ? post.excerpt.substring(0, 60) + "..." : post.excerpt}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Language */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          background: (post.lang || 'en') === 'es' ? 'rgba(255, 179, 0, 0.15)' : 'rgba(0, 212, 255, 0.15)',
                          color: (post.lang || 'en') === 'es' ? '#FFB300' : '#00D4FF',
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginLeft: "0.5rem",
                        }}>
                          {(post.lang || 'en').toUpperCase()}
                        </span>
                      </td>
                      {/* Category */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span className="badge" style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30`, fontSize: "0.68rem" }}>
                          {post.category}
                        </span>
                      </td>
                      {/* Author */}
                      <td style={{ padding: "1rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{post.author_name}</td>
                      {/* Status + Quick Toggle */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{
                            padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                            background: post.status === "Published" ? "rgba(0,230,118,0.1)" : "rgba(255,179,0,0.1)",
                            color: post.status === "Published" ? "var(--color-success)" : "var(--color-warning)"
                          }}>
                            {post.status}
                          </span>
                          <button
                            onClick={() => toggleStatus(post.id, post.status)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: post.status === "Published" ? "var(--color-success)" : "var(--color-neutral-500)", display: "flex", alignItems: "center" }}
                            title={post.status === "Published" ? "Switch to Draft" : "Publish Article"}
                          >
                            {post.status === "Published" ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                        </div>
                      </td>
                      {/* Date */}
                      <td style={{ padding: "1rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                        {new Date(post.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link 
                            href={`${(post.lang || 'en') === 'es' ? '/es' : ''}/blog/${post.slug}`} 
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

                          {(post.lang || 'en') === 'en' && (
                            <Link
                              href={`/admin/blog/new?translate_from=${post.id}&source_lang=en`}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: "32px", height: "32px", borderRadius: "6px",
                                background: "rgba(255, 179, 0, 0.1)", border: "1px solid rgba(255, 179, 0, 0.2)",
                                cursor: "pointer", color: "#FFB300", transition: "all 0.2s"
                              }}
                              className="action-btn"
                              title="Create Spanish Translation"
                            >
                              🌐
                            </Link>
                          )}

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .cms-table-row:hover {
          background: rgba(0, 212, 255, 0.02);
        }
        .action-btn:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
