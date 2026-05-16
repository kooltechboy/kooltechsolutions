"use client";
import { useState } from "react";
import { 
  FolderOpen, FileText, Shield, Book, Download, Search, Lock, 
  ChevronRight, ArrowUpRight, ShieldCheck, Database, 
  ExternalLink, Info, Filter, MoreVertical, FileCode, FileType
} from "lucide-react";

const documentCategories = [
  {
    name: "Service Agreements",
    icon: FileText,
    color: "text-[#00D4FF]",
    bg: "bg-[#00D4FF]/10",
    border: "border-[#00D4FF]/20",
    docs: [
      { name: "Master Service Agreement (MSA)", date: "Jan 15, 2026", size: "2.4 MB", type: "PDF", locked: false },
      { name: "Service Level Agreement (SLA)", date: "Jan 15, 2026", size: "1.1 MB", type: "PDF", locked: false },
      { name: "Acceptable Use Policy", date: "Jan 15, 2026", size: "0.8 MB", type: "PDF", locked: false },
    ],
  },
  {
    name: "Security & Compliance",
    icon: Shield,
    color: "text-[#A855F7]",
    bg: "bg-[#A855F7]/10",
    border: "border-[#A855F7]/20",
    docs: [
      { name: "Security Assessment Report Q1 2026", date: "Apr 1, 2026", size: "5.2 MB", type: "PDF", locked: false },
      { name: "Penetration Test Results (Confidential)", date: "Mar 14, 2026", size: "3.8 MB", type: "PDF", locked: true },
      { name: "Compliance Posture Report (HIPAA)", date: "Apr 15, 2026", size: "2.9 MB", type: "PDF", locked: false },
    ],
  },
  {
    name: "Runbooks & Procedures",
    icon: Book,
    color: "text-[#00E676]",
    bg: "bg-[#00E676]/10",
    border: "border-[#00E676]/20",
    docs: [
      { name: "Incident Response Playbook", date: "Feb 1, 2026", size: "1.7 MB", type: "PDF", locked: false },
      { name: "Backup & Recovery Procedure", date: "Feb 1, 2026", size: "1.2 MB", type: "PDF", locked: false },
      { name: "Change Management Process", date: "Mar 1, 2026", size: "0.9 MB", type: "PDF", locked: false },
    ],
  },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const allDocs = documentCategories.flatMap(c => c.docs.map(d => ({ ...d, category: c.name, catColor: c.color, catBg: c.bg, catBorder: c.border })));
  const filtered = search ? allDocs.filter(d => d.name.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
          Document <span className="text-[#00D4FF]">Vault</span>
        </h1>
        <p className="text-neutral-400 text-sm max-w-md">
          Secure repository for contracts, compliance certifications, and enterprise runbooks.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          <input 
            type="text" 
            placeholder="Search document vault..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all placeholder:text-neutral-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none p-4 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-all">
            <Filter size={18} />
          </button>
          <button className="flex-[3] sm:flex-none px-8 py-4 rounded-2xl bg-white text-[#0A1628] font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all">
            Request Doc
          </button>
        </div>
      </div>

      {/* Results / Categories */}
      <div className="space-y-12">
        {filtered ? (
          <div className="glass-card rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-bold font-syne tracking-tight uppercase">Search Results</h2>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{filtered.length} files found</span>
            </div>
            <div className="p-2">
              {filtered.map(doc => (
                <DocRow key={doc.name} doc={doc} color={doc.catColor} bg={doc.catBg} border={doc.catBorder} />
              ))}
              {filtered.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <Database size={40} className="mx-auto text-neutral-800" />
                  <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-[0.2em]">Zero matches in current index</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          documentCategories.map(cat => (
            <div key={cat.name} className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color} border ${cat.border}`}>
                  <cat.icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-syne tracking-tight uppercase">{cat.name}</h2>
                  <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">{cat.docs.length} Active Documents</p>
                </div>
                <div className="flex-1 h-px bg-white/5 ml-4" />
              </div>
              
              <div className="glass-card rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden p-2">
                {cat.docs.map(doc => (
                  <DocRow key={doc.name} doc={doc} color={cat.color} bg={cat.bg} border={cat.border} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Footer */}
      <div className="bg-[#A855F7]/5 border border-[#A855F7]/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7] border border-[#A855F7]/20 shrink-0">
          <Shield size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-white font-syne mb-2">End-to-End Encryption Enabled</h3>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl">
            All files in the vault are encrypted at rest with AES-256 and protected by role-based access control (RBAC). 
            Access to sensitive documents is logged and audited for compliance purposes.
          </p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all shrink-0">
          Audit Logs
        </button>
      </div>
    </div>
  );
}

function DocRow({ doc, color, bg, border }: { doc: any; color: string; bg: string; border: string }) {
  return (
    <div className="group flex items-center justify-between p-4 hover:bg-white/[0.03] rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/5">
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} border ${border} transition-transform group-hover:scale-110`}>
          {doc.locked ? <Lock size={18} className="text-red-400" /> : <FileText size={18} />}
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-bold tracking-tight truncate ${doc.locked ? 'text-neutral-500' : 'text-white'}`}>
            {doc.name}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-neutral-600 mt-1">
            <span>{doc.date}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-800" />
            <span>{doc.size}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:inline-flex px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-500 text-[9px] font-black uppercase tracking-widest">
          {doc.type}
        </div>
        {doc.locked ? (
          <div className="flex items-center gap-2 text-red-500/50 text-[10px] font-black uppercase tracking-widest px-4 py-2">
            <Lock size={12} /> Restricted
          </div>
        ) : (
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-[#00D4FF] hover:text-[#0A1628] hover:border-[#00D4FF] transition-all text-[10px] font-black uppercase tracking-widest group/btn">
            <Download size={14} className="group-hover/btn:translate-y-0.5 transition-transform" />
            <span>Secure Download</span>
          </button>
        )}
        <button className="p-2 text-neutral-700 hover:text-white transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
