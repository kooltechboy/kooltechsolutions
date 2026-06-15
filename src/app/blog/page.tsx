import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/utils/supabase/server";
import BlogListClient from "@/components/blog/BlogListClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & IT Insights",
  description: "Expert IT insights, cybersecurity tips, cloud strategies, and technology news from the Kool Tech Solutions team.",
};

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

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {/* Hero */}
        <section style={{ padding: "5rem 0 1rem" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Knowledge Hub</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1rem" }}>
              IT Insights & <span className="gradient-text">Expert Guides</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto 1rem", lineHeight: 1.7 }}>
              Actionable cybersecurity tips, cloud strategies, and technology insights from our senior engineers.
            </p>
          </div>
        </section>

        {/* Blog Listings Client Component */}
        <BlogListClient initialPosts={posts || []} />
      </main>
      <Footer />
    </>
  );
}
