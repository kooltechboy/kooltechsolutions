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
    content: `KOOL TECH SOLUTIONS collects personal information that you provide directly (such as names, emails, phone numbers, and company details when submitting forms) and technical information collected automatically (including IP addresses, device types, browser information, and website interaction logs via cookies). Additionally, if you interact with our AI Voice Assistant, we process real-time voice inputs to run the audio stream; however, we do not store, record, or sell biometric data or voice prints.`,
  },
  {
    title: "2. Legal Bases for Processing",
    content: `We process your data under the following legal bases: (a) your explicit, prior consent (e.g., when you opt-in to marketing communications or activate the AI Voice Assistant); (b) the performance of our contract with you (to deliver Managed IT Services, support tickets, and client portal functions); (c) compliance with legal and regulatory obligations; and (d) our legitimate business interests, provided they do not override your privacy rights (e.g., system monitoring, security audits, and preventing fraud).`,
  },
  {
    title: "3. Data Security & HIPAA Alignment",
    content: `Security is the core of our operations. KOOL TECH SOLUTIONS implements industry-leading security controls, including AES-256 encryption in transit and at rest, multi-factor authentication (MFA), role-based access control (RBAC), and 24/7 Security Operations Center (SOC) monitoring. For our healthcare-related clients, we sign Business Associate Agreements (BAAs) and maintain strict administrative, physical, and technical safeguards in full alignment with the Health Insurance Portability and Accountability Act (HIPAA).`,
  },
  {
    title: "4. No Sale or Sharing of Personal Information",
    content: `We do not sell, rent, or lease your personal information to third parties. We may disclose data to trusted service providers (such as cloud hosting and email delivery services) operating under strict data processing agreements. We may also disclose information to law enforcement when legally mandated.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, resolve disputes, and comply with statutory retention requirements. Client portal files, configuration logs, and database records are kept for a minimum of 7 years following contract termination to satisfy financial and legal auditing rules.`,
  },
  {
    title: "6. Jurisdiction-Specific Rights",
    content: `Depending on where you reside, you have specific statutory privacy rights:
• Dominican Republic (Ley No. 172-13): You have the right to access, rectify, cancel, and oppose (ARCO rights) the processing of your personal data in our databases.
• United States (California CPRA & State Laws): You have the right to request access, correction, deletion, and portability of your personal data, as well as the right to limit the use of Sensitive Personal Information (SPI) and opt-out of marketing. We do not sell or share data as defined under California law.
• Canada (PIPEDA & Quebec Law 25): You have the right to access and correct data, withdraw consent at any time, request data portability in a structured format, and request de-indexing or cessation of dissemination.
• Caribbean & Latin America (e.g., Jamaica DPA, Brazil LGPD): You have the right to confirm the existence of processing, access your data, request anonymization or deletion of unnecessary data, and obtain portability.`,
  },
  {
    title: "7. Voice Assistant & Biometrics",
    content: `Our floating AI Voice Assistant utilizes LiveKit and Gemini to facilitate real-time voice support. Microphone access is strictly opt-in and is not activated until you click the explicit "I Consent" button. Voice streams are processed in real-time to generate AI responses and are not logged or stored permanently on our servers.`,
  },
  {
    title: "8. Cookie Policy & AdSense Control",
    content: `We use essential cookies to maintain secure sessions in the client portal. We also load Google AdSense for marketing. Non-essential tracking and advertising cookies are deactivated by default. You can change your preferences at any time using our Cookie Consent Banner or via your browser settings. When marketing cookies are rejected, AdSense runs in Non-Personalized Ads (NPA) mode.`,
  },
  {
    title: "9. Data Subject Access Requests (DSAR) Procedure",
    content: `To exercise your rights (access, correction, deletion, portability, or objection), please submit a detailed request to our Data Protection Officer at dpo@kooltech.solutions. To protect your privacy, we will verify your identity before processing any request. We respond to all verified requests within the statutory timelines (typically 30 days for DR/Canada, 45 days for US).`,
  },
  {
    title: "10. Contact Us & Data Protection Officer",
    content: `KOOL TECH SOLUTIONS is registered in Santiago, Dominican Republic. For any questions regarding this Privacy Policy, please contact our Data Protection Officer (DPO) at:
Email: dpo@kooltech.solutions | Alternative: privacy@kooltechsolutions.com
Address: KOOL TECH SOLUTIONS, Data Privacy Office, Santiago, Dominican República.`,
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
            <div style={{ marginTop: "3rem", padding: "1.5rem", borderRadius: "12px", background: "rgba(0,212,255,0.05)", borderLeft: "4px solid var(--color-accent-500)" }}>
              <p style={{ color: "var(--color-neutral-300)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                For any data protection or privacy concerns, please contact our Data Protection team at <a href="mailto:privacy@kooltechsolutions.com" style={{ color: "var(--color-accent-500)", fontWeight: 600, textDecoration: "none" }}>privacy@kooltechsolutions.com</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
