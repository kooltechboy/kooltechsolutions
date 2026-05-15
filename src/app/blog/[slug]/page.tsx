import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("slug", params.slug).single();
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Kool Tech Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", params.slug)
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
          
          <div className="prose prose-invert" style={{ maxWidth: "100%", color: "var(--color-neutral-300)", lineHeight: 1.8, fontSize: "1.0625rem" }}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </section>
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
