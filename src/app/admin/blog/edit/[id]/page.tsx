"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import { getFallbackImage } from "@/components/blog/BlogListClient";

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
  });

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Could not load article: " + (error?.message ?? "Not found"));
      } else {
        setFormData({
          title: data.title ?? "",
          slug: data.slug ?? "",
          excerpt: data.excerpt ?? "",
          category: data.category ?? "Cybersecurity",
          read_time: data.read_time ?? "1 min",
          status: data.status ?? "Draft",
          author_name: data.author_name ?? "Daniel Joseph Williams",
          content: data.content ?? "",
          image_url: data.image_url ?? "",
        });
      }
      setLoading(false);
    }
    fetchPost();
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

    // If image_url is empty, set a fallback image URL
    const finalData = {
      ...formData,
      read_time: dynamicReadTime,
      image_url: formData.image_url || getFallbackImage(formData.category)
    };

    const { error: updateError } = await supabase
      .from("posts")
      .update(finalData)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      router.push("/admin/blog");
      router.refresh();
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

        <div>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Cover Image URL</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              className="input-field"
              value={formData.image_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
            />
            {(formData.image_url || formData.category) && (
              <div style={{ width: "50px", height: "45px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                <img 
                  src={formData.image_url || getFallbackImage(formData.category)} 
                  alt="Preview" 
                  onError={(e) => { e.currentTarget.src = getFallbackImage(formData.category); }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>
            )}
          </div>
        </div>

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
        </div>

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
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.8rem" }}>Blog Content (Rich Text / Markdown)</label>
          <div className="modern-editor-container" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <MdEditor
              modelValue={formData.content}
              onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
              theme="dark"
              language="en-US"
              placeholder="Start editing..."
              style={{ height: "500px" }}
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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
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
