import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, User, Share2, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("slug", slug).single();
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Kool Tech Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Cybersecurity": return "#FF4444";
      case "Cloud": return "#00D4FF";
      case "AI & Automation": return "#A855F7";
      case "Network": return "#4B84C8";
      case "Compliance": return "#FFB300";
      default: return "#00D4FF";
    }
  };

  const color = getCategoryColor(post.category);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
        
        {/* Post Header */}
        <section style={{ padding: "4rem 0", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)", borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-400)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "2rem" }}>
              <ArrowLeft size={16} /> Back to Blog
            </Link>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}>
                {post.category}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                <Clock size={14} /> {post.read_time} read
              </span>
            </div>

            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "white", lineHeight: 1.2, marginBottom: "1.5rem" }}>
              {post.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-primary-800)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={20} color="var(--color-neutral-400)" />
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>{post.author_name}</p>
                  <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", margin: 0 }}>Kool Tech Solutions</p>
                </div>
              </div>
              
              <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.1)" }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                <Calendar size={16} /> 
                {new Date(post.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </section>

        {/* Post Content */}
        <section className="container" style={{ maxWidth: "800px", padding: "3rem 0 6rem" }}>
          {post.image_url && (
            <div style={{ width: "100%", height: "400px", borderRadius: "16px", marginBottom: "3rem", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          
          <div className="prose prose-invert modern-blog-content" style={{ 
            maxWidth: "100%", 
            color: "var(--color-neutral-300)", 
            lineHeight: "1.8", 
            fontSize: "1.125rem",
            fontFamily: "Inter, sans-serif"
          }}>
            <style dangerouslySetInnerHTML={{ __html: `
              .modern-blog-content h2 { color: white; font-family: Syne, sans-serif; font-weight: 800; font-size: 2rem; margin-top: 3.5rem; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
              .modern-blog-content h3 { color: var(--color-accent-400); font-family: Syne, sans-serif; font-weight: 700; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; }
              .modern-blog-content p { margin-bottom: 1.5rem; }
              .modern-blog-content ul, .modern-blog-content ol { margin-bottom: 2rem; padding-left: 1.5rem; }
              .modern-blog-content li { margin-bottom: 0.75rem; }
              .modern-blog-content strong { color: white; font-weight: 700; }
              .modern-blog-content hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 3rem 0; }
              .modern-blog-content blockquote { border-left: 4px solid var(--color-accent-400); padding-left: 1.5rem; font-style: italic; color: var(--color-neutral-400); margin: 2.5rem 0; }
              .ad-slot { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justifyContent: center; color: var(--color-neutral-600); font-size: 0.75rem; margin: 3rem 0; min-height: 250px; }
            `}} />
            
            {/* Top Ad Slot */}
            <div className="ad-slot" id="blog-top-ad">
              Google AdSense - Top Placement
            </div>

            <ReactMarkdown>{post.content}</ReactMarkdown>

            {/* Bottom Ad Slot */}
            <div className="ad-slot" id="blog-bottom-ad">
              Google AdSense - Bottom Placement
            </div>

            {/* Social Sharing */}
            <div style={{ marginTop: "4rem", padding: "2rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                <div>
                  <h4 style={{ color: "white", margin: 0, fontSize: "1rem" }}>Share this article</h4>
                  <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Help us spread the word across the Caribbean.</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {[
                    { icon: <Twitter size={18} />, label: "Twitter", color: "#1DA1F2" },
                    { icon: <Linkedin size={18} />, label: "LinkedIn", color: "#0A66C2" },
                    { icon: <Facebook size={18} />, label: "Facebook", color: "#1877F2" },
                    { icon: <Mail size={18} />, label: "Email", color: "#EA4335" }
                  ].map((s, idx) => (
                    <button key={idx} style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s", cursor: "pointer" }}>
                      {s.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Section */}
            <div style={{ marginTop: "3rem", display: "flex", gap: "1.5rem", padding: "2rem 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-primary-800)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={32} color="var(--color-neutral-400)" />
              </div>
              <div>
                <h4 style={{ color: "white", margin: 0, fontSize: "1.125rem" }}>About {post.author_name}</h4>
                <p style={{ color: "var(--color-neutral-400)", fontSize: "0.9375rem", lineHeight: 1.6, margin: "0.5rem 0 1rem" }}>
                  Founder & CEO of Kool Tech Solutions. Expert in Caribbean cybersecurity architecture and digital transformation. Helping regional businesses build resilient, compliant, and future-ready infrastructure.
                </p>
                <Link href="/contact" style={{ color: "var(--color-accent-400)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
                  Work with {post.author_name.split(' ')[0]} →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
