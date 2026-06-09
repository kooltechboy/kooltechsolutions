"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchLatestPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "Published")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (data) setPosts(data as Post[]);
    };
    fetchLatestPosts();
  }, [supabase]);

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

  if (posts.length === 0) return null;

  return (
    <section className="section" style={{ background: "rgba(10,22,40,0.3)" }}>
      <div className="container">
        <div className="blog-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: "0.75rem" }}>Latest Insights</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
              IT Knowledge <span className="gradient-text">Hub</span>
            </h2>
          </div>
          <Link href="/blog" className="btn-ghost" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
            View All Articles <ArrowRight size={15} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "1.5rem" }}>
          {posts.map(post => {
            const color = getCategoryColor(post.category);
            return (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <div className="glass-card" style={{ borderRadius: "16px", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: "160px", width: "100%", position: "relative", overflow: "hidden" }}>
                    <img 
                      src={post.image_url || `https://source.unsplash.com/featured/800x600?technology,${post.category}`} 
                      alt={post.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, var(--color-primary-950), transparent)" }} />
                  </div>
                  
                  <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}30`, fontSize: "0.68rem" }}>
                        {post.category}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                        <Clock size={11} /> {post.read_time}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                      {post.title}
                    </h3>
                    <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "1.25rem", flex: 1 }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
