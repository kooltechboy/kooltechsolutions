"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/portal";
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {error && (
        <div style={{ padding: "0.75rem", background: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.3)", borderRadius: "8px", color: "#FF4444", fontSize: "0.8125rem", textAlign: "center" }}>
          {error}
        </div>
      )}
      
      <div>
        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Email Address</label>
        <div style={{ position: "relative" }}>
          <Mail size={16} color="var(--color-neutral-500)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="email" 
            required 
            className="input-field" 
            placeholder="admin@company.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>
      </div>
      
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>Password</label>
          <Link href="/forgot-password" style={{ color: "var(--color-accent-500)", fontSize: "0.75rem", textDecoration: "none" }}>Forgot password?</Link>
        </div>
        <div style={{ position: "relative" }}>
          <Lock size={16} color="var(--color-neutral-500)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="password" 
            required 
            className="input-field" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn-primary" 
        disabled={loading}
        style={{ justifyContent: "center", padding: "0.875rem", marginTop: "0.5rem" }}
      >
        {loading ? "Authenticating..." : (
          <>Sign In <ArrowRight size={17} /></>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--color-primary-950)" }}>
      {/* Left side - Login Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", marginBottom: "2rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "linear-gradient(135deg, #00D4FF, #1E4D8C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", fontFamily: "Syne, sans-serif" }}>KT</span>
              </div>
              <span style={{ color: "white", fontWeight: 700, fontSize: "1.25rem", fontFamily: "Syne, sans-serif" }}>Kool Tech Solutions</span>
            </Link>
            
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", marginBottom: "0.5rem" }}>
              Welcome Back
            </h1>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
              Secure access to your enterprise IT environment.
            </p>
          </div>
          
          <div className="glass-card" style={{ borderRadius: "20px", padding: "2rem" }}>
            <Suspense fallback={<div style={{ textAlign: "center", color: "var(--color-neutral-500)" }}>Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
          
          <p style={{ textAlign: "center", color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "2rem" }}>
            Need an account? Contact your Kool Tech Solutions account manager.
          </p>
        </div>
      </div>
      
      {/* Right side - Visuals (hidden on mobile) */}
      <div style={{ 
        flex: 1, 
        background: "linear-gradient(135deg, rgba(10,22,40,0.8), rgba(6,11,24,0.95))", 
        borderLeft: "1px solid rgba(0,212,255,0.08)",
        display: "none",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "4rem",
        position: "relative",
        overflow: "hidden"
      }} className="login-visual-panel">
        
        {/* Abstract background mesh */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.3, background: "radial-gradient(circle at 50% 50%, rgba(0,212,255,0.1) 0%, transparent 60%)" }} />
        
        <div style={{ maxWidth: "480px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,212,255,0.2)" }}>
              <ShieldCheck size={24} color="var(--color-accent-500)" />
            </div>
            <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,230,118,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,230,118,0.2)" }}>
              <User size={24} color="var(--color-success)" />
            </div>
          </div>
          
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
            Enterprise IT, <br />
            <span className="gradient-text">Simplified.</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            You are entering a secure environment. All actions are logged and monitored by our 24/7 Security Operations Center.
          </p>
          
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "16px", borderLeft: "3px solid var(--color-accent-500)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} className="pulse-online" />
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>SOC Status: Operational</span>
            </div>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", margin: 0 }}>
              Zero-Trust Architecture enforced. Multi-factor authentication may be required upon login.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @media (min-width: 900px) {
          .login-visual-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
