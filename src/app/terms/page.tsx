import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | Kool Tech Solutions",
  description: "Kool Tech Solutions Terms of Service — the terms and conditions governing your use of our services.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using Kool Tech Solutions' services, website, or client portal, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services. These terms constitute a legally binding agreement between you and Kool Tech Solutions.",
  },
  {
    title: "2. Service Agreement",
    content: "The provision of managed IT services is governed by the Master Service Agreement (MSA) and Statement of Work (SOW) executed between Kool Tech Solutions and each client. In the event of any conflict between these Terms of Service and your MSA, the MSA shall prevail for services rendered under that agreement.",
  },
  {
    title: "3. Client Responsibilities",
    content: "Clients are responsible for: (a) providing accurate account and technical information; (b) maintaining the security of portal login credentials; (c) promptly reporting security incidents to our SOC; (d) allowing authorized KTS personnel reasonable access to managed systems; and (e) ensuring their own users comply with acceptable use policies.",
  },
  {
    title: "4. Service Levels & SLAs",
    content: "Service Level Agreements are defined in your individual contract. KTS commits to the response times and uptime guarantees specified therein. SLA credits are provided for verified outages exceeding contractual thresholds, as detailed in your MSA. Force majeure events, scheduled maintenance windows, and client-caused issues are excluded from SLA calculations.",
  },
  {
    title: "5. Intellectual Property",
    content: "All proprietary tools, AI systems, automation scripts, monitoring dashboards, and platform configurations developed by Kool Tech Solutions remain the exclusive intellectual property of KTS. Upon termination of services, clients retain ownership of their data and may request export of all client-owned data within 30 days.",
  },
  {
    title: "6. Limitation of Liability",
    content: "To the maximum extent permitted by applicable law, Kool Tech Solutions' liability for any claim arising from or related to these terms or the services provided shall not exceed the total fees paid by the client in the three months preceding the claim. KTS shall not be liable for indirect, incidental, special, or consequential damages.",
  },
  {
    title: "7. Termination",
    content: "Either party may terminate the service agreement with 30 days written notice, subject to the terms of your MSA. KTS reserves the right to immediately suspend services in cases of non-payment, violation of acceptable use policies, or illegal activity. Upon termination, all client data will be returned or destroyed per the data retention policy.",
  },
  {
    title: "8. Governing Law",
    content: "These Terms shall be governed by the laws of the Dominican Republic. Any disputes arising from these terms shall be resolved through binding arbitration in Santiago, Dominican Republic, unless otherwise specified in your executed MSA.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        <section style={{ padding: "5rem 0 4rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Legal</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1rem" }}>
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              Last updated: May 1, 2026. Please read these terms carefully before using Kool Tech Solutions&apos; services.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: "820px" }}>
            {sections.map(s => (
              <div key={s.title} style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", marginBottom: "1rem", borderLeft: "3px solid var(--color-accent-500)", paddingLeft: "1rem" }}>
                  {s.title}
                </h2>
                <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.8, fontSize: "0.9375rem" }}>{s.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
