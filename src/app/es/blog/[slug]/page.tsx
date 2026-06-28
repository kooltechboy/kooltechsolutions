import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, User, Share2, Mail } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import ReadingProgress from "@/components/blog/ReadingProgress";
import remarkGfm from "remark-gfm";
import GoogleAdSlot from "@/components/blog/GoogleAdSlot";
import { getFallbackImage, getCategoryColor } from "@/utils/blog";
import {
  getBlogHreflangAlternates,
  getBlogCanonicalUrl,
  getOgLocale,
  getJsonLdLanguage,
} from "@/utils/blog-seo";
import LanguageSwitchBanner from "@/components/blog/LanguageSwitchBanner";
import LeadMagnetGate from "@/components/blog/LeadMagnetGate";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("slug", slug).eq("lang", "es").single();

  const isScheduled = post?.published_at && new Date(post.published_at) > new Date();
  if (!post || post.status !== "Published" || isScheduled) {
    return { title: "Artículo No Encontrado" };
  }

  // Look up English counterpart bidirectionally
  let counterpart: { slug: string; lang: string } | null = null;
  if (post.translated_from) {
    const { data } = await supabase
      .from("posts")
      .select("slug, lang")
      .eq("id", post.translated_from)
      .eq("status", "Published")
      .single();
    if (data) counterpart = data;
  }
  if (!counterpart) {
    const { data } = await supabase
      .from("posts")
      .select("slug, lang")
      .eq("translated_from", post.id)
      .eq("status", "Published")
      .single();
    if (data) counterpart = data;
  }

  const alternates = getBlogHreflangAlternates(post, counterpart);

  return {
    title: post.meta_title || `${post.title} | Kool Tech Solutions`,
    description: post.excerpt,
    alternates,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: getBlogCanonicalUrl(post),
      siteName: "Kool Tech Solutions",
      images: [
        {
          url: post.image_url || getFallbackImage(post.category),
          width: 1200,
          height: 630,
        },
      ],
      locale: getOgLocale("es"),
      type: "article",
      publishedTime: post.created_at,
      authors: [post.author_name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image_url || getFallbackImage(post.category)],
      creator: "@kooltechsolutions",
    },
  };
}

