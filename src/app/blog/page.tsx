import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & IT Insights | Kool Tech Solutions",
  description:
    "Expert IT insights, cybersecurity tips, cloud strategies, and technology news from the Kool Tech Solutions team.",
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Cybersecurity":   return "#FF4444";
    case "Cloud":           return "#00D4FF";
    case "AI & Automation": return "#A855F7";
    case "Network":         return "#4B84C8";
    case "Compliance":      return "#FFB300";
    default:                return "#00D4FF";
  }
};

const getFallbackImage = (category: string) => {
  switch (category) {
    case "Cybersecurity":
      return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200";
    case "AI & Automation":
      return "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1200";
    case "Cloud":
      return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200";
    default:
      return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200";
  }
};

interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  read_time: string;
  image_url?: string;
  created_at: string;
  status: string;
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "Published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const allPosts: Post[] = posts || [];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>

        {/* ── Page Hero ── */}
        <section style={{ padding: "6rem 0 2rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem",
                fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                background: "rgba(0,212,255,0.12)", color: "#00D4FF",
                border: "1px solid rgba(0,212,255,0.25)", marginBottom: "1.25rem",
              }}
            >
              Knowledge Hub
            </div>
            <h1
              style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3rem)", color: "white",
                marginBottom: "1rem", lineHeight: 1.15,
              }}
            >
              IT Insights &amp;{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #00D4FF, #4B84C8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Expert Guides
              </span>
            </h1>
            <p style={{ color: "#94A3B8", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              Actionable cybersecurity tips, cloud strategies, and technology insights from our senior engineers.
            </p>
          </div>
        </section>

        {/* ── No Posts ── */}
        {allPosts.length === 0 && (
          <section style={{ padding: "4rem 0" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
              <p style={{ color: "#64748B", fontSize: "1.125rem" }}>No articles published yet. Check back soon!</p>
            </div>
          </section>
        )}

        {/* ── All Posts as Cards ── */}
        {allPosts.length > 0 && (
          <section style={{ padding: "1rem 0 5rem" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                {allPosts.map((post, index) => {
                  const color = getCategoryColor(post.category);
                  const isFeatured = index === 0;
                  const imageUrl = post.image_url || getFallbackImage(post.category);

                  if (isFeatured) {
                    // Featured hero card — wide landscape layout
                    return (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <div
                          style={{
                            background: "rgba(10,22,40,0.8)",
                            border: "1px solid rgba(0,212,255,0.25)",
                            borderRadius: "20px",
                            overflow: "hidden",
                          }}
                        >
                          {/* Full-width image */}
                          <div style={{ position: "relative", height: "320px", overflow: "hidden" }}>
                            <img
                              src={imageUrl}
                              alt={post.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,11,24,0.95) 0%, rgba(6,11,24,0.3) 60%, transparent 100%)" }} />
                            <span
                              style={{
                                position: "absolute", top: "1.25rem", left: "1.25rem",
                                background: `${color}25`, color,
                                border: `1px solid ${color}40`,
                                padding: "0.3rem 0.9rem", borderRadius: "100px",
                                fontSize: "0.72rem", fontWeight: 700,
                                letterSpacing: "0.06em", textTransform: "uppercase",
                              }}
                            >
                              Featured · {post.category}
                            </span>
                          </div>

                          {/* Content below image */}
                          <div style={{ padding: "2rem 2.5rem 2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", color: "#94A3B8", fontSize: "0.875rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <Calendar size={14} />
                                {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <Clock size={14} /> {post.read_time} read
                              </span>
                            </div>
                            <h2
                              style={{
                                fontFamily: "Syne, sans-serif", fontWeight: 800,
                                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                                color: "white", lineHeight: 1.2, marginBottom: "1rem",
                              }}
                            >
                              {post.title}
                            </h2>
                            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: "700px" }}>
                              {post.excerpt}
                            </p>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#00D4FF", fontWeight: 600, fontSize: "0.9375rem" }}>
                              Read Article <ArrowRight size={16} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  // Regular card
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div
                        style={{
                          background: "rgba(10,22,40,0.7)",
                          border: "1px solid rgba(0,212,255,0.1)",
                          borderRadius: "16px",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ height: "220px", position: "relative", overflow: "hidden" }}>
                          <img
                            src={imageUrl}
                            alt={post.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,11,24,0.9) 0%, transparent 60%)" }} />
                        </div>

                        <div style={{ padding: "1.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
                            <span
                              style={{
                                background: `${color}15`, color,
                                border: `1px solid ${color}30`,
                                padding: "0.2rem 0.65rem", borderRadius: "100px",
                                fontSize: "0.68rem", fontWeight: 700,
                                letterSpacing: "0.05em", textTransform: "uppercase",
                              }}
                            >
                              {post.category}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#64748B", fontSize: "0.75rem" }}>
                              <Clock size={11} /> {post.read_time} read
                            </span>
                          </div>

                          <h3
                            style={{
                              fontFamily: "Syne, sans-serif", fontWeight: 700,
                              fontSize: "1.2rem", color: "white",
                              lineHeight: 1.35, marginBottom: "0.75rem",
                            }}
                          >
                            {post.title}
                          </h3>

                          <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
                            {post.excerpt}
                          </p>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#64748B", fontSize: "0.75rem" }}>
                              <Calendar size={12} />
                              {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#00D4FF", fontSize: "0.875rem", fontWeight: 600 }}>
                              Read <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
