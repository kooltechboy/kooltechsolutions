"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  ArrowRight, 
  Bot, 
  Clock, 
  BarChart3, 
  UserCheck, 
  Database, 
  Activity, 
  CalendarRange,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

const agents = [
  {
    name: "Kira",
    role: "Executive Concierge",
    desc: "Optimizes visitor journeys and identifies high-value infrastructure opportunities.",
    icon: Sparkles,
    color: "#00D4FF",
    specialty: "Lead Intelligence",
    emoji: "👋",
    stats: [
      { label: "Response Time", value: "< 1.2s", icon: Clock },
      { label: "Lead Capture", value: "Automated", icon: BarChart3 }
    ]
  },
  {
    name: "Max",
    role: "Senior Solutions Architect",
    desc: "Handles complex technical inquiries, security audits, and cloud orchestration.",
    icon: Shield,
    color: "#00E676",
    specialty: "Technical Support",
    emoji: "🛡️",
    stats: [
      { label: "Accuracy Rate", value: "99.9%", icon: UserCheck },
      { label: "Security", value: "SOC2 Ready", icon: Database }
    ]
  },
  {
    name: "Aria",
    role: "Strategic Coordinator",
    desc: "Aligns business goals with IT strategy and manages engineering consultations.",
    icon: Zap,
    color: "#FFB300",
    specialty: "Consultation & Sales",
    emoji: "📅",
    stats: [
      { label: "Sync Latency", value: "Realtime", icon: Activity },
      { label: "Booking Rate", value: "94.2%", icon: CalendarRange }
    ]
  },
  {
    name: "Nova",
    role: "AI Sales Development",
    desc: "Outbound lead generation outreach, email nurturing, and sales growth pipeline optimization.",
    icon: TrendingUp,
    color: "#F43F5E",
    specialty: "Outbound Growth",
    emoji: "🚀",
    stats: [
      { label: "Outreach Speed", value: "Continuous", icon: Clock },
      { label: "Pipeline Yield", value: "Automated", icon: BarChart3 }
    ]
  }
];

export default function AIWorkforceSection() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6 shadow-sm"
          >
            <Bot size={16} className="animate-pulse" />
            Autonomous Intelligence
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight"
          >
            Meet Your Proactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">AI Workforce</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 font-normal leading-relaxed"
          >
            Our specialized AI agents work 24/7 to engage visitors, handle technical support, and accelerate your business growth through human-like interaction.
          </motion.p>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {agents.map((agent, index) => {
            const AgentIcon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/90 transition-all duration-300 shadow-2xl flex flex-col justify-between h-full"
              >
                {/* Accent Top Glow Border */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl transition-opacity duration-300 opacity-60 group-hover:opacity-100" 
                  style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
                />

                {/* Subtle Radial Glow on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${agent.color}08 0%, transparent 60%)` }}
                />
                
                <div className="relative z-10">
                  {/* Top Row: Icon and Status */}
                  <div className="flex items-center justify-between mb-8">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                      style={{ 
                        background: `${agent.color}15`, 
                        border: `1px solid ${agent.color}30`, 
                        color: agent.color 
                      }}
                    >
                      <AgentIcon size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#00E676]" />
                      <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Active Now</span>
                    </div>
                  </div>

                  {/* Name and Role */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-white tracking-tight">{agent.name}</h3>
                      <span className="text-xl leading-none">{agent.emoji}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{agent.role}</p>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 font-normal min-h-[48px]">
                    {agent.desc}
                  </p>

                  {/* Inside Stats/Capability Tiles */}
                  <div className="grid grid-cols-2 gap-3 mb-6 pt-6 border-t border-slate-800/60">
                    {agent.stats.map((stat) => {
                      const StatIcon = stat.icon;
                      return (
                        <div 
                          key={stat.label}
                          className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/40 flex flex-col gap-1.5"
                        >
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <StatIcon size={12} style={{ color: agent.color }} />
                            {stat.label}
                          </span>
                          <span className="text-sm font-semibold text-white font-mono">{stat.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Specialty Tag */}
                <div className="relative z-10 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Focus Area</span>
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase" 
                    style={{ 
                      backgroundColor: `${agent.color}10`, 
                      color: agent.color, 
                      border: `1px solid ${agent.color}25` 
                    }}
                  >
                    {agent.specialty}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Integrated Dock Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 p-8 md:p-10 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl hover:border-slate-700/60 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Swapping Avatars Stack */}
            <div className="flex -space-x-3.5">
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-lg shadow-md">👋</div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-lg shadow-md">🛡️</div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-lg shadow-md">📅</div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-lg shadow-md">🚀</div>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg tracking-tight mb-1">Integrated with your CRM & Portal</h4>
              <p className="text-slate-400 text-sm font-normal">Leads and appointments are automatically synchronized for your team.</p>
            </div>
          </div>
          <Link href="/contact?intent=Book+AI+Consultation" className="btn-primary flex items-center gap-2 whitespace-nowrap px-6 py-3.5 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
            Book AI Consultation <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
