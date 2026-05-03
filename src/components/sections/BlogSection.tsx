"use client";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

const posts = [
  {
    category: "Cybersecurity", readTime: "5 min read",
    title: "Zero-Trust Security: Why Every Caribbean Business Needs It Now",
    excerpt: "The traditional perimeter-based security model is dead. Learn why zero-trust architecture is the only way to protect your modern, distributed workforce.",
    date: "May 1, 2026", color: "#FF4444",
  },
  {
    category: "Cloud", readTime: "7 min read",
    title: "Hybrid Cloud Migration: A Step-by-Step Guide for DR Businesses",
    excerpt: "Moving to the cloud doesn't have to be risky. Our proven 5-phase migration methodology ensures zero downtime and full data integrity.",
    date: "Apr 28, 2026", color: "#00D4FF",
  },
  {
    category: "AI & Automation", readTime: "4 min read",
    title: "How AI is Transforming IT Help Desks: The 2026 Playbook",
    excerpt: "AI-powered help desks are resolving 70% of tickets without human intervention. Here's how we implement this for our clients.",
    date: "Apr 22, 2026", color: "#A855F7",
  },
];

export default function BlogSection() {
  return (
    <section className="section" style={{ background: "rgba(10,22,40,0.3)" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {posts.map(post => (
            <Link key={post.title} href="/blog" style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{ borderRadius: "16px", overflow: "hidden", height: "100%" }}>
                <div style={{
                  height: "8px",
                  background: `linear-gradient(90deg, ${post.color}, transparent)`,
                }} />
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <span className="badge" style={{ background: `${post.color}15`, color: post.color, border: `1px solid ${post.color}30`, fontSize: "0.7rem" }}>
                      {post.category}
                    </span>
                    <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                    {post.title}
                  </h3>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                    <Calendar size={12} /> {post.date}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
