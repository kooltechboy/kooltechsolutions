import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Kool Tech Solutions",
  description: "Kool Tech Solutions Privacy Policy — how we collect, use, and protect your data.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, such as when you fill out a contact form, create a client portal account, or communicate with our support team. This may include your name, email address, company name, phone number, and details about your IT environment. We also collect technical information automatically when you visit our website, including IP address, browser type, pages visited, and device information through cookies and similar technologies.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to: (a) provide, maintain, and improve our managed IT services; (b) process and fulfill service requests and support tickets; (c) communicate with you about your account and services; (d) send security alerts and notifications relevant to your IT environment; (e) comply with legal obligations; and (f) improve our services through analytics and usage patterns.`,
  },
  {
    title: "3. Data Security",
    content: `Security is at the core of everything we do at Kool Tech Solutions. We implement enterprise-grade security measures to protect your data, including AES-256 encryption at rest and in transit, multi-factor authentication on all internal systems, role-based access controls, regular third-party security audits, and compliance with SOC 2 Type II standards. Access to client data is limited to authorized personnel on a need-to-know basis.`,
  },
  {
    title: "4. Data Sharing",
    content: `We do not sell your personal information. We may share your information with: (a) trusted third-party service providers who assist us in operating our platform (e.g., cloud hosting, email delivery), bound by confidentiality agreements; (b) law enforcement or government agencies when required by law; and (c) a successor entity in the event of a merger or acquisition. Any third parties with whom we share data are carefully vetted and held to strict data protection standards.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Client data is retained for a minimum of 7 years following contract termination to comply with accounting and regulatory requirements. You may request deletion of your personal data at any time, subject to these legal retention requirements.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your jurisdiction, you may have the right to: access your personal data; correct inaccurate data; request deletion of your data; object to processing; and data portability. For clients subject to GDPR (EU/EEA) or the Dominican Republic's Ley 172-13, additional rights apply. To exercise any of these rights, contact our Data Protection Officer at dpo@kooltech.solutions.`,
  },
  {
    title: "7. Cookies",
    content: `We use essential cookies to operate our website and client portal, as well as analytics cookies to understand how visitors use our site. You can control cookie preferences through your browser settings. Disabling cookies may affect functionality of the client portal.`,
  },
  {
    title: "8. Contact Us",
    content: `If you have questions about this Privacy Policy or our data practices, contact our Data Protection Officer at: dpo@kooltech.solutions | Kool Tech Solutions, Data Privacy Office, Santiago, Dominican República. We will respond to all privacy inquiries within 72 hours.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        <section style={{ padding: "5rem 0 4rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Legal</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1rem" }}>
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              Last updated: May 1, 2026. This policy explains how Kool Tech Solutions collects, uses, and protects your personal information.
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
