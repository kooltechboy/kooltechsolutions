import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, User, Share2, Mail } from "lucide-react";
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
    title: `${post.title} | Kool Tech Solutions`,
    description: post.excerpt,
    alternates: {
      canonical: `https://kooltechsolutions.com/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://kooltechsolutions.com/blog/${slug}`,
      siteName: 'Kool Tech Solutions',
      images: [
        {
          url: post.image_url || 'https://kooltechsolutions.com/og-image.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author_name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image_url || 'https://kooltechsolutions.com/og-image.jpg'],
      creator: '@kooltechsolutions',
    },
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

  // Extract headers for Table of Contents
  const headers = post.content
    .split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => line.replace('## ', '').trim());

  // JSON-LD Structured Data for Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image_url,
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": post.author_name,
      "url": "https://kooltechsolutions.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kool Tech Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kooltechsolutions.com/logo.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "var(--color-neutral-950)" }}>
        <section className="container" style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 2rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "4rem" }} className="blog-layout-grid">
            
            {/* Main Article Column */}
            <article>
              <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-400)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "2rem" }}>
                <ArrowLeft size={16} /> Back to Insights
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}>
                  {post.category}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                  <Clock size={14} /> {post.read_time} read
                </span>
              </div>

              <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "white", lineHeight: 1.1, marginBottom: "2rem", letterSpacing: "-0.02em" }}>
                {post.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-primary-800)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={22} color="var(--color-neutral-400)" />
                  </div>
                  <div>
                    <p style={{ color: "white", fontWeight: 600, fontSize: "0.9375rem", margin: 0 }}>{post.author_name}</p>
                    <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", margin: 0 }}>Kool Tech Solutions • {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {post.image_url && (
                <img src={post.image_url} alt={post.title} style={{ width: "100%", borderRadius: "24px", marginBottom: "4rem", border: "1px solid rgba(255,255,255,0.1)" }} />
              )}

              <div className="prose prose-invert modern-blog-content" style={{ 
                maxWidth: "100%", 
                color: "var(--color-neutral-300)", 
                lineHeight: "1.8", 
                fontSize: "1.125rem",
                fontFamily: "Inter, sans-serif"
              }}>
                <style dangerouslySetInnerHTML={{ __html: `
                  .modern-blog-content h2 { color: white; font-family: Syne, sans-serif; font-weight: 800; font-size: 2rem; margin-top: 3.5rem; margin-bottom: 1.5rem; letter-spacing: -0.02em; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2.5rem; }
                  .modern-blog-content h3 { color: var(--color-accent-400); font-family: Syne, sans-serif; font-weight: 700; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; }
                  .modern-blog-content p { margin-bottom: 1.5rem; }
                  .modern-blog-content ul, .modern-blog-content ol { margin-bottom: 2rem; padding-left: 1.5rem; }
                  .modern-blog-content li { margin-bottom: 0.75rem; }
                  .modern-blog-content strong { color: white; font-weight: 700; }
                  .modern-blog-content blockquote { border-left: 4px solid var(--color-accent-400); padding: 1.5rem 2rem; background: rgba(0,212,255,0.03); border-radius: 0 12px 12px 0; font-style: italic; color: var(--color-neutral-300); margin: 2.5rem 0; }
                  .ad-slot { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justifyContent: center; color: var(--color-neutral-600); font-size: 0.75rem; margin: 3rem 0; min-height: 250px; }
                  @media (max-width: 992px) { .blog-layout-grid { grid-template-columns: 1fr !important; } .blog-sidebar { display: none; } }
                `}} />
                
                <div className="ad-slot" id="blog-top-ad">Google AdSense Slot</div>

                <ReactMarkdown>{post.content}</ReactMarkdown>

                <div className="ad-slot" id="blog-bottom-ad">Google AdSense Slot</div>

                {/* Social Sharing & Author Footer */}
                <div style={{ marginTop: "5rem", padding: "3rem", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--color-primary-800)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={40} color="var(--color-neutral-400)" />
                    </div>
                    <div>
                      <h4 style={{ color: "white", margin: 0, fontSize: "1.25rem" }}>{post.author_name}</h4>
                      <p style={{ color: "var(--color-neutral-400)", fontSize: "1rem", lineHeight: 1.6, margin: "0.75rem 0 1.5rem" }}>
                        Expert in Caribbean technology strategy and enterprise security. Leading digital transformation at Kool Tech Solutions.
                      </p>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        {['Twitter', 'LinkedIn', 'Facebook'].map(s => (
                          <button key={s} style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", fontSize: "0.8125rem", cursor: "pointer" }}>
                            <Share2 size={14} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} /> {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="blog-sidebar">
              <div style={{ position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                
                {headers.length > 0 && (
                  <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h4 style={{ color: "white", fontSize: "0.75rem", fontWeight: 700, marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Table of Contents</h4>
                    <nav style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      {headers.map((h, i) => (
                        <a key={i} href={`#${h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", textDecoration: "none", transition: "0.2s", lineHeight: 1.4 }}>
                          {h}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                <div style={{ minHeight: "500px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-neutral-700)", fontSize: "0.75rem", textAlign: "center", padding: "2rem" }}>
                  Google AdSense Vertical Slot
                </div>

              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
      <AIChatWidget />
    </>
  );
}
