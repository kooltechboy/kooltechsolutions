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
    name: "Managed IT & Help Desk",
    icon: "Monitor",
    description: "Your primary IT engine. SLA-backed support and proactive infrastructure management.",
    services: [
      { id: "hds-1", name: "Help Desk as a Service (HDS)", code: "PRO-HDS-M", price: "$45.00", priceType: "Monthly", description: "Unlimited 24/7 multichannel support (email, phone, chat, portal) with defined SLA tiers and automated onboarding/offboarding.", priority: "High" },
      { id: "1", name: "Tier 1: Essential IT & Patch Management", code: "MRR-T1-ESS-M", price: "$50.00", priceType: "Monthly", description: "24/7 proactive endpoint health monitoring, automated OS and 3rd party software patching, and remote helpdesk access." },
      { id: "2", name: "Tier 2: Advanced Endpoint Defense (MDR)", code: "MRR-T2-MDR-M", price: "$65.00", priceType: "Monthly", description: "All Tier 1 features, plus managed EDR for ransomware tracking, real-time vulnerability dashboards, and a secure team password vault." },
      { id: "asset-1", name: "IT Asset Tracking & Management", code: "NOC-ASSET-M", price: "$15.00", priceType: "Monthly", description: "Hardware and software inventory management, license tracking, and hardware lifecycle reporting.", priority: "Medium" }
    ]
  },
  {
    name: "NOC as a Service",
    icon: "Zap",
    description: "24/7 Network Operations Center providing infrastructure uptime guarantees.",
    services: [
      { id: "noc-srv", name: "Managed Server Infrastructure", code: "NOC-SRV-M", price: "$150.00", priceType: "Monthly", description: "Full lifecycle management of physical and virtual servers, including patching, backups, and 24/7 monitoring." },
      { id: "noc-cld", name: "Cloud Infrastructure Monitoring", code: "NOC-CLD-M", price: "$200.00", priceType: "Monthly", description: "Proactive monitoring and management of Azure, AWS, and Google Cloud environments with auto-scaling optimization." },
      { id: "noc-net", name: "Enterprise Network Management", code: "NOC-NET-M", price: "$125.00", priceType: "Monthly", description: "Management of switches, access points, and controllers with 99.9% uptime guarantees." },
      { id: "3", name: "NOC as a Service (Core Package)", code: "NOC-AAS", price: "$250.00", priceType: "Monthly", description: "Unified 24/7 infrastructure monitoring, incident management, and automated remediation workflows." }
    ]
  },
  {
    name: "SOC as a Service",
    icon: "Shield",
    description: "Security Operations Center with AI-driven threat hunting and SIEM integration.",
    services: [
      { id: "soc-siem", name: "Managed SIEM (Sentinel/Elastic)", code: "SOC-SIEM-M", price: "$350.00", priceType: "Monthly", description: "Enterprise-wide log aggregation and correlation using Microsoft Sentinel or Elastic SIEM for advanced threat hunting." },
      { id: "7", name: "Tier 3: The Autonomous AI SOC", code: "MRR-T3-SOC-M", price: "$95.00", priceType: "Monthly", description: "24/7 AI driven threat analysis, automated network isolation for compromised devices, and dedicated analyst review." },
      { id: "8", name: "SOC as a Service (Full Analyst Coverage)", code: "SOC-AAS", price: "$500.00", priceType: "Monthly", description: "Dedicated 24/7 Security Operations Center monitoring with human analyst verification and incident containment." },
      { id: "email-sec", name: "Managed Email Security Gateway", code: "MSEC-MAIL-M", price: "$5.00", priceType: "Monthly", description: "Advanced anti-spam, anti-phishing, and email encryption using Proofpoint or Microsoft Defender for Office 365.", priority: "High" }
    ]
  },
  {
    name: "Compliance as a Service",
    icon: "ClipboardCheck",
    description: "Continuous compliance management for global and local frameworks.",
    services: [
      { id: "14", name: "Compliance as a Service (Continuous)", code: "COMP-AAS", price: "$750.00", priceType: "Monthly", description: "Ongoing monitoring and evidence collection for HIPAA, PCI-DSS, SOC2, and GDPR." },
      { id: "comp-dr", name: "Dominican Republic Data Privacy (Ley 172-13)", code: "COMP-DR-M", price: "$300.00", priceType: "Monthly", description: "Specific compliance alignment and auditing for local DR data protection regulations." },
      { id: "15", name: "Compliance Framework Audit (One-Time)", code: "PRO-COMP-P", price: "$3,000.00", priceType: "One-time", description: "Deep-dive audit and gap analysis for ISO 27001, NIST, or CMMC certification readiness." },
      { id: "16", name: "Virtual vCISO Advisory", code: "PRO-VCISO-R", price: "$450.00", priceType: "Monthly", description: "Executive-level cybersecurity leadership, policy development, and technology risk roadmapping." }
    ]
  },
  {
    name: "Enterprise Communications",
    icon: "PhoneCall",
    description: "Unified Communications (UCaaS) and secure perimeter connectivity.",
    services: [
      { id: "voip-ucaas", name: "Enterprise UCaaS (Teams/Zoom/RingCentral)", code: "VOIP-UCaaS-M", price: "$25.00", priceType: "Monthly", description: "White-label unified communications with SIP trunking, contact center/IVR setup, and multi-site deployment.", priority: "High" },
      { id: "26", name: "Managed Cloud PBX", code: "VOIP-PBX-M", price: "$250.00", priceType: "Monthly", description: "Ongoing management of the phone system, call recording, and mobile app integration." },
      { id: "27", name: "VoIP Implementation Services", code: "VOIP-IMP-P", price: "$1,500.00", priceType: "One-time", description: "Initial setup, network optimization, and digital receptionist (IVR) configuration for cloud telephony." },
      { id: "28", name: "Managed Perimeter Security (Firewall)", code: "MSEC-FW-M", price: "$200.00", priceType: "Monthly", description: "Management of NGFW appliances, Zero Trust VLANs, and VPN access controls." }
    ]
  },
  {
    name: "Software & App Development",
    icon: "Code",
    description: "Custom software engineering and AI-driven digital transformation.",
    services: [
      { id: "web-mob", name: "Web & Mobile App Development", code: "WEB-MOB-P", price: "$5,000.00", priceType: "One-time", description: "End-to-end engineering for iOS, Android, and web platforms with discovery and architecture phases.", priority: "High" },
      { id: "web-api", name: "API Integration & Middleware", code: "WEB-API-P", price: "$1,500.00", priceType: "One-time", description: "Building custom connectors and automated data pipelines between enterprise platforms." },
      { id: "web-ret", name: "Development Maintenance Retainer", code: "WEB-RET-M", price: "$1,200.00", priceType: "Monthly", description: "Dedicated development hours for ongoing feature updates, security patches, and platform optimization." },
      { id: "23", name: "Custom AI Agent Development", code: "AIAAS-DEV-P", price: "$800.00", priceType: "One-time", description: "Design and training of autonomous AI agents for customer support or internal workflow automation." }
    ]
  }
];
