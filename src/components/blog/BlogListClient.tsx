"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";

const categories = ["All", "Cybersecurity", "Cloud", "AI & Automation", "Network", "Compliance", "News"];

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "Cybersecurity": return "#FF4444";
    case "Cloud": return "#00D4FF";
    case "AI & Automation": return "#A855F7";
    case "Network": return "#4B84C8";
    case "Compliance": return "#FFB300";
    default: return "#00D4FF";
  }
};

export const getFallbackImage = (category: string) => {
  switch (category) {
    case "Cybersecurity":
      return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=600";
    case "Cloud":
      return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=600";
    case "AI & Automation":
      return "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800&h=600";
    case "Network":
      return "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800&h=600";
    case "Compliance":
      return "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800&h=600";
    default:
      return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600";
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

interface BlogListClientProps {
  initialPosts: Post[];
}

export default function BlogListClient({ initialPosts }: BlogListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured Post is the first post when no search/filter is applied
  const isDefaultView = selectedCategory === "All" && searchQuery === "";
  const featuredPost = isDefaultView && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, category: string) => {
    e.currentTarget.src = getFallbackImage(category);
  };

  return (
    <>
      {/* Search Input Section */}
      <section style={{ padding: "0 0 3rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: "440px", margin: "0 auto", position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "1.25rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-neutral-500)",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="input-field"
              style={{ paddingLeft: "3rem", borderRadius: "100px" }}
            />
          </div>
        </div>
      </section>

      {/* Categories Filter Pills */}
      <div className="container" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", paddingBottom: "3rem", justifyContent: "center" }}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "100px",
                border: "1px solid",
                borderColor: isActive ? "var(--color-accent-500)" : "rgba(75,132,200,0.2)",
                background: isActive ? "rgba(0,212,255,0.15)" : "rgba(10,22,40,0.4)",
                color: isActive ? "white" : "var(--color-neutral-400)",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Featured Post Card (Hero post at top) */}
      {featuredPost && (
        <div className="container" style={{ marginBottom: "4rem" }}>
          <Link href={`/blog/${featuredPost.slug}`} style={{ textDecoration: "none" }}>
            <div
              className="glass-card"
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                border: "1px solid rgba(0, 212, 255, 0.2)",
                transition: "transform 0.3s ease, border-color 0.3s ease",
              }}
            >
              {/* Cover Image */}
              <div style={{ height: "380px", position: "relative", overflow: "hidden" }}>
                <img
                  src={featuredPost.image_url || getFallbackImage(featuredPost.category)}
                  alt={featuredPost.title}
                  onError={(e) => handleImageError(e, featuredPost.category)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "100%",
                    background: "linear-gradient(to top, rgba(6, 11, 24, 0.95) 10%, transparent 80%)",
                  }}
                />
                <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
                  <span
                    className="badge"
                    style={{
                      background: `${getCategoryColor(featuredPost.category)}25`,
                      color: getCategoryColor(featuredPost.category),
                      border: `1px solid ${getCategoryColor(featuredPost.category)}40`,
                      padding: "0.35rem 1rem",
                      fontSize: "0.75rem",
                    }}
                  >
                    Featured • {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Content Box */}
              <div
                style={{
                  padding: "3rem 2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Calendar size={14} /> {new Date(featuredPost.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Clock size={14} /> {featuredPost.read_time} read
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    color: "white",
                    lineHeight: 1.2,
                    marginBottom: "1rem",
                  }}
                >
                  {featuredPost.title}
                </h2>

                <p
                  style={{
                    color: "var(--color-neutral-400)",
                    fontSize: "1.05rem",
                    lineHeight: 1.7,
                    marginBottom: "2rem",
                  }}
                >
                  {featuredPost.excerpt}
                </p>

                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--color-accent-500)",
                      fontWeight: 600,
                      fontSize: "1rem",
                      transition: "gap 0.2s",
                    }}
                  >
                    Read Featured Article <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid Posts */}
      <div className="container" style={{ paddingBottom: "5rem" }}>
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "1.125rem" }}>
              No articles match your criteria. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2.5rem",
            }}
          >
            {gridPosts.map((post) => {
              const color = getCategoryColor(post.category);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    className="glass-card"
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid rgba(0, 212, 255, 0.08)",
                    }}
                  >
                    {/* Card Cover Image */}
                    <div style={{ height: "200px", width: "100%", position: "relative", overflow: "hidden" }}>
                      <img
                        src={post.image_url || getFallbackImage(post.category)}
                        alt={post.title}
                        onError={(e) => handleImageError(e, post.category)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "60%",
                          background: "linear-gradient(to top, var(--color-primary-950), transparent)",
                        }}
                      />
                    </div>

                    <div style={{ padding: "1.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                        <span
                          className="badge"
                          style={{
                            background: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`,
                            fontSize: "0.68rem",
                          }}
                        >
                          {post.category}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            color: "var(--color-neutral-500)",
                            fontSize: "0.75rem",
                          }}
                        >
                          <Clock size={11} /> {post.read_time} read
                        </span>
                      </div>

                      <h3
                        style={{
                          fontFamily: "Syne, sans-serif",
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          color: "white",
                          lineHeight: 1.35,
                          marginBottom: "0.75rem",
                        }}
                      >
                        {post.title}
                      </h3>

                      <p
                        style={{
                          color: "var(--color-neutral-400)",
                          fontSize: "0.875rem",
                          lineHeight: 1.6,
                          marginBottom: "1.5rem",
                          flex: 1,
                        }}
                      >
                        {post.excerpt}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "1.25rem",
                          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                          marginTop: "auto",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            color: "var(--color-neutral-500)",
                            fontSize: "0.75rem",
                          }}
                        >
                          <Calendar size={12} />{" "}
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            color: "var(--color-accent-500)",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          Read <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
