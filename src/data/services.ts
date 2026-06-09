export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  priceType: "Monthly" | "One-time" | "Ad Hoc";
  code: string;
  priority?: "High" | "Medium" | "Low";
}

export interface ServiceCategory {
  name: string;
  icon: string;
  description: string;
  services: Service[];
}

export const serviceCatalog: ServiceCategory[] = [
  {
    name: "Managed IT & Security Bundles",
    icon: "Shield",
    description: "Enterprise-grade IT management and security stacks for modern businesses.",
    services: [
      { id: "hds-1", name: "Help Desk as a Service (HDS)", code: "PRO-HDS-M", price: "$29.00", priceType: "Monthly", description: "IT GOAT's #1 pillar. SLA-backed multichannel support (email, phone, chat, portal) and employee onboarding automation.", priority: "High" },
      { id: "1", name: "Tier 1: Essential IT & Patch Management", code: "MRR-T1-ESS-M", price: "$25.00", priceType: "Monthly", description: "24/7 proactive endpoint health monitoring, automated OS and 3rd party software patching, and remote helpdesk access." },
      { id: "2", name: "Tier 2: Advanced Endpoint Defense (MDR)", code: "MRR-T2-MDR-M", price: "$39.00", priceType: "Monthly", description: "All Tier 1 features, plus managed EDR for ransomware tracking, real-time vulnerability dashboards, and a secure team password vault." },
      { id: "3", name: "Tier 3: The Autonomous AI SOC", code: "MRR-T3-SOC-M", price: "$59.00", priceType: "Monthly", description: "All Tier 2 features, plus 24/7 AI driven threat analysis, automated network isolation for compromised devices, and dedicated analyst review." },
      { id: "co-managed", name: "Co-Managed Enterprise Security Stack", code: "MRR-COMIT-M", price: "$35.00", priceType: "Monthly", description: "We provide your internal IT department with our enterprise-grade toolkit (RMM, EDR, Automated Patching) and act as Tier 3 escalation support." }
    ]
  },
  {
    name: "Add-On Managed Services",
    icon: "PlusSquare",
    description: "Specialized security and management add-ons to harden your infrastructure.",
    services: [
      { id: "email-sec", name: "Managed Email Security", code: "MSEC-MAIL-M", price: "$3.00", priceType: "Monthly", description: "Anti-spam, anti-phishing gateway, email filtering, and encryption using Proofpoint or Microsoft Defender.", priority: "High" },
      { id: "asset-track", name: "IT Asset Tracking & Management", code: "NOC-ASSET-M", price: "$8.00", priceType: "Monthly", description: "Hardware/software inventory management, license tracking, and lifecycle reporting for full visibility.", priority: "Medium" },
      { id: "bcdr", name: "Business Continuity & Disaster Recovery (BaaS & DRaaS)", code: "MSEC-BDR-M", price: "$59.00", priceType: "Monthly", description: "Automated, immutable backups of critical servers and workstations with rapid virtual spin-up capabilities." },
      { id: "cloud-workspace", name: "Cloud Workspace Security (M365 / Google Workspace)", code: "MSEC-CWS-M", price: "$29.00", priceType: "Monthly", description: "Active monitoring of cloud tenants for impossible travel, unauthorized forwarding rules, and forced MFA compliance." },
      { id: "dark-web", name: "Dark Web Credential Monitoring", code: "MSEC-DWM-M", price: "$15.00", priceType: "Monthly", description: "Continuous 24/7 scanning of dark web forums for compromised employee email passwords." },
      { id: "human-risk", name: "Human Risk Management & Phishing Simulations", code: "MSEC-SAT-M", price: "$49.00", priceType: "Monthly", description: "Monthly simulated phishing campaigns and automated security awareness video training." },
      { id: "managed-edr", name: "Managed Endpoint Detection & Response (Standalone EDR)", code: "MSEC-EDR-M", price: "$39.00", priceType: "Monthly", description: "Deployment and management of NGAV to actively block malware, ransomware, and fileless attacks." },
      { id: "perimeter", name: "Managed Perimeter & Gateway Security", code: "MSEC-FW-M", price: "$99.00", priceType: "Monthly", description: "Management of office firewalls (Zero Trust VLANs, VPNs) and Web Application Firewalls." },
      { id: "mdm", name: "Mobile Device Management (MDM)", code: "MSEC-MDM-M", price: "$8.00", priceType: "Monthly", description: "Secure, track, and manage company-owned and BYOD mobile devices with remote wipe capability." }
    ]
  },
  {
    name: "NOC as a Service",
    icon: "Zap",
    description: "24/7 Network Operations Center providing infrastructure uptime guarantees.",
    services: [
      { id: "noc-mon", name: "24/7 Network Operations Center Monitoring", code: "NOC-AAS-M", price: "Custom", priceType: "Monthly", description: "Continuous network infrastructure monitoring, alerting, and escalation by our dedicated NOC team around the clock." },
      { id: "noc-maint", name: "NOC Proactive Maintenance & Remediation", code: "NOC-PRM-M", price: "Custom", priceType: "Monthly", description: "Scheduled maintenance windows, patch validation, device health checks, and performance tuning managed by certified NOC engineers." },
      { id: "noc-srv", name: "Managed Server Infrastructure", code: "NOC-SRV-M", price: "$89.00", priceType: "Monthly", description: "Server management with SLA uptime guarantees. Full patching, monitoring, and optimization." },
      { id: "noc-cld", name: "Cloud Infrastructure Monitoring", code: "NOC-CLD-M", price: "$119.00", priceType: "Monthly", description: "Proactive management of Azure, AWS, and Google Cloud environments with auto-scaling optimization." }
    ]
  },
  {
    name: "SOC as a Service",
    icon: "Shield",
    description: "Security Operations Center with SIEM deployment and human analyst coverage.",
    services: [
      { id: "soc-siem", name: "Managed SIEM & Threat Detection", code: "SOC-SIEM-M", price: "Custom", priceType: "Monthly", description: "Deployment and management of a Security Information and Event Management platform (Sentinel/Wazuh) with custom correlation rules." },
      { id: "soc-ir", name: "Incident Response Retainer", code: "SOC-IR-R", price: "Custom", priceType: "Monthly", description: "Prioritized access to our security team for threat investigation, forensic analysis, and incident containment." },
      { id: "soc-threat", name: "Threat Intelligence Feed & Reporting", code: "SOC-TI-M", price: "Custom", priceType: "Monthly", description: "Curated threat intelligence and situational awareness alerts tailored to your industry and technology stack." }
    ]
  },
  {
    name: "Compliance as a Service",
    icon: "ClipboardCheck",
    description: "Continuous compliance management for HIPAA, PCI-DSS, SOC2, and more.",
    services: [
      { id: "comp-mon", name: "Continuous Compliance Monitoring", code: "COMP-AAS-M", price: "Custom", priceType: "Monthly", description: "Automated, real-time compliance posture monitoring for frameworks including HIPAA, PCI-DSS, SOC2, ISO 27001, CMMC, and GDPR." },
      { id: "comp-pol", name: "Policy & Documentation Management", code: "COMP-POL-M", price: "Custom", priceType: "Monthly", description: "Creation, maintenance, and versioning of all required security policies, procedures, and evidence documentation for audit readiness." },
      { id: "comp-dr", name: "Dominican Republic Data Privacy (Ley 172-13)", code: "COMP-DR-M", price: "$149.00", priceType: "Monthly", description: "Specific alignment with local data protection laws (Ley 172-13) and GDPR applicability for EU-facing clients." }
    ]
  },
  {
    name: "AI as a Service (AIaaS) & Digital Web",
    icon: "Bot",
    description: "Custom AI employees, autonomous agents, and high-performance web platforms.",
    services: [
      { id: "ai-hosting", name: "Custom AI Employees - Managed Hosting", code: "AIAAS-HST-M", price: "$149.00", priceType: "Monthly", description: "Ongoing hosting, maintenance, and continuous learning integration for your autonomous AI agents." },
      { id: "web-hosting", name: "Secure Corporate Website Hosting & WAF", code: "WEB-HST-M", price: "$79.00", priceType: "Monthly", description: "Secure hosting behind our military-grade Web Application Firewalls, ensuring your customer data is never breached." },
      { id: "ai-kira", name: "Kira - AI Receptionist", code: "AIAAS-KIRA-M", price: "$129.00", priceType: "Monthly", description: "24/7 natural language call handling, appointment booking, and lead qualification." },
      { id: "ai-max", name: "Max - AI Support Pro", code: "AIAAS-MAX-M", price: "$149.00", priceType: "Monthly", description: "Automated ticket resolution and knowledge base integration for instant user support." },
      { id: "ai-nova", name: "Nova - AI Sales Development", code: "AIAAS-NOVA-M", price: "$189.00", priceType: "Monthly", description: "Autonomous outbound lead generation, outreach, and sales follow-up engine." },
      { id: "web-mob", name: "Custom Web & Mobile App Development", code: "WEB-MOB-P", price: "$3,500.00+", priceType: "One-time", description: "Discovery & Architecture (SOW-based) for iOS, Android, and API integrations. SKU: WEB-MOB-P, WEB-API-P." }
    ]
  },
  {
    name: "Cloud Licensing & SaaS",
    icon: "Cloud",
    description: "Official licensing and professional administration for M365 and Google Workspace.",
    services: [
      { id: "gws", name: "Google Workspace Business Standard", code: "LIC-GWS-BS-M", price: "$12.00", priceType: "Monthly", description: "Professional custom email, scalable cloud storage, and collaborative apps via Google Workspace." },
      { id: "m365", name: "Microsoft 365 Business Premium", code: "LIC-M365-BP-M", price: "$22.00", priceType: "Monthly", description: "Enterprise-grade email, Office desktop apps, Intune device management, and advanced cloud security (Defender)." }
    ]
  },
  {
    name: "Secure Cloud Communications",
    icon: "PhoneCall",
    description: "Enterprise VoIP solutions and unified communications platforms.",
    services: [
      { id: "voip-pbx", name: "Managed Cloud PBX", code: "VOIP-PBX-M", price: "$149.00", priceType: "Monthly", description: "Ongoing management of the phone system, call recording, and mobile app integration." },
      { id: "voip-ucaas", name: "Enterprise VoIP Solutions (UCaaS)", code: "VOIP-UCaaS-M", price: "Custom", priceType: "Monthly", description: "Teams/Zoom Phone/RingCentral white-label, SIP trunking management, and contact center/IVR setup.", priority: "High" }
    ]
  }
];
