import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Blog & IT Insights",
  description: "Expert IT insights, cybersecurity tips, cloud strategies, and technology news from the Kool Tech Solutions team.",
};

const categories = ["All", "Cybersecurity", "Cloud", "AI & Automation", "Network", "Compliance", "News"];

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

export default async function BlogPage() {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "Published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Hero */}
        <section style={{ padding: "5rem 0 3rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Knowledge Hub</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1rem" }}>
              IT Insights & <span className="gradient-text">Expert Guides</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Actionable cybersecurity tips, cloud strategies, and technology insights from our senior engineers.
            </p>
            {/* Search */}
            <div style={{ maxWidth: "440px", margin: "0 auto", position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)" }} />
              <input placeholder="Search articles..." className="input-field" style={{ paddingLeft: "2.75rem", borderRadius: "100px" }} />
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="container" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", paddingBottom: "2rem" }}>
          {categories.map((cat, i) => (
            <button key={cat} style={{
              padding: "0.375rem 1rem", borderRadius: "100px", border: "1px solid",
              borderColor: i === 0 ? "var(--color-accent-500)" : "rgba(75,132,200,0.2)",
              background: i === 0 ? "rgba(0,212,255,0.12)" : "transparent",
              color: i === 0 ? "var(--color-accent-500)" : "var(--color-neutral-400)",
              fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans, sans-serif",
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="container" style={{ paddingBottom: "5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {posts && posts.length > 0 ? posts.map(post => {
              const color = getCategoryColor(post.category);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div className="glass-card" style={{ borderRadius: "16px", overflow: "hidden", height: "100%" }}>
                    <div style={{ height: "6px", background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <div style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}30`, fontSize: "0.68rem" }}>{post.category}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                          <Clock size={11} /> {post.read_time} read
                        </span>
                      </div>
                      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", lineHeight: 1.4, marginBottom: "0.75rem" }}>{post.title}</h2>
                      <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>{post.excerpt}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                          <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-accent-500)", fontSize: "0.8125rem", fontWeight: 600 }}>
                          Read <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }) : (
              <p style={{ color: "var(--color-neutral-500)", textAlign: "center", gridColumn: "1 / -1" }}>No posts published yet.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
