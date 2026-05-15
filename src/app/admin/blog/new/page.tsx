"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Sparkles, Upload, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

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
    read_time: "5 min",
    status: "Draft",
    author_name: "Daniel W.",
    content: "",
    image_url: "",
  });

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
    } catch (err: any) {
      setError("Generation Error: " + err.message);
    } finally {
      setAiRefining(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setFormData({ ...formData, content });
      
      // Auto-extract title if possible (first H1)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        const title = titleMatch[1];
        setFormData(prev => ({
          ...prev,
          content,
          title,
          slug: generateSlug(title)
        }));
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

    let finalData = { ...formData, title: currentTitle };

    // Autonomous Completion: Fill missing fields using AI
    if (!formData.excerpt || formData.category === "Cybersecurity" || !formData.slug) {
      try {
        const response = await fetch("/api/blog/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            mode: 'complete',
            content: `Title: ${currentTitle}\n\nContent: ${formData.content}`
          }),
        });
        const data = await response.json();
        if (data.metadata) {
          finalData = {
            ...finalData,
            excerpt: formData.excerpt || data.metadata.excerpt,
            category: (formData.category === "Cybersecurity" || !formData.category) ? data.metadata.category : formData.category,
            slug: formData.slug || data.metadata.slug || generateSlug(currentTitle),
            read_time: (formData.read_time === "5 min" || !formData.read_time) ? data.metadata.read_time : formData.read_time
          };
          setFormData(finalData);
        }
      } catch (err) {
        console.warn("AI metadata completion failed, using fallbacks.", err);
        // Fallback slug if AI fails
        if (!finalData.slug) finalData.slug = generateSlug(currentTitle);
      }
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
          type="file" 
          id="file-upload" 
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
        <button 
          onClick={handleGenerateFromTitle}
          disabled={aiRefining}
          className="btn-primary" 
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "linear-gradient(135deg, #00D4FF 0%, #0072FF 100%)", border: "none" }}
        >
          {aiRefining ? "Generating..." : <><Zap size={18} /> Generate from Title</>}
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
            <input 
              className="input-field" 
              value={formData.read_time} 
              onChange={e => setFormData({ ...formData, read_time: e.target.value })} 
              placeholder="e.g. 5 min"
            />
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
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Cover Image URL (Optional)</label>
          <input 
            className="input-field" 
            value={formData.image_url} 
            onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
            placeholder="https://..."
          />
        </div>

        <div style={{ background: "rgba(0,212,255,0.03)", padding: "1.5rem", borderRadius: "12px", border: "1px dashed rgba(0,212,255,0.2)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Sparkles size={18} color="var(--color-accent-400)" />
            <h3 style={{ fontSize: "0.875rem", color: "white", margin: 0 }}>AI Copywriter & Editor</h3>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input 
              className="input-field" 
              style={{ flex: 1, fontSize: "0.8125rem" }}
              placeholder="E.g. 'Turn this into a professional Caribbean tech article', 'Add an engaging hook'..."
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleAIRefine}
              disabled={aiRefining}
              className="btn-primary" 
              style={{ padding: "0.5rem 1.5rem", fontSize: "0.8125rem", background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", border: "none" }}
            >
              {aiRefining ? "Refining..." : "✨ Refine Content"}
            </button>
          </div>
        </div>

        {/* Post-Import Recommendation */}
        {formData.content && !aiRefining && (
          <div style={{ padding: "1rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Zap size={18} color="#A855F7" />
              <span style={{ fontSize: "0.875rem", color: "white" }}>Content loaded. Ready to transform this into an Elite Professional Article?</span>
            </div>
            <button 
              type="button" 
              onClick={handleAIRefine}
              style={{ padding: "0.4rem 1rem", background: "#A855F7", color: "white", border: "none", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
            >
              🚀 AI Professionalize
            </button>
          </div>
        )}

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