export default async function BlogPostPageES({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("lang", "es")
    .single();

  const isScheduled = post?.published_at && new Date(post.published_at) > new Date();
  if (error || !post || post.status !== "Published" || isScheduled) {
    notFound();
  }

  const color = getCategoryColor(post.category);

  // Look up English counterpart bidirectionally
  let counterpart: { slug: string; lang: string } | null = null;
  if (post.translated_from) {
    const { data } = await supabase
      .from("posts")
      .select("slug, lang")
      .eq("id", post.translated_from)
      .eq("status", "Published")
      .single();
    if (data) counterpart = data;
  }
  if (!counterpart) {
    const { data } = await supabase
      .from("posts")
      .select("slug, lang")
      .eq("translated_from", post.id)
      .eq("status", "Published")
      .single();
    if (data) counterpart = data;
  }

  const alternateUrl = counterpart ? `/blog/${counterpart.slug}` : null;

  // Look up any active lead magnet linked to this post OR its English source
  const postIdsToCheck = [post.id, post.translated_from].filter(Boolean);
  const { data: leadMagnet } = await supabase
    .from("lead_magnets")
    .select("id, title, description, cta_button_text, pdf_filename")
    .in("post_id", postIdsToCheck)
    .eq("active", true)
    .limit(1)
    .single();

  // Fetch Related Posts (Spanish only)
  let { data: relatedPosts } = await supabase
    .from("posts")
    .select("id, title, slug, category, read_time, image_url, created_at")
    .eq("status", "Published")
    .eq("lang", "es")
    .eq("category", post.category)
    .neq("id", post.id)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(3);

  let finalRelated = relatedPosts || [];
  if (finalRelated.length < 3) {
    const { data: fallbackRelated } = await supabase
      .from("posts")
      .select("id, title, slug, category, read_time, image_url, created_at")
      .eq("status", "Published")
      .eq("lang", "es")
      .neq("id", post.id)
      .neq("category", post.category)
      .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .limit(3 - finalRelated.length);
    if (fallbackRelated) {
      finalRelated = [...finalRelated, ...fallbackRelated];
    }
  }

  // Extract headers for Table of Contents
  const headers = post.content
    .split('\n')
    .filter((line: string) => line.startsWith('## '))
    .map((line: string) => line.replace('## ', '').trim());

  // JSON-LD Structured Data for Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.meta_title || post.title,
    "description": post.excerpt,
    "image": post.image_url || getFallbackImage(post.category),
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at,
    "inLanguage": getJsonLdLanguage("es"),
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

  const shareUrl = encodeURIComponent(`https://kooltechsolutions.com/es/blog/${post.slug}`);
  const shareText = encodeURIComponent(post.title);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        <section className="container" style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 2rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "4rem" }} className="blog-layout-grid">
            
            {/* Main Article Column */}
            <article>
              <Link href="/es/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-400)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "2rem" }}>
                <ArrowLeft size={16} /> Volver a Perspectivas
              </Link>

              <LanguageSwitchBanner currentLang="es" alternateUrl={alternateUrl} />

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}>
                  {post.category}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                  <Clock size={14} /> {post.read_time} de lectura
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
                    <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", margin: 0 }}>Kool Tech Solutions • {new Date(post.published_at || post.created_at).toLocaleDateString("es-LA")}</p>
                  </div>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "3rem", marginTop: "-1.5rem" }}>
                  {post.tags.map((tag: string) => (
                    <span key={tag} style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-neutral-300)", fontSize: "0.75rem" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <img 
                src={post.image_url || getFallbackImage(post.category)} 
                alt={post.title} 
                style={{ width: "100%", borderRadius: "24px", marginBottom: "4rem", border: "1px solid rgba(255,255,255,0.1)" }} 
              />

              <div className="prose prose-invert modern-blog-content" style={{ 
                maxWidth: "100%", 
                color: "var(--color-neutral-300)", 
                lineHeight: "1.8", 
                fontSize: "1.125rem",
                fontFamily: "Inter, sans-serif"
              }}>
                <style dangerouslySetInnerHTML={{ __html: `
                  .modern-blog-content { scroll-behavior: smooth; }
                  .modern-blog-content h2 { color: white; font-family: Syne, sans-serif; font-weight: 800; font-size: 2rem; margin-top: 3.5rem; margin-bottom: 1.5rem; letter-spacing: -0.02em; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2.5rem; scroll-margin-top: 100px; }
                  .modern-blog-content h3 { color: var(--color-accent-400); font-family: Syne, sans-serif; font-weight: 700; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; scroll-margin-top: 100px; }
                  .modern-blog-content p { margin-bottom: 1.5rem; }
                  .modern-blog-content ul, .modern-blog-content ol { margin-bottom: 2rem; padding-left: 1.5rem; }
                  .modern-blog-content li { margin-bottom: 0.75rem; }
                  .modern-blog-content strong { color: white; font-weight: 700; }
                  .modern-blog-content blockquote { border-left: 4px solid var(--color-accent-400); padding: 1.5rem 2rem; background: rgba(0,212,255,0.03); border-radius: 0 12px 12px 0; font-style: italic; color: var(--color-neutral-300); margin: 2.5rem 0; }
                  .modern-blog-content table { width: 100%; border-collapse: collapse; margin: 2.5rem 0; font-size: 0.9375rem; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                  .modern-blog-content th { background: rgba(255,255,255,0.05); color: white; text-align: left; padding: 1rem; font-weight: 700; border-bottom: 2px solid rgba(255,255,255,0.1); }
                  .modern-blog-content td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--color-neutral-400); }
                  .modern-blog-content tr:last-child td { border-bottom: none; }
                  .modern-blog-content tr:hover td { background: rgba(255,255,255,0.02); color: white; }
                  .modern-blog-content pre { background: rgba(0, 0, 0, 0.4); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); overflow-x: auto; margin: 2rem 0; }
                  .modern-blog-content code { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--color-accent-400); background: rgba(0, 212, 255, 0.05); padding: 0.2rem 0.4rem; border-radius: 4px; }
                  .modern-blog-content pre code { color: var(--color-neutral-200); background: transparent; padding: 0; }
                  @media (max-width: 992px) { .blog-layout-grid { grid-template-columns: 1fr !important; } .blog-sidebar { display: none; } }
                  .toc-link { color: var(--color-neutral-500); font-size: 0.875rem; text-decoration: none; transition: all 0.2s; line-height: 1.4; display: block; }
                  .toc-link:hover { color: var(--color-accent-400); padding-left: 2px; }
                `}} />
                
                {/* Auto ad unit container above the article */}
                <GoogleAdSlot />

                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({node, ...props}) => {
                      const id = String(props.children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h2 id={id} {...props} />;
                    },
                    h3: ({node, ...props}) => {
                      const id = String(props.children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h3 id={id} {...props} />;
                    }
                  }}
                >
                  {post.content}
                </ReactMarkdown>

                {/* Auto ad unit container below the article */}
                <GoogleAdSlot />

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
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <a 
                          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", fontSize: "0.8125rem", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                        >
                          <Share2 size={14} style={{ marginRight: "0.5rem" }} /> X (Twitter)
                        </a>
                        <a 
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", fontSize: "0.8125rem", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                        >
                          <Share2 size={14} style={{ marginRight: "0.5rem" }} /> LinkedIn
                        </a>
                        <a 
                          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "white", fontSize: "0.8125rem", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                        >
                          <Share2 size={14} style={{ marginRight: "0.5rem" }} /> Facebook
                        </a>
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
                    <h4 style={{ color: "white", fontSize: "0.75rem", fontWeight: 700, marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tabla de Contenido</h4>
                    <nav style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      {headers.map((h: string, i: number) => (
                        <a key={i} href={`#${h.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="toc-link">
                          {h}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Lead Magnet Gate */}
                {leadMagnet && (
                  <LeadMagnetGate magnet={leadMagnet} />
                )}

                {/* Auto ads container in the sidebar */}
                <GoogleAdSlot />

              </div>
            </aside>
          </div>

          {/* Related Posts Section */}
          {finalRelated.length > 0 && (
            <div style={{ marginTop: "6rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "4rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", marginBottom: "2.5rem" }}>
                Artículos <span className="gradient-text">Relacionados</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
                {finalRelated.map((p) => {
                  const pColor = getCategoryColor(p.category);
                  return (
                    <Link key={p.id} href={`/es/blog/${p.slug}`} style={{ textDecoration: "none" }}>
                      <div className="glass-card" style={{ borderRadius: "16px", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", border: "1px solid rgba(0, 212, 255, 0.05)" }}>
                        <div style={{ height: "160px", width: "100%", position: "relative", overflow: "hidden" }}>
                          <img 
                            src={p.image_url || getFallbackImage(p.category)} 
                            alt={p.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, var(--color-primary-950), transparent)" }} />
                        </div>
                        <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                            <span className="badge" style={{ background: `${pColor}15`, color: pColor, border: `1px solid ${pColor}30`, fontSize: "0.65rem" }}>{p.category}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-neutral-500)", fontSize: "0.72rem" }}>
                              <Clock size={11} /> {p.read_time}
                            </span>
                          </div>
                          <h4 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", lineHeight: 1.4, marginBottom: "0.5rem" }}>{p.title}</h4>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </section>
      </main>

      <Footer />
    </>
  );
}
