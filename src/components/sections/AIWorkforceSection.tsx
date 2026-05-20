"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, ArrowRight, Bot } from "lucide-react";
import Link from "next/link";

const agents = [
  {
    name: "Kira",
    role: "Executive Concierge",
    desc: "Optimizes visitor journeys and identifies high-value infrastructure opportunities.",
    icon: Sparkles,
    color: "#00D4FF",
    specialty: "Lead Intelligence",
    emoji: "👋"
  },
  {
    name: "Max",
    role: "Senior Solutions Architect",
    desc: "Handles complex technical inquiries, security audits, and cloud orchestration.",
    icon: Shield,
    color: "#00E676",
    specialty: "Technical Support",
    emoji: "🛡️"
  },
  {
    name: "Aria",
    role: "Strategic Coordinator",
    desc: "Aligns business goals with IT strategy and manages engineering consultations.",
    icon: Zap,
    color: "#FFB300",
    specialty: "Consultation & Sales",
    emoji: "📅"
  }
];

export default function AIWorkforceSection() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6"
          >
            <Bot size={16} />
            Autonomous Intelligence
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Meet Your Proactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI Workforce</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            Our specialized AI agents work 24/7 to engage visitors, handle technical support, and accelerate your business growth through human-like interaction.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl bg-slate-800/50 border border-white/5 hover:border-blue-500/30 transition-all duration-500"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${agent.color}15 0%, transparent 70%)` }}
              />
              
              <div className="relative z-10">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500"
                  style={{ background: `linear-gradient(135deg, ${agent.color}, #1E4D8C)` }}
                >
                  <agent.icon size={28} />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">{agent.name}</h3>
                  <span className="text-xl">{agent.emoji}</span>
                </div>
                <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">{agent.role}</p>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {agent.desc}
                </p>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{agent.specialty}</span>
                  <div className="flex items-center gap-1 text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    Active Now <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xl">🛡️</div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xl">📅</div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xl">⚡</div>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">Integrated with your CRM & Portal</h4>
              <p className="text-slate-400 text-sm">Leads and appointments are automatically synchronized for your team.</p>
            </div>
          </div>
          <Link href="/contact" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            Deploy AI Workforce <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
