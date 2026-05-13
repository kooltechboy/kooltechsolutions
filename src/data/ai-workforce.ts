export interface AIAgent {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  description: string;
  features: string[];
  capabilities: { title: string; desc: string }[];
  image: string;
  color: string;
}

export const aiWorkforce: AIAgent[] = [
  {
    slug: "kira-receptionist",
    name: "Kira",
    role: "The Smart Receptionist",
    tagline: "Never miss a call or a lead again.",
    description: "Kira is a high-performance AI receptionist capable of handling hundreds of simultaneous calls with human-like natural language processing.",
    features: [
      "24/7 Inbound Call Handling",
      "Automated Appointment Booking",
      "Lead Qualification & CRM Entry",
      "Multilingual Support (English/Spanish)"
    ],
    capabilities: [
      { title: "Natural Conversation", desc: "Advanced NLP allows Kira to understand intent and nuance, not just keywords." },
      { title: "Calendar Sync", desc: "Integrates directly with Google Calendar, Outlook, and Calendly." },
      { title: "Smart Escalation", desc: "Knows exactly when to transfer to a human specialist for complex issues." }
    ],
    image: "/images/ai/kira.png",
    color: "#00D4FF"
  },
  {
    slug: "max-support",
    name: "Max",
    role: "The Technical Support Pro",
    tagline: "Instant resolution for Tier 1 issues.",
    description: "Max is an AI support specialist trained on your company's knowledge base, documentation, and historical ticket data.",
    features: [
      "Automated Ticket Resolution",
      "Knowledge Base Search",
      "System Status Reporting",
      "Software Reset Assistance"
    ],
    capabilities: [
      { title: "Deep Integration", desc: "Connects to your RMM and Ticketing tools for real-time system checks." },
      { title: "Step-by-Step Guides", desc: "Provides interactive, visual instructions to end-users via chat or voice." },
      { title: "Proactive Alerts", desc: "Identifies recurring issues and alerts the human team before they escalate." }
    ],
    image: "/images/ai/max.png",
    color: "#FFB300"
  },
  {
    slug: "nova-sales",
    name: "Nova",
    role: "The Sales Development Agent",
    tagline: "Your 24/7 outbound growth engine.",
    description: "Nova specializes in identifying prospects, initiating contact, and nurturing leads until they are ready for a sales demo.",
    features: [
      "Automated Lead Sourcing",
      "LinkedIn & Email Outreach",
      "Behavioral Follow-ups",
      "Sentiment Analysis"
    ],
    capabilities: [
      { title: "Hyper-Personalization", desc: "Researches prospects automatically to craft truly personalized messages." },
      { title: "Follow-up Automation", desc: "Uses 'optimal timing' algorithms to send follow-ups when prospects are most active." },
      { title: "Dashboard Insights", desc: "Provides detailed analytics on engagement, conversion, and pipeline velocity." }
    ],
    image: "/images/ai/nova.png",
    color: "#FF4444"
  }
];
