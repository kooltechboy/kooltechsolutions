"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Clock, Loader2, X, Wand2, AlignLeft, Globe, CheckSquare, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import { getFallbackImage } from "@/utils/blog";
import CoverImageUploader from "@/components/blog/CoverImageUploader";
import SeoPreview from "@/components/blog/SeoPreview";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");

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
    meta_title: "",
    published_at: "",
    tags: "",
    lead_magnet_id: "",
  });

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

  // Local storage auto-save
  useEffect(() => {
    if (!loading && formData.title) {
      localStorage.setItem(`draft_edit_post_${id}`, JSON.stringify(formData));
    }
  }, [formData, id, loading]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postRes, magnetsRes] = await Promise.all([
          fetch(`/api/admin/blog?id=${id}`),
          fetch(`/api/admin/lead-magnets`)
        ]);
        
        if (!postRes.ok) {
          const errData = await postRes.json().catch(() => ({}));
          throw new Error(errData.error || `Failed with status ${postRes.status}`);
        }
        
        const postData = await postRes.json();
        const magnetsData = await magnetsRes.json();
        setLeadMagnets(magnetsData.filter((m: any) => m.active));

        const linkedMagnet = magnetsData.find((m: any) => m.post_id === id);

        const savedDraft = localStorage.getItem(`draft_edit_post_${id}`);
        if (savedDraft) {
          try {
            const parsedDraft = JSON.parse(savedDraft);
            setFormData(parsedDraft);
            setLoading(false);
            return;
          } catch (e) {}
        }

        setFormData({
          title: postData.title ?? "",
          slug: postData.slug ?? "",
          excerpt: postData.excerpt ?? "",
          category: postData.category ?? "Cybersecurity",
          read_time: postData.read_time ?? "1 min",
          status: postData.status ?? "Draft",
          author_name: postData.author_name ?? "Daniel Joseph Williams",
          content: postData.content ?? "",
          image_url: postData.image_url ?? "",
          lang: postData.lang ?? "en",
          meta_title: postData.meta_title ?? "",
          published_at: postData.published_at ? postData.published_at.slice(0, 16) : "",
          tags: (postData.tags || []).join(", "),
          lead_magnet_id: linkedMagnet ? linkedMagnet.id : "",
        });
      } catch (err) {
        setError("Could not load article: " + (err instanceof Error ? err.message : String(err)));
      }
      setLoading(false);
    }
    fetchData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }));
  };

  const words = formData.content?.split(/\s+/).filter((w) => w.length > 0).length || 0;
  const dynamicReadTime = `${Math.max(1, Math.ceil(words / 200))} min`;

  const handleAIRefine = async () => {
    if (!formData.content) return;
    setAiRefining(true);
    setError(null);
    try {
      const response = await fetch("/api/blog/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: formData.content, instruction: aiInstruction }),
      });
      const data = await response.json();
      if (data.refinedContent) {
        setFormData((prev) => ({ ...prev, content: data.refinedContent }));
      } else {
        throw new Error(data.error || "Failed to refine content");
      }
    } catch (err) {
      setError("AI Refine Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAiRefining(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const finalData = {
      ...formData,
      tags: formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      meta_title: formData.meta_title || null,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
      lead_magnet_id: formData.lead_magnet_id || null,
      read_time: dynamicReadTime,
      image_url: formData.image_url || getFallbackImage(formData.category)
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...finalData })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      localStorage.removeItem(`draft_edit_post_${id}`);
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/blog" style={{ color: "var(--color-neutral-400)", textDecoration: "none" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Edit Article
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Update and republish this blog post.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: "1rem", background: "rgba(255,68,68,0.1)", color: "#FF4444", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
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
              placeholder="Article title..."
            />
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Slug URL</label>
            <input
              required
              className="input-field"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>SEO Excerpt</label>
          <textarea
            className="input-field"
            style={{ minHeight: "80px", resize: "vertical", padding: "1rem" }}
            value={formData.excerpt}
            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
            placeholder="A compelling summary for search results..."
          />
        </div>

        <CoverImageUploader
          value={formData.image_url}
          category={formData.category}
          onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
        />

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Category</label>
            <select className="input-field" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}>
              {["Cybersecurity", "Cloud", "AI & Automation", "Network", "Compliance", "News"].map((c) => (
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
            <select className="input-field" value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Language</label>
            <div className="input-field" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,0,0,0.2)", cursor: "default" }}>
              {formData.lang === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
            </div>
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

        {/* AI Engine */}
        <div style={{ background: "rgba(168,85,247,0.05)", padding: "1.5rem", borderRadius: "16px", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
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
            <button
              type="button"
              onClick={handleAIRefine}
              disabled={aiRefining || !formData.content}
              className="btn-primary"
              style={{ padding: "0.5rem 2rem", fontSize: "0.875rem", background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", border: "none", borderRadius: "8px" }}
            >
              {aiRefining ? "Processing..." : "✨ Refine Content"}
            </button>
          </div>
        </div>

        {/* Markdown Editor */}
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
              onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
              theme="dark"
              language="en-US"
              placeholder="Start editing..."
              style={{ height: "500px" }}
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
                "bold", "italic", "underline", "strikeThrough", "-",
                "title", "sub", "sup", "quote", "unorderedList", "orderedList", "-",
                "code", "link", "image", "table", "-",
                "revoke", "next", "save",
                "=", "pageFullscreen", "fullscreen", "preview", "htmlPreview",
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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
          <Link href="/admin/blog" style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-neutral-300)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "0.75rem 2rem", borderRadius: "8px" }}>
            {saving ? "Saving..." : <><Save size={18} /> Update Article</>}
          </button>
        </div>
      </form>
    </div>
  );
}
