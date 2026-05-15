"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Sparkles, Zap, Upload, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
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
    read_time: "5 min",
    status: "Draft",
    author_name: "Daniel J Williams.",
    content: "",
    image_url: "",
  });

  // Proactive Title Extraction
  const extractAndSetTitle = (content: string) => {
    if (!formData.title && content) {
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const title = lines[0].replace(/^#+\s+/, '').trim();
        setFormData(prev => ({
          ...prev,
          title: prev.title || title,
          slug: prev.slug || generateSlug(title)
        }));
      }
    }
  };

  // Calculate dynamic read time
  useEffect(() => {
    const words = formData.content.split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setFormData(prev => ({ ...prev, read_time: `${minutes} min` }));
  }, [formData.content]);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      setError("Could not load post: " + error.message);
    } else if (data) {
      setFormData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPost();
  }, [params.id]);

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
    } catch (err: any) {
      setError("AI Refine Error: " + err.message);
    } finally {
      setAiRefining(false);
    }
  };

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }

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
    if (!formData.content || !formData.title) {
      setError("Title and Content are required.");
      return;
    }

    setSaving(true);
    setError(null);

    let finalData = { 
      ...formData,
      author_name: "Daniel Joseph Williams" // Enforce Standard Author
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
            slug: formData.slug || data.metadata.slug,
            read_time: (formData.read_time === "5 min" || !formData.read_time) ? data.metadata.read_time : formData.read_time,
            // Intelligent Cover Image Suggestion if missing
            image_url: formData.image_url || `https://source.unsplash.com/featured/1200x630?technology,${data.metadata.category || 'tech'}`
          };
        }
      } catch (err) {
        console.warn("AI metadata completion failed during update.");
      }
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update(finalData)
      .eq("id", params.id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message);
      setSaving(false);
    } else {
      router.push("/admin/blog");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "var(--color-accent-400)" }}>
        <Loader2 className="animate-spin" size={32} />
        <span style={{ marginLeft: "1rem" }}>Loading post data...</span>
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
            Updating: {formData.title}
          </p>
        </div>
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
              <Clock size={14} style={{ marginRight: "0.5rem", color: "var(--color-accent-400)" }} /> {formData.read_time}
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

        <div>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Excerpt (Summary for card)</label>
          <textarea 
            className="input-field" 
            value={formData.excerpt} 
            onChange={e => setFormData({ ...formData, excerpt: e.target.value })} 
            rows={2}
          />
        </div>

        <div>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Cover Image URL</label>
          <input 
            className="input-field" 
            value={formData.image_url} 
            onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
            placeholder="https://..."
          />
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
            <button 
              type="button"
              onClick={handleAIRefine}
              disabled={aiRefining}
              className="btn-primary" 
              style={{ padding: "0.5rem 2rem", fontSize: "0.875rem", background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", border: "none", borderRadius: "8px" }}
            >
              {aiRefining ? "Processing..." : "✨ Execute Command"}
            </button>
          </div>
        </div>


        <div>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.8rem" }}>Blog Content (Rich Text / Markdown)</label>
          <div className="modern-editor-container" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <MdEditor 
              modelValue={formData.content} 
              onChange={(val) => {
                setFormData({ ...formData, content: val });
                extractAndSetTitle(val);
              }}
              theme="dark"
              language="en-US"
              placeholder="Continue writing..."
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
            {saving ? "Updating..." : <><Save size={18} /> Update Article</>}
          </button>
        </div>

      </form>
    </div>
  );
}
