"use client";
import { useParams, notFound } from "next/navigation";
import { aiWorkforce } from "@/data/ai-workforce";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { Shield, Zap, ArrowRight, CheckCircle, Cpu, MessageSquare, PhoneCall, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AIAgentPage() {
  const params = useParams();
  const agent = aiWorkforce.find(a => a.slug === params.slug);

  if (!agent) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Agent Hero */}
        <section style={{ 
          padding: "6rem 0 4rem", 
          background: `radial-gradient(circle at top right, ${agent.color}15 0%, transparent 70%), linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)`,
          position: "relative",
          overflow: "hidden"
        }}>
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "4rem", alignItems: "center" }}>
              <div>
                <div className="badge" style={{ background: `${agent.color}20`, color: agent.color, marginBottom: "1.5rem" }}>
                  AI Employee: {agent.name}
                </div>
                <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "white", marginBottom: "1rem", lineHeight: 1.1 }}>
                  Meet {agent.name}, <br />
                  <span style={{ color: agent.color }}>{agent.role}</span>
                </h1>
                <p style={{ fontSize: "1.25rem", color: "var(--color-neutral-300)", marginBottom: "2rem", lineHeight: 1.6 }}>
                  {agent.tagline}
                </p>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <Link href="/contact" className="btn-primary" style={{ background: agent.color, color: "black" }}>
                    Hire {agent.name} Now <ArrowRight size={18} />
                  </Link>
                  <Link href="#capabilities" className="btn-ghost">
                    View Capabilities
                  </Link>
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ 
                  width: "100%", 
                  aspectRatio: "1", 
                  background: `linear-gradient(135deg, ${agent.color}20 0%, transparent 100%)`, 
                  borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  filter: "blur(60px)",
                  zIndex: -1
                }} />
                <div className="glass-card" style={{ padding: "2rem", borderRadius: "24px", textAlign: "center", border: `1px solid ${agent.color}30` }}>
                  <div style={{ width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <Cpu size={64} color={agent.color} />
                  </div>
                  <h3 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>{agent.name}.ai</h3>
                  <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    <div className="badge" style={{ fontSize: "0.75rem" }}>Active</div>
                    <div className="badge" style={{ fontSize: "0.75rem", background: "rgba(0,255,0,0.1)", color: "#00E676" }}>99.9% Uptime</div>
                  </div>
                  <div style={{ textAlign: "left", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "1rem" }}>
                    <p style={{ color: agent.color, fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem", textTransform: "uppercase" }}>Current Status</p>
                    <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", fontFamily: "monospace" }}>{">"} Awaiting instructions...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="section" style={{ background: "var(--color-neutral-900)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", marginBottom: "1rem" }}>
                Enterprise <span style={{ color: agent.color }}>Intelligence</span>
              </h2>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto" }}>
                {agent.description}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
              {agent.features.map((feature, i) => (
                <div key={i} className="glass-card" style={{ padding: "2rem", borderLeft: `4px solid ${agent.color}` }}>
                   <CheckCircle size={24} color={agent.color} style={{ marginBottom: "1rem" }} />
                   <h4 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>{feature}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Dive Capabilities */}
        <section className="section" id="capabilities">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", marginBottom: "2rem" }}>
                   How {agent.name} <span className="gradient-text">Scales Your Business</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {agent.capabilities.map((cap, i) => (
                    <div key={i} style={{ display: "flex", gap: "1.5rem" }}>
                      <div style={{ 
                        width: 48, height: 48, borderRadius: "12px", 
                        background: `${agent.color}20`, display: "flex", 
                        alignItems: "center", justifyContent: "center", flexShrink: 0 
                      }}>
                        {i === 0 ? <MessageSquare size={24} color={agent.color} /> : 
                         i === 1 ? <Zap size={24} color={agent.color} /> : 
                         <TrendingUp size={24} color={agent.color} />}
                      </div>
                      <div>
                        <h4 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{cap.title}</h4>
                        <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.6 }}>{cap.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card" style={{ padding: "3rem", borderRadius: "24px", position: "relative" }}>
                 <div style={{ marginBottom: "2rem" }}>
                    <div style={{ color: agent.color, fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>Value Proposition</div>
                    <h3 style={{ color: "white", fontSize: "1.75rem", fontWeight: 800 }}>0% Fatigue. <br />100% Accuracy.</h3>
                 </div>
                 <p style={{ color: "var(--color-neutral-300)", marginBottom: "2rem", lineHeight: 1.8 }}>
                    Unlike human employees, {agent.name} doesn&apos;t take sick days, doesn&apos;t require health insurance, and maintains peak performance 24 hours a day, 365 days a year. 
                 </p>
                 <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Book a Technical Demo
                 </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
