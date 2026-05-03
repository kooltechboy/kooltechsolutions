import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & IT Insights",
  description: "Expert IT insights, cybersecurity tips, cloud strategies, and technology news from the Kool Tech Solutions team.",
};

const categories = ["All", "Cybersecurity", "Cloud", "AI & Automation", "Network", "Compliance", "News"];

const posts = [
  { category: "Cybersecurity", readTime: "5 min", title: "Zero-Trust Security: Why Every Caribbean Business Needs It Now", excerpt: "The traditional perimeter-based security model is dead. Learn why zero-trust architecture is the only way to protect your modern workforce.", date: "May 1, 2026", color: "#FF4444" },
  { category: "Cloud", readTime: "7 min", title: "Hybrid Cloud Migration: A Step-by-Step Guide for DR Businesses", excerpt: "Moving to the cloud doesn't have to be risky. Our proven 5-phase migration methodology ensures zero downtime and full data integrity.", date: "Apr 28, 2026", color: "#00D4FF" },
  { category: "AI & Automation", readTime: "4 min", title: "How AI is Transforming IT Help Desks in 2026", excerpt: "AI-powered help desks are resolving 70% of tickets without human intervention. Here's how we implement this for our clients.", date: "Apr 22, 2026", color: "#A855F7" },
  { category: "Network", readTime: "6 min", title: "SD-WAN vs Traditional WAN: Which is Right for Your Business?", excerpt: "Software-defined networking promises cost savings and flexibility. But is it the right move for your organization? A practical breakdown.", date: "Apr 15, 2026", color: "#4B84C8" },
  { category: "Compliance", readTime: "8 min", title: "HIPAA Compliance for Healthcare IT in the Caribbean", excerpt: "Healthcare providers serving patients in the USA face strict HIPAA requirements. Here's what Caribbean providers need to know and do.", date: "Apr 10, 2026", color: "#FFB300" },
  { category: "Cybersecurity", readTime: "5 min", title: "Ransomware Defense: The 2026 Playbook for SMBs", excerpt: "Ransomware attacks increased 73% last year. These are the specific controls that prevented breaches for our clients.", date: "Apr 5, 2026", color: "#FF4444" },
];

export default function BlogPage() {
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
            {posts.map(post => (
              <Link key={post.title} href="/blog/post" style={{ textDecoration: "none" }}>
                <div className="glass-card" style={{ borderRadius: "16px", overflow: "hidden", height: "100%" }}>
                  <div style={{ height: "6px", background: `linear-gradient(90deg, ${post.color}, transparent)` }} />
                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <span className="badge" style={{ background: `${post.color}15`, color: post.color, border: `1px solid ${post.color}30`, fontSize: "0.68rem" }}>{post.category}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                        <Clock size={11} /> {post.readTime} read
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", lineHeight: 1.4, marginBottom: "0.75rem" }}>{post.title}</h2>
                    <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>{post.excerpt}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                        <Calendar size={12} /> {post.date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--color-accent-500)", fontSize: "0.8125rem", fontWeight: 600 }}>
                        Read <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
