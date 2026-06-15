"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Upload, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { getFallbackImage } from "@/components/blog/BlogListClient";

export default function NewBlogPostPage() {
  const router = useRouter();
  const supabase = createClient();
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

    const { error: insertError } = await supabase.from("posts").insert([finalData]);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
      setSaving(false);
    } else {
      router.push("/admin/blog");
      router.refresh();
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

        <div>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Cover Image URL</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input 
              className="input-field" 
              value={formData.image_url} 
              onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
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
        </div>

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
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.8rem" }}>Blog Content (Rich Text / Markdown)</label>
          <div className="modern-editor-container" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <MdEditor 
              modelValue={formData.content} 
              onChange={(val) => setFormData({ ...formData, content: val })}
              theme="dark"
              language="en-US"
              placeholder="Start writing your masterpiece..."
              style={{ height: '500px' }}
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

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: "0.75rem 2rem", borderRadius: "8px" }}>
            {saving ? "Saving..." : <><Save size={18} /> Save Article</>}
          </button>
        </div>

      </form>
    </div>
  );
}
