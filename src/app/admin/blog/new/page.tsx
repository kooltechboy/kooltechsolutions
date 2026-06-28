"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Upload, Clock, X, Loader2, Wand2, AlignLeft, Globe, CheckSquare, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { getFallbackImage } from "@/utils/blog";
import CoverImageUploader from "@/components/blog/CoverImageUploader";
import SeoPreview from "@/components/blog/SeoPreview";

export default function NewBlogPostPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [leadMagnets, setLeadMagnets] = useState<any[]>([]);
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);
  const [submittingLeadMagnet, setSubmittingLeadMagnet] = useState(false);
  const [leadMagnetError, setLeadMagnetError] = useState<string | null>(null);
  const [newMagnet, setNewMagnet] = useState({ title: "", description: "", cta_button_text: "Download Free Guide" });
  const [newMagnetFile, setNewMagnetFile] = useState<File | null>(null);

  const handleCreateLeadMagnet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMagnetFile) {
      setLeadMagnetError("Please select a PDF file.");
      return;
    }
    setSubmittingLeadMagnet(true);
    setLeadMagnetError(null);
    try {
      const fd = new FormData();
      fd.append("title", newMagnet.title);
      fd.append("description", newMagnet.description);
      fd.append("cta_button_text", newMagnet.cta_button_text);
      fd.append("pdf", newMagnetFile);

      const res = await fetch("/api/admin/lead-magnets", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lead magnet");

      // Reload lead magnets list
      const lmRes = await fetch("/api/admin/lead-magnets");
      if (lmRes.ok) {
        const lmData = await lmRes.json();
        setLeadMagnets(lmData.filter((m: any) => m.active));
      }

      // Auto-link new lead magnet
      setFormData(prev => ({ ...prev, lead_magnet_id: data.id }));
      setShowLeadMagnetModal(false);
      setNewMagnet({ title: "", description: "", cta_button_text: "Download Free Guide" });
      setNewMagnetFile(null);
    } catch (err) {
      setLeadMagnetError(err instanceof Error ? err.message : "Failed to create lead magnet");
    } finally {
      setSubmittingLeadMagnet(false);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "Cybersecurity",
    read_time: "1 min",
    status: "Draft",
    author_name: "Daniel Joseph Williams",
    content: "",
    image_url: "",
    lang: "en",
    translated_from: null as string | null,
    meta_title: "",
    published_at: "",
    tags: "",
    lead_magnet_id: "",
  });

  // Load drafts and lead magnets
  useEffect(() => {
    const saved = localStorage.getItem("draft_new_post");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (err) {}
    }

    async function loadMagnets() {
      try {
        const res = await fetch("/api/admin/lead-magnets");
        if (res.ok) {
          const data = await res.json();
          setLeadMagnets(data.filter((m: any) => m.active));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadMagnets();
  }, []);

  // Save draft locally
  useEffect(() => {
    localStorage.setItem("draft_new_post", JSON.stringify(formData));
  }, [formData]);

  // Dynamically set logged-in user as author name
  useEffect(() => {
    async function getAuthor() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email || "Daniel Joseph Williams";
        setFormData(prev => ({ ...prev, author_name: name }));
      }
    }
    getAuthor();
  }, [supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const translateFrom = params.get('translate_from');
    if (translateFrom) {
      async function loadSourcePost() {
        try {
          const res = await fetch(`/api/admin/blog?id=${translateFrom}`);
          if (res.ok) {
            const source = await res.json();
            setFormData(prev => ({
              ...prev,
              lang: 'es',
              translated_from: translateFrom,
              category: source.category,
              image_url: source.image_url || '',
              content: `<!-- TRANSLATE FROM ENGLISH -->\n<!-- Original Title: ${source.title} -->\n\n${source.content}`,
            }));
          }
        } catch (err) {
          console.error('Failed to load source post:', err);
        }
      }
      loadSourcePost();
    }
  }, []);

  const handleAIRefine = async () => {
    if (!formData.content) return;
    setAiRefining(true);
    setError(null);

    try {
      const response = await fetch("/api/blog/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: formData.content,
          instruction: aiInstruction 
        }),
      });

      const data = await response.json();
      if (data.refinedContent) {
        setFormData({ ...formData, content: data.refinedContent });
      } else {
        throw new Error(data.error || "Failed to refine content");
      }
    } catch (err) {
      setError("AI Refine Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAiRefining(false);
    }
  };

  const handleGenerateFromTitle = async () => {
    if (!formData.title) {
      setError("Please enter a title first.");
      return;
    }
    setAiRefining(true);
    setError(null);

    try {
      const response = await fetch("/api/blog/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: 'generate',
          title: formData.title,
          instruction: aiInstruction 
        }),
      });

      const data = await response.json();
      if (data.refinedContent) {
        setFormData({ ...formData, content: data.refinedContent });
      } else {
        throw new Error(data.error || "Failed to generate article");
      }
    } catch (err) {
      setError("Generation Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAiRefining(false);
    }
  };

  // Compute dynamic read time on the fly
  const words = formData.content?.split(/\s+/).filter(w => w.length > 0).length || 0;
  const dynamicReadTime = `${Math.max(1, Math.ceil(words / 200))} min`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      
      // Clear title if it's currently empty to allow auto-fill
      let finalTitle = formData.title;
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (!finalTitle && lines.length > 0) {
        finalTitle = lines[0].replace(/^#+\s+/, '').trim();
      }

      setFormData(prev => ({ 
        ...prev, 
        content,
        title: finalTitle,
        slug: prev.slug || (finalTitle ? generateSlug(finalTitle) : "")
      }));

      try {
        setAiRefining(true);
        const response = await fetch("/api/blog/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            mode: 'complete',
            content: content
          }),
        });
        const data = await response.json();
        if (data.metadata) {
          setFormData(prev => ({
            ...prev,
            title: prev.title || data.metadata.title || finalTitle,
            slug: prev.slug || data.metadata.slug || (data.metadata.title ? generateSlug(data.metadata.title) : ""),
            excerpt: prev.excerpt || data.metadata.excerpt,
            category: prev.category === "Cybersecurity" ? data.metadata.category : prev.category,
            read_time: prev.read_time === "1 min" ? data.metadata.read_time : prev.read_time,
            meta_title: prev.meta_title || data.metadata.meta_title || "",
            tags: prev.tags || (data.metadata.tags && Array.isArray(data.metadata.tags) ? data.metadata.tags.join(", ") : ""),
          }));
        }
      } catch (err) {
        console.warn("Auto-metadata generation failed:", err);
      } finally {
        setAiRefining(false);
      }
    };
    reader.readAsText(file);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-extract title from content if missing
    let currentTitle = formData.title;
    if (!currentTitle && formData.content) {
      const firstLine = formData.content.split('\n')[0].replace(/^#+\s+/, '').trim();
      currentTitle = firstLine.substring(0, 100);
    }

    if (!formData.content || !currentTitle) {
      setError("Please provide at least some content or a title.");
      return;
    }

    setSaving(true);
    setError(null);

    let finalData = { 
      ...formData, 
      title: currentTitle,
      read_time: dynamicReadTime 
    };

    // Autonomous Completion (Enforcing Excerpt, Category, and Cover Image)
    if (!formData.excerpt || formData.category === "Cybersecurity" || !formData.image_url) {
      try {
        const response = await fetch("/api/blog/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            mode: 'complete',
            content: `Title: ${formData.title}\n\nContent: ${formData.content}`
          }),
        });
        const data = await response.json();
        if (data.metadata) {
          finalData = {
            ...finalData,
            excerpt: formData.excerpt || data.metadata.excerpt,
            category: (formData.category === "Cybersecurity" || !formData.category) ? data.metadata.category : formData.category,
            read_time: (formData.read_time === "5 min" || !formData.read_time) ? data.metadata.read_time : formData.read_time,
            // Intelligent Cover Image Suggestion if missing
            image_url: formData.image_url || getFallbackImage((formData.category === "Cybersecurity" || !formData.category) ? data.metadata.category : formData.category)
          };
        }
      } catch {
        console.warn("AI metadata completion failed.");
      }
    }

    // Set fallback image if it is still empty
    if (!finalData.image_url) {
      finalData.image_url = getFallbackImage(finalData.category);
    }

    // Final Slug Sanity Check
    if (!finalData.slug) finalData.slug = generateSlug(currentTitle);

    try {
      const payload = {
        ...finalData,
        tags: finalData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        meta_title: finalData.meta_title || null,
        published_at: finalData.published_at ? new Date(finalData.published_at).toISOString() : null,
        lead_magnet_id: finalData.lead_magnet_id || null,
        lang: finalData.lang,
        translated_from: finalData.translated_from || undefined,
      };
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      localStorage.removeItem("draft_new_post");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/blog" style={{ color: "var(--color-neutral-400)", textDecoration: "none" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            New Article
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Create a new blog post for the Kool Tech public blog.
          </p>
        </div>
      </div>

      {formData.translated_from && (
        <div style={{ 
          padding: "1rem 1.5rem", 
          background: "rgba(255, 179, 0, 0.08)", 
          border: "1px solid rgba(255, 179, 0, 0.2)", 
          borderRadius: "12px", 
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: "#FFB300",
          fontSize: "0.875rem",
        }}>
          🌐 Creating Spanish translation of an existing English article. The original content has been loaded for reference.
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <input 
          id="file-upload"
          type="file" 
          accept=".md,.txt"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => document.getElementById('file-upload')?.click()}
          className="btn-secondary"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.75rem", borderRadius: "8px" }}
        >
          <Upload size={18} /> Import .md / .txt
        </button>
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(255, 68, 68, 0.1)", color: "#FF4444", borderRadius: "8px", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "2rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Title</label>
            <input 
              required
              className="input-field" 
              value={formData.title} 
              onChange={handleTitleChange} 
              placeholder="E.g., Zero-Trust Security..."
            />
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Slug URL</label>
            <input 
              required
              className="input-field" 
              value={formData.slug} 
              onChange={e => setFormData({ ...formData, slug: e.target.value })} 
            />
          </div>
        </div>

        <div>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>SEO Excerpt (Summary)</label>
          <textarea 
            className="input-field" 
            style={{ minHeight: "80px", resize: "vertical", padding: "1rem" }}
            value={formData.excerpt} 
            onChange={e => setFormData({ ...formData, excerpt: e.target.value })} 
            placeholder="A compelling summary for search results..."
          />
        </div>

        <CoverImageUploader
          value={formData.image_url}
          category={formData.category}
          onChange={(url) => setFormData({ ...formData, image_url: url })}
        />

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Category</label>
            <select 
              className="input-field" 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {["Cybersecurity", "Cloud", "AI & Automation", "Network", "Compliance", "News"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 100px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Read Time</label>
            <div className="input-field" style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.2)", cursor: "default" }}>
              <Clock size={14} style={{ marginRight: "0.5rem", color: "var(--color-accent-400)" }} /> {dynamicReadTime}
            </div>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Status</label>
            <select 
              className="input-field" 
              value={formData.status} 
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Language</label>
            <select 
              className="input-field" 
              value={formData.lang} 
              onChange={(e) => setFormData(prev => ({ ...prev, lang: e.target.value }))}
              disabled={!!formData.translated_from}
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "1.5rem" }}>
          <h4 style={{ color: "white", fontSize: "0.9375rem", margin: "0 0 1rem", fontWeight: 700 }}>Advanced Publishing & SEO</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Meta Title (SEO Override)</label>
              <input 
                className="input-field" 
                value={formData.meta_title} 
                onChange={e => setFormData({ ...formData, meta_title: e.target.value })} 
                placeholder="Custom title for search engines..."
              />
            </div>
            <div>
              <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Tags (Comma-separated)</label>
              <input 
                className="input-field" 
                value={formData.tags} 
                onChange={e => setFormData({ ...formData, tags: e.target.value })} 
                placeholder="tech, security, news"
              />
            </div>
            <div>
              <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Publish Date (Optional Backdate/Schedule)</label>
              <input 
                type="datetime-local"
                className="input-field" 
                value={formData.published_at} 
                onChange={e => setFormData({ ...formData, published_at: e.target.value })} 
              />
            </div>
            <div>
              <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Linked Lead Magnet</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select 
                  className="input-field" 
                  value={formData.lead_magnet_id} 
                  onChange={e => setFormData({ ...formData, lead_magnet_id: e.target.value })}
                  style={{ flex: 1 }}
                >
                  <option value="">— No Lead Magnet —</option>
                  {leadMagnets.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowLeadMagnetModal(true)}
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0 1rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                >
                  + Create New
                </button>
              </div>
            </div>
          </div>
        </div>

        {showLeadMagnetModal && (
          <div 
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
              zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem"
            }}
          >
            <div className="glass-card" style={{
              width: "100%", maxWidth: "500px", borderRadius: "20px",
              overflow: "hidden", position: "relative",
              border: "1px solid rgba(0,212,255,0.2)",
              background: "#0d1527"
            }}>
              <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,212,255,0.02)" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", margin: 0 }}>
                  Create New Lead Magnet
                </h2>
                <button type="button" onClick={() => setShowLeadMagnetModal(false)} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateLeadMagnet} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {leadMagnetError && (
                  <div style={{ padding: "0.75rem", background: "rgba(255, 68, 68, 0.1)", color: "#FF4444", borderRadius: "8px", fontSize: "0.875rem" }}>
                    {leadMagnetError}
                  </div>
                )}
                
                <div>
                  <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Free Cybersecurity Checklist 2026"
                    className="input-field" 
                    value={newMagnet.title}
                    onChange={e => setNewMagnet({ ...newMagnet, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Description / Hook text</label>
                  <textarea 
                    placeholder="Explain why they should download this guide..."
                    className="input-field" 
                    style={{ minHeight: "80px", resize: "vertical" }}
                    value={newMagnet.description}
                    onChange={e => setNewMagnet({ ...newMagnet, description: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>CTA Button Text</label>
                  <input 
                    type="text" 
                    placeholder="Download Free Guide"
                    className="input-field" 
                    value={newMagnet.cta_button_text}
                    onChange={e => setNewMagnet({ ...newMagnet, cta_button_text: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>PDF File</label>
                  <input 
                    type="file" 
                    required 
                    accept="application/pdf"
                    onChange={e => setNewMagnetFile(e.target.files?.[0] || null)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowLeadMagnetModal(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: "0.75rem", borderRadius: "8px" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingLeadMagnet}
                    className="btn-primary"
                    style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", background: "var(--color-accent-600)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    {submittingLeadMagnet ? <Loader2 className="animate-spin" size={16} /> : "Create & Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ background: "rgba(168,85,247,0.05)", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(168,85,247,0.2)", marginBottom: "1.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-accent-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: "0.9375rem", color: "white", margin: 0, fontWeight: 700 }}>AI Editorial Engine</h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", margin: 0 }}>Command the AI to refine, expand, or stylize your content.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input 
              className="input-field" 
              style={{ flex: 1, fontSize: "0.875rem", background: "rgba(0,0,0,0.3)", borderColor: "rgba(168,85,247,0.3)" }}
              placeholder="E.g. 'Add a technical deep-dive section', 'Rewrite in a more authoritative tone'..."
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
            />
            {formData.content ? (
              <button 
                type="button"
                onClick={handleAIRefine}
                disabled={aiRefining}
                className="btn-primary" 
                style={{ padding: "0.5rem 2rem", fontSize: "0.875rem", background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", border: "none", borderRadius: "8px" }}
              >
                {aiRefining ? "Processing..." : "✨ Refine Content"}
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleGenerateFromTitle}
                disabled={aiRefining || !formData.title}
                className="btn-primary" 
                style={{ padding: "0.5rem 2rem", fontSize: "0.875rem", background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", border: "none", borderRadius: "8px" }}
              >
                {aiRefining ? "Generating..." : "⚡ Generate From Title"}
              </button>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>Blog Content (Rich Text / Markdown)</label>
            {/* AI Quick Action Presets */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[
                { icon: <AlignLeft size={12} />, label: "Generate Outline", prompt: "Generate a detailed structured outline for this article with H2/H3 headings and bullet points for each section." },
                { icon: <Wand2 size={12} />, label: "Optimize SEO", prompt: "Optimize this content for SEO: improve keyword density, add internal linking suggestions, and strengthen headings." },
                { icon: <Globe size={12} />, label: "Translate to Spanish", prompt: "Translate this entire blog post content into professional Latin American Spanish, preserving all Markdown formatting." },
                { icon: <CheckSquare size={12} />, label: "Proofread", prompt: "Proofread this content for grammar, clarity, and consistency. Fix any issues and improve sentence flow without changing the overall structure." },
                { icon: <Zap size={12} />, label: "Expand Content", prompt: "Expand this article with more detail, examples, and depth. Add relevant statistics or case studies where appropriate." },
              ].map(({ icon, label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setAiInstruction(prompt); }}
                  disabled={aiRefining}
                  title={prompt}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    padding: "0.3rem 0.65rem", fontSize: "0.7rem", fontWeight: 600,
                    borderRadius: "6px", cursor: "pointer",
                    background: "rgba(168,85,247,0.1)",
                    border: "1px solid rgba(168,85,247,0.25)",
                    color: "#C084FC",
                    transition: "all 0.15s"
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
          <div className="modern-editor-container" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <MdEditor 
              modelValue={formData.content} 
              onChange={(val) => setFormData({ ...formData, content: val })}
              theme="dark"
              language="en-US"
              placeholder="Start writing your masterpiece..."
              style={{ height: '500px' }}
              onUploadImg={async (files, callback) => {
                const res = await Promise.all(
                  files.map(async (file) => {
                    const fd = new FormData();
                    fd.append("file", file);
                    const uploadRes = await fetch("/api/admin/blog/upload-image", {
                      method: "POST",
                      body: fd,
                    });
                    const data = await uploadRes.json();
                    return data.url;
                  })
                );
                callback(res.map(url => url));
              }}
              toolbars={[
                'bold',
                'italic',
                'underline',
                'strikeThrough',
                '-',
                'title',
                'sub',
                'sup',
                'quote',
                'unorderedList',
                'orderedList',
                '-',
                'code',
                'link',
                'image',
                'table',
                '-',
                'revoke',
                'next',
                'save',
                '=',
                'pageFullscreen',
                'fullscreen',
                'preview',
                'htmlPreview'
              ]}
            />
          </div>
        </div>

        <SeoPreview
          title={formData.title}
          metaTitle={formData.meta_title}
          excerpt={formData.excerpt}
          slug={formData.slug}
          imageUrl={formData.image_url}
          category={formData.category}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "0.75rem 2rem", borderRadius: "8px" }}>
            {saving ? "Saving..." : <><Save size={18} /> Save Article</>}
          </button>
        </div>

      </form>
    </div>
  );
}
