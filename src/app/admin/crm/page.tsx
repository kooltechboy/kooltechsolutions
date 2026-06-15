"use client";
import { useState, useEffect } from "react";
import {
  DollarSign, Calendar, TrendingUp,
  Building, Loader2, X, Mail, Phone, MessageSquare, Briefcase,
  Search, Activity, Clock, Star,
  LayoutGrid, List, Tag, FileText, ChevronDown, ChevronUp,
  Send, Save, Edit2, Target, BarChart2, ArrowRight, UserPlus, Flame,
} from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { createClient } from "@/utils/supabase/client";

const STAGE_MAP: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal Sent", won: "Closed Won", lost: "Closed Lost",
};
const PIPELINE_STAGES = ["New Lead","Contacted","Qualified","Proposal Sent","Closed Won"];
const STAGE_COLORS: Record<string, string> = {
  "New Lead":"#00D4FF","Contacted":"#A855F7","Qualified":"#F59E0B",
  "Proposal Sent":"#F97316","Closed Won":"#10B981",
};
const DEAL_VALUES: Record<string, number> = {
  "Managed IT Services":102000,"Cybersecurity":144000,"Cloud Services":216000,
  "Cloud Infrastructure":216000,"Network Infrastructure":300000,"IT Consulting":60000,
  "VoIP & Communications":48000,"Backup & Disaster Recovery":72000,
};
const PREDEFINED_TAGS = [
  { label:"Hot", color:"#f43f5e", bg:"rgba(244,63,94,0.12)" },
  { label:"Warm", color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  { label:"Enterprise", color:"#8b5cf6", bg:"rgba(139,92,246,0.12)" },
  { label:"Caribbean", color:"#0ea5e9", bg:"rgba(14,165,233,0.12)" },
  { label:"Follow Up", color:"#f97316", bg:"rgba(249,115,22,0.12)" },
  { label:"Demo Ready", color:"#10b981", bg:"rgba(16,185,129,0.12)" },
  { label:"Cold", color:"#6b7280", bg:"rgba(107,114,128,0.12)" },
];
const SERVICE_OPTIONS = [
  "Managed IT Services","Cybersecurity","Cloud Services","Cloud Infrastructure",
  "Network Infrastructure","IT Consulting","VoIP & Communications","Backup & Disaster Recovery",
];
const EMPTY_FORM = { first_name:"", last_name:"", company_name:"", email:"", phone:"", service_interest:"", status:"new", notes:"" };

interface Lead {
  id:string; first_name:string; last_name:string; company_name?:string;
  email:string; phone?:string; service_interest?:string; status:string; notes?:string; created_at:string;
}
interface LeadActivity {
  id:string; type:"note"|"stage_change"|"demo_scheduled"|"call"|"email"|"created"; text:string; timestamp:string;
}

function getDealValue(si?: string): number {
  if (!si) return 90000;
  const key = Object.keys(DEAL_VALUES).find(k => si.toLowerCase().includes(k.toLowerCase()));
  return key ? DEAL_VALUES[key] : 90000;
}
function getLeadTags(id: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(`crm-tags-${id}`) || "[]"); } catch { return []; }
}
function saveLeadTags(id: string, tags: string[]) {
  if (typeof window !== "undefined") localStorage.setItem(`crm-tags-${id}`, JSON.stringify(tags));
}
function getLeadActivities(id: string): LeadActivity[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(`crm-activity-${id}`) || "[]"); } catch { return []; }
}
function pushActivity(id: string, act: Omit<LeadActivity,"id">) {
  if (typeof window === "undefined") return;
  const existing = getLeadActivities(id);
  localStorage.setItem(`crm-activity-${id}`, JSON.stringify([{ ...act, id: Date.now().toString() }, ...existing]));
}
function calcScore(lead: Lead, hasDemo: boolean): number {
  if (hasDemo) return Math.min(99, 90 + (lead.id.charCodeAt(0) % 9));
  const base = 35 + (lead.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 40);
  const bonus: Record<string,number> = { won:40, proposal:25, qualified:15, contacted:5, new:0, lost:0 };
  return Math.min(99, base + (bonus[lead.status] ?? 0));
}
function getTemp(score: number) {
  if (score >= 80) return { label:"Hot", color:"#f43f5e", bg:"rgba(244,63,94,0.1)" };
  if (score >= 55) return { label:"Warm", color:"#f59e0b", bg:"rgba(245,158,11,0.1)" };
  return { label:"Cold", color:"#6b7280", bg:"rgba(107,114,128,0.1)" };
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"kanban"|"list">("kanban");
  const [stageFilter, setStageFilter] = useState("all");
  const [showBooking, setShowBooking] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [addLoading, setAddLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"profile"|"activity"|"notes">("profile");
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [currentActivities, setCurrentActivities] = useState<LeadActivity[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [sortCol, setSortCol] = useState<"name"|"company"|"stage"|"value"|"score">("score");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: ld } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (ld) setLeads(ld);
      const { data: bd } = await supabase.from("bookings").select("*");
      if (bd) setBookings(bd);
      setLoading(false);
    }
    load();
  }, []);

  function openLead(lead: Lead) {
    setSelectedLead(lead);
    setDetailTab("profile");
    setCurrentTags(getLeadTags(lead.id));
    setCurrentActivities(getLeadActivities(lead.id));
    setNotesValue(lead.notes || "");
    setEditingNotes(false);
    setNewNote("");
  }

  async function updateLeadStatus(id: string, newStatus: string) {
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setLeads(p => p.map(l => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === id) setSelectedLead(p => p ? { ...p, status: newStatus } : null);
      pushActivity(id, { type:"stage_change", text:`Stage changed to ${STAGE_MAP[newStatus] ?? newStatus}`, timestamp: new Date().toISOString() });
      setCurrentActivities(getLeadActivities(id));
    }
  }

  async function saveNotes() {
    if (!selectedLead) return;
    const { error } = await supabase.from("leads").update({ notes: notesValue }).eq("id", selectedLead.id);
    if (!error) {
      setLeads(p => p.map(l => l.id === selectedLead.id ? { ...l, notes: notesValue } : l));
      setSelectedLead(p => p ? { ...p, notes: notesValue } : null);
      setEditingNotes(false);
      pushActivity(selectedLead.id, { type:"note", text:"Notes updated", timestamp: new Date().toISOString() });
      setCurrentActivities(getLeadActivities(selectedLead.id));
    }
  }

  function addNote() {
    if (!selectedLead || !newNote.trim()) return;
    pushActivity(selectedLead.id, { type:"note", text: newNote.trim(), timestamp: new Date().toISOString() });
    setCurrentActivities(getLeadActivities(selectedLead.id));
    setNewNote("");
  }

  function toggleTag(tag: string) {
    if (!selectedLead) return;
    const updated = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
    setCurrentTags(updated);
    saveLeadTags(selectedLead.id, updated);
  }

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    const { data, error } = await supabase.from("leads").insert([{ ...addForm }]).select().single();
    if (!error && data) {
      setLeads(p => [data, ...p]);
      pushActivity(data.id, { type:"created", text:"Lead created", timestamp: new Date().toISOString() });
      setAddForm({ ...EMPTY_FORM });
      setShowAddLead(false);
    }
    setAddLoading(false);
  }

  const filtered = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    const mq = !q || l.first_name.toLowerCase().includes(q) || l.last_name.toLowerCase().includes(q) || (l.company_name||"").toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    const ms = stageFilter === "all" || STAGE_MAP[l.status] === stageFilter;
    return mq && ms;
  });
  const byStage = (s: string) => filtered.filter(l => STAGE_MAP[l.status] === s);

  const sorted = [...filtered].sort((a, b) => {
    const aD = bookings.some(bk => bk.email?.toLowerCase() === a.email.toLowerCase() && bk.status !== "cancelled");
    const bD = bookings.some(bk => bk.email?.toLowerCase() === b.email.toLowerCase() && bk.status !== "cancelled");
    let av: string|number, bv: string|number;
    switch (sortCol) {
      case "name": av=`${a.first_name} ${a.last_name}`; bv=`${b.first_name} ${b.last_name}`; break;
      case "company": av=a.company_name||""; bv=b.company_name||""; break;
      case "stage": av=a.status; bv=b.status; break;
      case "value": av=getDealValue(a.service_interest); bv=getDealValue(b.service_interest); break;
      default: av=calcScore(a,aD); bv=calcScore(b,bD);
    }
    if (typeof av==="string") return sortDir==="asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir==="asc" ? av-(bv as number) : (bv as number)-av;
  });

  const activeLeads = leads.filter(l => l.status!=="won"&&l.status!=="lost");
  const wonLeads = leads.filter(l => l.status==="won");
  const lostLeads = leads.filter(l => l.status==="lost");
  const pipelineValue = activeLeads.reduce((s,l)=>s+getDealValue(l.service_interest),0);
  const wonValue = wonLeads.reduce((s,l)=>s+getDealValue(l.service_interest),0);
  const winRate = wonLeads.length+lostLeads.length>0 ? Math.round((wonLeads.length/(wonLeads.length+lostLeads.length))*100) : 0;
  const demoCount = bookings.filter(b=>b.status==="confirmed"||b.status==="pending").length;

  function SortTh({ col, label }: { col: typeof sortCol; label: string }) {
    const active = sortCol === col;
    return (
      <th onClick={() => { if (active) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortCol(col); setSortDir("desc"); } }}
        style={{ padding:"0.875rem 1rem", textAlign:"left", cursor:"pointer", userSelect:"none", whiteSpace:"nowrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.375rem", fontSize:"0.7rem", fontWeight:800, color:active?"white":"var(--color-neutral-500)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
          {label}{active?(sortDir==="asc"?<ChevronUp size={13}/>:<ChevronDown size={13}/>):<ChevronDown size={13} style={{opacity:0.3}}/>}
        </div>
      </th>
    );
  }

  if (loading) return (
    <div style={{ height:"80vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48}/>
    </div>
  );

  const inp = (extra: object = {}) => ({ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"0.75rem", color:"white", fontSize:"0.9rem", outline:"none", boxSizing:"border-box" as const, width:"100%", ...extra });

  return (
    <div style={{ padding:"2rem", maxWidth:"1600px", margin:"0 auto" }}>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", color:"var(--color-accent-500)", marginBottom:"0.5rem" }}>
            <Activity size={18}/>
            <span style={{ fontSize:"0.75rem", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase" }}>Sales Operations</span>
          </div>
          <h1 style={{ fontSize:"2.25rem", fontWeight:800, color:"white", fontFamily:"Syne, sans-serif" }}>
            Revenue <span className="gradient-text">Command Center</span>
          </h1>
          <p style={{ color:"var(--color-neutral-500)", fontSize:"0.9375rem", marginTop:"0.25rem" }}>Orchestrating high-value lead acquisition and deal acceleration.</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.03)", padding:"0.25rem", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.06)" }}>
            {(["kanban","list"] as const).map(m=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{ padding:"0.5rem", borderRadius:"8px", background:viewMode===m?"rgba(255,255,255,0.07)":"transparent", color:viewMode===m?"white":"var(--color-neutral-500)", border:"none", cursor:"pointer" }}>
                {m==="kanban"?<LayoutGrid size={18}/>:<List size={18}/>}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowAddLead(true)} className="btn-primary" style={{ display:"flex", alignItems:"center", gap:"0.625rem", padding:"0.75rem 1.5rem", borderRadius:"12px" }}>
            <UserPlus size={16}/> Add Lead
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(210px,1fr))", gap:"1.25rem", marginBottom:"2.5rem" }}>
        {[
          { icon:Target, label:"Pipeline Value", value:`$${(pipelineValue/1_000_000).toFixed(1)}M`, sub:`${activeLeads.length} active deals`, color:"#10b981" },
          { icon:DollarSign, label:"Closed Revenue", value:`$${(wonValue/1000).toFixed(0)}k`, sub:`${wonLeads.length} deals won`, color:"#00D4FF" },
          { icon:Calendar, label:"Upcoming Demos", value:String(demoCount), sub:"Confirmed & pending", color:"#A855F7" },
          { icon:TrendingUp, label:"Win Rate", value:`${winRate}%`, sub:`${wonLeads.length}W · ${lostLeads.length}L`, color:"#F59E0B" },
        ].map(kpi=>(
          <div key={kpi.label} className="kpi-card">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
              <div style={{ width:40, height:40, borderRadius:"10px", background:`${kpi.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <kpi.icon size={20} color={kpi.color}/>
              </div>
            </div>
            <div style={{ fontFamily:"Syne, sans-serif", fontSize:"2rem", fontWeight:800, color:"white", lineHeight:1 }}>{kpi.value}</div>
            <div style={{ color:"var(--color-neutral-400)", fontSize:"0.8125rem", marginTop:"0.25rem" }}>{kpi.label}</div>
            <div style={{ color:kpi.color, fontSize:"0.75rem", marginTop:"0.25rem" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── SEARCH + STAGE FILTERS ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.875rem", marginBottom:"1.75rem", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:"1 1 260px", minWidth:180 }}>
          <Search size={16} color="var(--color-neutral-500)" style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)" }}/>
          <input type="text" placeholder="Search leads, companies, emails…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            style={{ width:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"0.8rem 1rem 0.8rem 3rem", color:"white", outline:"none", fontSize:"0.9rem", boxSizing:"border-box" as const }}/>
        </div>
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          {["all",...PIPELINE_STAGES].map(stage=>{
            const active=stageFilter===stage;
            const color=stage==="all"?"#00D4FF":(STAGE_COLORS[stage]||"#6b7280");
            const count=stage==="all"?filtered.length:byStage(stage).length;
            return (
              <button key={stage} onClick={()=>setStageFilter(stage)} style={{ padding:"0.45rem 0.875rem", borderRadius:"20px", fontSize:"0.72rem", fontWeight:800, cursor:"pointer", border:"1px solid", background:active?`${color}18`:"rgba(255,255,255,0.02)", borderColor:active?`${color}55`:"rgba(255,255,255,0.08)", color:active?color:"var(--color-neutral-400)", whiteSpace:"nowrap" as const }}>
                {stage==="all"?"All":stage} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:"2rem" }}>
        <div style={{ minWidth:0 }}>

          {/* KANBAN */}
          {viewMode==="kanban" && (
            <div style={{ display:"flex", gap:"1.25rem", overflowX:"auto", paddingBottom:"1.5rem" }}>
              {PIPELINE_STAGES.map(stage=>{
                const sl=byStage(stage);
                const sv=sl.reduce((s,l)=>s+getDealValue(l.service_interest),0);
                const sc=STAGE_COLORS[stage];
                return (
                  <div key={stage} style={{ flex:"0 0 290px", display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                    <div style={{ padding:"0.75rem 0.875rem", background:"rgba(255,255,255,0.02)", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:sc, boxShadow:`0 0 8px ${sc}80` }}/>
                          <span style={{ fontSize:"0.72rem", fontWeight:800, color:"white", textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>{stage}</span>
                          <span style={{ background:`${sc}22`, color:sc, padding:"0.1rem 0.4rem", borderRadius:"4px", fontSize:"0.62rem", fontWeight:800 }}>{sl.length}</span>
                        </div>
                        <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#10b981" }}>${(sv/1000).toFixed(0)}k</span>
                      </div>
                    </div>
                    {sl.map(lead=>{
                      const lb=bookings.filter(b=>b.email?.toLowerCase()===lead.email.toLowerCase()&&b.status!=="cancelled");
                      const hasDemo=lb.length>0;
                      const upcoming=lb.filter(b=>b.status==="confirmed"||b.status==="pending").sort((a,b)=>new Date(a.scheduled_at).getTime()-new Date(b.scheduled_at).getTime())[0];
                      const score=calcScore(lead,hasDemo);
                      const temp=getTemp(score);
                      const tags=getLeadTags(lead.id);
                      const dv=getDealValue(lead.service_interest);
                      return (
                        <div key={lead.id} className="glass-card crm-card" onClick={()=>openLead(lead)}
                          style={{ padding:"1.25rem", cursor:"pointer", border:"1px solid rgba(255,255,255,0.05)", transition:"all 0.25s", position:"relative", overflow:"hidden" }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${sc}45`;(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.05)";(e.currentTarget as HTMLElement).style.transform="none";}}>
                          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:sc, borderRadius:"12px 0 0 12px", opacity:0.8 }}/>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.25rem" }}>
                            <div style={{ fontSize:"0.9375rem", fontWeight:700, color:"white", paddingLeft:"0.25rem" }}>{lead.first_name} {lead.last_name}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:"0.2rem", color:score>80?"#10b981":score>55?"#f59e0b":"#6b7280" }}>
                              <Star size={11} fill="currentColor"/><span style={{ fontSize:"0.65rem", fontWeight:800 }}>{score}</span>
                            </div>
                          </div>
                          <div style={{ fontSize:"0.78rem", color:"var(--color-neutral-400)", marginBottom:"0.5rem", display:"flex", alignItems:"center", gap:"0.3rem", paddingLeft:"0.25rem" }}>
                            <Building size={11}/>{lead.company_name||"Prospect"}
                          </div>
                          <div style={{ fontSize:"0.875rem", fontWeight:800, color:"#10b981", marginBottom:"0.5rem", paddingLeft:"0.25rem" }}>
                            ${(dv/1000).toFixed(0)}k <span style={{ fontSize:"0.65rem", color:"var(--color-neutral-500)", fontWeight:600 }}>/yr</span>
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem", marginBottom:"0.5rem", paddingLeft:"0.25rem" }}>
                            <span style={{ background:temp.bg, color:temp.color, padding:"0.15rem 0.45rem", borderRadius:"6px", fontSize:"0.58rem", fontWeight:800, display:"flex", alignItems:"center", gap:"0.2rem" }}>
                              <Flame size={9} fill="currentColor"/>{temp.label}
                            </span>
                            {upcoming&&<span style={{ background:"rgba(0,212,255,0.1)", color:"#00d4ff", padding:"0.15rem 0.45rem", borderRadius:"6px", fontSize:"0.58rem", fontWeight:800 }}>DEMO {new Date(upcoming.scheduled_at).toLocaleDateString([],{month:"short",day:"numeric"})}</span>}
                            {!upcoming&&hasDemo&&<span style={{ background:"rgba(168,85,247,0.1)", color:"#a855f7", padding:"0.15rem 0.45rem", borderRadius:"6px", fontSize:"0.58rem", fontWeight:800 }}>DEMO DONE</span>}
                            <span style={{ background:"rgba(255,255,255,0.03)", color:"var(--color-neutral-400)", padding:"0.15rem 0.45rem", borderRadius:"6px", fontSize:"0.58rem", fontWeight:700 }}>{(lead.service_interest||"General").split(" ").slice(0,2).join(" ")}</span>
                            {tags.slice(0,2).map(t=>{const td=PREDEFINED_TAGS.find(x=>x.label===t);return td?<span key={t} style={{background:td.bg,color:td.color,padding:"0.15rem 0.45rem",borderRadius:"6px",fontSize:"0.58rem",fontWeight:800}}>{t}</span>:null;})}
                          </div>
                          <div className="crm-actions" style={{ display:"flex", gap:"0.375rem", marginBottom:"0.5rem", paddingLeft:"0.25rem" }}>
                            <a href={`mailto:${lead.email}`} onClick={e=>e.stopPropagation()} style={{ flex:1, padding:"0.35rem", borderRadius:"7px", background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.15)", color:"#00d4ff", fontSize:"0.6rem", fontWeight:700, textAlign:"center" as const, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.2rem" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>Email
                            </a>
                            <button onClick={e=>{e.stopPropagation();openLead(lead);setTimeout(()=>setShowBooking(true),50);}} style={{ flex:1, padding:"0.35rem", borderRadius:"7px", background:"rgba(168,85,247,0.08)", border:"1px solid rgba(168,85,247,0.15)", color:"#a855f7", fontSize:"0.6rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.2rem" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Demo
                            </button>
                            <button onClick={e=>{e.stopPropagation();openLead(lead);setTimeout(()=>setDetailTab("activity"),50);}} style={{ flex:1, padding:"0.35rem", borderRadius:"7px", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.15)", color:"#10b981", fontSize:"0.6rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.2rem" }}>
                              <FileText size={10}/>Note
                            </button>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:"0.5rem", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
                              <div style={{ width:18, height:18, borderRadius:"50%", background:"var(--color-accent-500)", color:"black", fontSize:"0.5rem", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>{lead.first_name[0]}</div>
                              <span style={{ fontSize:"0.62rem", color:"var(--color-neutral-500)", fontWeight:600 }}>Active</span>
                            </div>
                            <div style={{ color:"var(--color-neutral-600)", fontSize:"0.62rem", display:"flex", alignItems:"center", gap:"0.2rem" }}>
                              <Clock size={9}/>{new Date(lead.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {sl.length===0&&<div style={{ padding:"2rem", textAlign:"center" as const, border:"1px dashed rgba(255,255,255,0.06)", borderRadius:"12px", color:"var(--color-neutral-600)", fontSize:"0.8rem" }}>No leads</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode==="list" && (
            <div className="glass-card" style={{ overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" as const, minWidth:700 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.01)" }}>
                      <SortTh col="name" label="Lead"/>
                      <SortTh col="company" label="Company"/>
                      <SortTh col="stage" label="Stage"/>
                      <SortTh col="value" label="Deal Value"/>
                      <SortTh col="score" label="Score"/>
                      <th style={{ padding:"0.875rem 1rem", fontSize:"0.7rem", fontWeight:800, color:"var(--color-neutral-500)", textTransform:"uppercase" as const, letterSpacing:"0.06em", textAlign:"left" as const }}>Tags</th>
                      <th style={{ padding:"0.875rem 1rem", fontSize:"0.7rem", fontWeight:800, color:"var(--color-neutral-500)", textTransform:"uppercase" as const, letterSpacing:"0.06em", textAlign:"left" as const }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(lead=>{
                      const hD=bookings.some(b=>b.email?.toLowerCase()===lead.email.toLowerCase()&&b.status!=="cancelled");
                      const sc2=calcScore(lead,hD); const temp=getTemp(sc2);
                      const tags=getLeadTags(lead.id);
                      const stgC=STAGE_COLORS[STAGE_MAP[lead.status]]||"#6b7280";
                      return (
                        <tr key={lead.id} onClick={()=>openLead(lead)} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.025)"}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                          <td style={{ padding:"0.875rem 1rem" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                              <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#00d4ff", fontWeight:900, fontSize:"0.75rem", flexShrink:0 }}>{lead.first_name[0]}{lead.last_name[0]}</div>
                              <div>
                                <div style={{ color:"white", fontWeight:700, fontSize:"0.875rem" }}>{lead.first_name} {lead.last_name}</div>
                                <div style={{ color:"var(--color-neutral-500)", fontSize:"0.72rem" }}>{lead.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"0.875rem 1rem", color:"var(--color-neutral-300)", fontSize:"0.875rem" }}>{lead.company_name||"—"}</td>
                          <td style={{ padding:"0.875rem 1rem" }}>
                            <span style={{ background:`${stgC}20`, color:stgC, padding:"0.25rem 0.625rem", borderRadius:"6px", fontSize:"0.68rem", fontWeight:800, whiteSpace:"nowrap" as const }}>{STAGE_MAP[lead.status]}</span>
                          </td>
                          <td style={{ padding:"0.875rem 1rem", color:"#10b981", fontWeight:800, fontSize:"0.875rem" }}>${(getDealValue(lead.service_interest)/1000).toFixed(0)}k</td>
                          <td style={{ padding:"0.875rem 1rem" }}>
                            <span style={{ background:temp.bg, color:temp.color, padding:"0.2rem 0.5rem", borderRadius:"6px", fontSize:"0.65rem", fontWeight:800, display:"inline-flex", alignItems:"center", gap:"0.2rem" }}>
                              <Star size={9} fill="currentColor"/>{sc2}
                            </span>
                          </td>
                          <td style={{ padding:"0.875rem 1rem" }}>
                            <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap" }}>
                              {tags.map(t=>{const td=PREDEFINED_TAGS.find(x=>x.label===t);return td?<span key={t} style={{background:td.bg,color:td.color,padding:"0.15rem 0.4rem",borderRadius:"4px",fontSize:"0.6rem",fontWeight:800}}>{t}</span>:null;})}
                            </div>
                          </td>
                          <td style={{ padding:"0.875rem 1rem" }}>
                            <div style={{ display:"flex", gap:"0.375rem" }} onClick={e=>e.stopPropagation()}>
                              <a href={`mailto:${lead.email}`} style={{ padding:"0.375rem", borderRadius:"7px", background:"rgba(0,212,255,0.08)", color:"#00d4ff", display:"flex", alignItems:"center" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
                              </a>
                              <button onClick={()=>{openLead(lead);setTimeout(()=>setDetailTab("activity"),50);}} style={{ padding:"0.375rem", borderRadius:"7px", background:"rgba(16,185,129,0.08)", color:"#10b981", cursor:"pointer", border:"none", display:"flex", alignItems:"center" }}><FileText size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sorted.length===0&&<tr><td colSpan={7} style={{ padding:"3rem", textAlign:"center" as const, color:"var(--color-neutral-500)", fontSize:"0.875rem" }}>No leads match your current filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
          <div className="glass-card" style={{ padding:"1.5rem" }}>
            <h3 style={{ fontSize:"0.78rem", fontWeight:800, color:"white", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <TrendingUp size={15} color="var(--color-accent-500)"/>Deal Velocity
            </h3>
            {[{label:"Lead to Qualified",val:"2.4d",color:"#00d4ff",pct:60},{label:"Qualified to Proposal",val:"4.1d",color:"#a855f7",pct:75},{label:"Proposal to Close",val:"1.2d",color:"#10b981",pct:45}].map(s=>(
              <div key={s.label} style={{ marginBottom:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.375rem", fontSize:"0.8rem" }}>
                  <span style={{ color:"var(--color-neutral-400)" }}>{s.label}</span><span style={{ color:"white", fontWeight:800 }}>{s.val}</span>
                </div>
                <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:"99px", overflow:"hidden" }}>
                  <div style={{ width:`${s.pct}%`, height:"100%", background:s.color, borderRadius:"99px" }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding:"1.5rem" }}>
            <h3 style={{ fontSize:"0.78rem", fontWeight:800, color:"white", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <BarChart2 size={15} color="var(--color-accent-500)"/>Pipeline Breakdown
            </h3>
            {PIPELINE_STAGES.map(stage=>{
              const sl=byStage(stage);
              const val=sl.reduce((s,l)=>s+getDealValue(l.service_interest),0);
              const c=STAGE_COLORS[stage];
              return (
                <div key={stage} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem", fontSize:"0.8125rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:c }}/>
                    <span style={{ color:"var(--color-neutral-400)" }}>{stage}</span>
                  </div>
                  <div style={{ display:"flex", gap:"0.625rem", alignItems:"center" }}>
                    <span style={{ color:"var(--color-neutral-600)", fontSize:"0.7rem" }}>{sl.length} leads</span>
                    <span style={{ color:"white", fontWeight:800 }}>${(val/1000).toFixed(0)}k</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="glass-card" style={{ padding:"1.5rem", flex:1 }}>
            <h3 style={{ fontSize:"0.78rem", fontWeight:800, color:"white", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"1.25rem" }}>Recent Signals</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
              {leads.slice(0,6).map(lead=>{
                const sc3=STAGE_COLORS[STAGE_MAP[lead.status]]||"#6b7280";
                return (
                  <div key={lead.id} onClick={()=>openLead(lead)} style={{ display:"flex", gap:"0.75rem", cursor:"pointer", padding:"0.5rem", borderRadius:"8px" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.02)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                    <div style={{ width:28, height:28, borderRadius:"8px", background:`${sc3}18`, display:"flex", alignItems:"center", justifyContent:"center", color:sc3, flexShrink:0, fontSize:"0.7rem", fontWeight:900 }}>{lead.first_name[0]}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ color:"white", fontSize:"0.8rem", fontWeight:700, whiteSpace:"nowrap" as const, overflow:"hidden", textOverflow:"ellipsis" }}>{lead.first_name} {lead.last_name}</div>
                      <div style={{ color:"var(--color-neutral-500)", fontSize:"0.7rem" }}>{STAGE_MAP[lead.status]} · {new Date(lead.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── LEAD DETAIL MODAL ── */}
      {selectedLead&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }} onClick={()=>setSelectedLead(null)}>
          <div className="glass-card" style={{ width:"100%", maxWidth:"860px", maxHeight:"92vh", overflowY:"auto", padding:"2.5rem", position:"relative", background:"#060d1d", border:"1px solid rgba(0,212,255,0.2)" }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setSelectedLead(null)} style={{ position:"absolute", top:"1.5rem", right:"1.5rem", background:"rgba(255,255,255,0.05)", border:"none", color:"white", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><X size={18}/></button>
            <div style={{ display:"flex", alignItems:"center", gap:"1.5rem", marginBottom:"1.75rem", flexWrap:"wrap" }}>
              <div style={{ width:60, height:60, borderRadius:"16px", background:"linear-gradient(135deg,rgba(0,212,255,0.2),rgba(168,85,247,0.2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem", fontWeight:900, color:"white", flexShrink:0 }}>
                {selectedLead.first_name[0]}{selectedLead.last_name[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <h2 style={{ fontSize:"1.75rem", fontWeight:800, color:"white", fontFamily:"Syne", lineHeight:1.1 }}>{selectedLead.first_name} {selectedLead.last_name}</h2>
                <div style={{ color:"var(--color-accent-500)", fontWeight:700, display:"flex", alignItems:"center", gap:"0.5rem", marginTop:"0.25rem", fontSize:"0.875rem", flexWrap:"wrap" }}>
                  <Building size={14}/>{selectedLead.company_name||"Prospect"}
                  <span style={{ color:"var(--color-neutral-600)" }}>·</span>
                  <span style={{ color:"#10b981", fontWeight:800 }}>${(getDealValue(selectedLead.service_interest)/1000).toFixed(0)}k/yr</span>
                </div>
              </div>
              <select value={selectedLead.status} onChange={e=>updateLeadStatus(selectedLead.id,e.target.value)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", color:"white", padding:"0.625rem 1rem", borderRadius:"10px", fontSize:"0.875rem", fontWeight:700, outline:"none", cursor:"pointer" }}>
                {Object.entries(STAGE_MAP).map(([val,label])=><option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-500)", textTransform:"uppercase" as const, letterSpacing:"0.07em", marginBottom:"0.625rem", display:"flex", alignItems:"center", gap:"0.375rem" }}>
                <Tag size={11}/>Labels
              </div>
              <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                {PREDEFINED_TAGS.map(tag=>{
                  const active=currentTags.includes(tag.label);
                  return <button key={tag.label} onClick={()=>toggleTag(tag.label)} style={{ padding:"0.3rem 0.75rem", borderRadius:"20px", fontSize:"0.7rem", fontWeight:800, cursor:"pointer", border:"1px solid", background:active?tag.bg:"transparent", borderColor:active?`${tag.color}55`:"rgba(255,255,255,0.1)", color:active?tag.color:"var(--color-neutral-400)" }}>{tag.label}</button>;
                })}
              </div>
            </div>
            <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.08)", marginBottom:"1.5rem" }}>
              {([["profile","Profile"],["activity","Activity"],["notes","Notes"]] as const).map(([tab,label])=>(
                <button key={tab} onClick={()=>setDetailTab(tab)} style={{ padding:"0.75rem 1.25rem", fontSize:"0.78rem", fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.05em", cursor:"pointer", border:"none", background:"transparent", borderBottom:`2px solid ${detailTab===tab?"#00d4ff":"transparent"}`, color:detailTab===tab?"#00d4ff":"var(--color-neutral-500)", marginBottom:"-1px" }}>
                  {label}
                </button>
              ))}
            </div>
            {detailTab==="profile"&&(
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
                <div>
                  <h4 style={{ color:"var(--color-neutral-500)", fontSize:"0.68rem", fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.07em", marginBottom:"1rem" }}>Contact Details</h4>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                    {[{I:Mail,v:selectedLead.email},{I:Phone,v:selectedLead.phone||"Not provided"},{I:Briefcase,v:selectedLead.service_interest||"MSP Services"},{I:Clock,v:`Created ${new Date(selectedLead.created_at).toLocaleDateString()}`}].map(({I,v})=>(
                      <div key={v} style={{ display:"flex", alignItems:"center", gap:"0.875rem", color:"var(--color-neutral-300)", fontSize:"0.875rem" }}>
                        <I size={15} color="var(--color-neutral-600)"/>{v}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ color:"var(--color-neutral-500)", fontSize:"0.68rem", fontWeight:800, textTransform:"uppercase" as const, letterSpacing:"0.07em", marginBottom:"1rem" }}>Lead Intelligence</h4>
                  {(()=>{
                    const hD=bookings.some(b=>b.email?.toLowerCase()===selectedLead.email.toLowerCase()&&b.status!=="cancelled");
                    const sc4=calcScore(selectedLead,hD); const temp=getTemp(sc4);
                    return (
                      <div style={{ background:"rgba(255,255,255,0.02)", padding:"1.25rem", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                          <span style={{ color:"#10b981", fontSize:"1.5rem", fontWeight:800 }}>{sc4}<span style={{ fontSize:"0.8rem", color:"var(--color-neutral-500)" }}>/100</span></span>
                          <span style={{ background:temp.bg, color:temp.color, padding:"0.25rem 0.75rem", borderRadius:"20px", fontSize:"0.68rem", fontWeight:800, display:"flex", alignItems:"center", gap:"0.25rem" }}>
                            <Flame size={11} fill="currentColor"/>{temp.label}
                          </span>
                        </div>
                        <div style={{ color:"var(--color-neutral-400)", fontSize:"0.8rem", lineHeight:1.55 }}>
                          {sc4>=80?"High-intent. Ready for proposal.":sc4>=55?"Engaged — follow up soon.":"Early stage. Continue nurturing."}
                        </div>
                        <div style={{ marginTop:"1rem" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.25rem", fontSize:"0.72rem" }}>
                            <span style={{ color:"var(--color-neutral-500)" }}>Engagement</span>
                            <span style={{ color:"white", fontWeight:700 }}>{sc4}%</span>
                          </div>
                          <div style={{ height:5, background:"rgba(255,255,255,0.05)", borderRadius:"99px", overflow:"hidden" }}>
                            <div style={{ width:`${sc4}%`, height:"100%", background:`linear-gradient(90deg,${temp.color},${temp.color}cc)`, borderRadius:"99px" }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            {detailTab==="activity"&&(
              <div>
                <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.5rem" }}>
                  <input value={newNote} onChange={e=>setNewNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="Log a note, call, or follow-up…" style={{ flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"0.75rem 1rem", color:"white", fontSize:"0.875rem", outline:"none" }}/>
                  <button onClick={addNote} style={{ padding:"0.75rem 1.125rem", borderRadius:"10px", background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.2)", color:"#00d4ff", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.375rem", fontWeight:700, fontSize:"0.8rem" }}>
                    <Send size={14}/>Log
                  </button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem", maxHeight:"340px", overflowY:"auto" }}>
                  {currentActivities.length===0&&<div style={{ textAlign:"center" as const, padding:"2rem", color:"var(--color-neutral-500)", fontSize:"0.875rem" }}>No activity yet.</div>}
                  {currentActivities.map(act=>{
                    const cfg: Record<string,{icon:React.ReactNode;color:string}> = {
                      note:{icon:<MessageSquare size={13}/>,color:"#00d4ff"},
                      stage_change:{icon:<ArrowRight size={13}/>,color:"#a855f7"},
                      demo_scheduled:{icon:<Calendar size={13}/>,color:"#f59e0b"},
                      call:{icon:<Phone size={13}/>,color:"#10b981"},
                      email:{icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>,color:"#00d4ff"},
                      created:{icon:<UserPlus size={13}/>,color:"#10b981"},
                    };
                    const {icon,color}=cfg[act.type]||{icon:<Activity size={13}/>,color:"#6b7280"};
                    return (
                      <div key={act.id} style={{ display:"flex", gap:"0.875rem" }}>
                        <div style={{ width:28, height:28, borderRadius:"8px", background:`${color}18`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{icon}</div>
                        <div>
                          <div style={{ color:"white", fontSize:"0.875rem", fontWeight:600 }}>{act.text}</div>
                          <div style={{ color:"var(--color-neutral-500)", fontSize:"0.72rem", marginTop:"0.125rem" }}>{new Date(act.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {detailTab==="notes"&&(
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.875rem" }}>
                  <span style={{ fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-500)", textTransform:"uppercase" as const, letterSpacing:"0.07em" }}>Internal Notes</span>
                  {!editingNotes
                    ?<button onClick={()=>setEditingNotes(true)} style={{ display:"flex", alignItems:"center", gap:"0.375rem", padding:"0.375rem 0.875rem", borderRadius:"8px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:"0.75rem", fontWeight:700, cursor:"pointer" }}><Edit2 size={12}/>Edit</button>
                    :<button onClick={saveNotes} style={{ display:"flex", alignItems:"center", gap:"0.375rem", padding:"0.375rem 0.875rem", borderRadius:"8px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", color:"#10b981", fontSize:"0.75rem", fontWeight:700, cursor:"pointer" }}><Save size={12}/>Save</button>
                  }
                </div>
                {editingNotes
                  ?<textarea value={notesValue} onChange={e=>setNotesValue(e.target.value)} style={{ width:"100%", minHeight:"200px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:"12px", padding:"1rem", color:"white", fontSize:"0.9rem", outline:"none", resize:"vertical" as const, fontFamily:"inherit", lineHeight:1.6, boxSizing:"border-box" as const }} placeholder="Add internal notes…"/>
                  :<div style={{ minHeight:"120px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"1rem", color:notesValue?"var(--color-neutral-300)":"var(--color-neutral-600)", fontSize:"0.9rem", lineHeight:1.6, whiteSpace:"pre-wrap" as const }}>{notesValue||"No notes yet. Click Edit to add."}</div>
                }
              </div>
            )}
            <div style={{ display:"flex", gap:"0.875rem", paddingTop:"1.5rem", marginTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.07)", flexWrap:"wrap" }}>
              <button style={{ padding:"0.75rem 1.5rem", borderRadius:"10px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontWeight:700, cursor:"pointer", fontSize:"0.875rem" }}>Archive</button>
              <button onClick={()=>setShowBooking(true)} style={{ padding:"0.75rem 1.5rem", borderRadius:"10px", background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.2)", color:"#00d4ff", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.875rem" }}>
                <Calendar size={15}/>Schedule Demo
              </button>
              <button className="btn-primary" style={{ padding:"0.75rem 1.75rem", borderRadius:"10px", fontSize:"0.875rem", marginLeft:"auto" }}>Send Proposal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD LEAD MODAL ── */}
      {showAddLead&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1100, padding:"1rem" }} onClick={()=>setShowAddLead(false)}>
          <div className="glass-card" style={{ width:"100%", maxWidth:"520px", padding:"2.5rem", background:"#060d1d", border:"1px solid rgba(0,212,255,0.2)", position:"relative" }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowAddLead(false)} style={{ position:"absolute", top:"1.5rem", right:"1.5rem", background:"rgba(255,255,255,0.05)", border:"none", color:"white", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><X size={18}/></button>
            <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:"white", fontFamily:"Syne", marginBottom:"0.25rem" }}>Add New Lead</h2>
            <p style={{ color:"var(--color-neutral-500)", fontSize:"0.875rem", marginBottom:"2rem" }}>Create a new opportunity in the pipeline.</p>
            <form onSubmit={handleAddLead} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <div><label style={{ display:"block", fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-400)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"0.5rem" }}>First Name *</label><input required value={addForm.first_name} onChange={e=>setAddForm(f=>({...f,first_name:e.target.value}))} placeholder="John" style={inp()}/></div>
                <div><label style={{ display:"block", fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-400)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"0.5rem" }}>Last Name</label><input value={addForm.last_name} onChange={e=>setAddForm(f=>({...f,last_name:e.target.value}))} placeholder="Carter" style={inp()}/></div>
              </div>
              <div><label style={{ display:"block", fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-400)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"0.5rem" }}>Email *</label><input required type="email" value={addForm.email} onChange={e=>setAddForm(f=>({...f,email:e.target.value}))} placeholder="john@company.com" style={inp()}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <div><label style={{ display:"block", fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-400)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"0.5rem" }}>Company</label><input value={addForm.company_name} onChange={e=>setAddForm(f=>({...f,company_name:e.target.value}))} placeholder="Acme Corp" style={inp()}/></div>
                <div><label style={{ display:"block", fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-400)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"0.5rem" }}>Phone</label><input value={addForm.phone} onChange={e=>setAddForm(f=>({...f,phone:e.target.value}))} placeholder="+1 (868)…" style={inp()}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <div>
                  <label style={{ display:"block", fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-400)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"0.5rem" }}>Service Interest</label>
                  <select value={addForm.service_interest} onChange={e=>setAddForm(f=>({...f,service_interest:e.target.value}))} style={inp({cursor:"pointer",fontSize:"0.875rem"})}>
                    <option value="">Select…</option>{SERVICE_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"0.68rem", fontWeight:800, color:"var(--color-neutral-400)", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:"0.5rem" }}>Pipeline Stage</label>
                  <select value={addForm.status} onChange={e=>setAddForm(f=>({...f,status:e.target.value}))} style={inp({cursor:"pointer",fontSize:"0.875rem"})}>
                    {Object.entries(STAGE_MAP).map(([val,label])=><option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"flex", gap:"1rem", marginTop:"0.5rem" }}>
                <button type="button" onClick={()=>setShowAddLead(false)} style={{ flex:1, padding:"0.875rem", borderRadius:"10px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontWeight:700, cursor:"pointer", fontSize:"0.875rem" }}>Cancel</button>
                <button type="submit" disabled={addLoading} className="btn-primary" style={{ flex:2, padding:"0.875rem", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", fontSize:"0.875rem" }}>
                  {addLoading?<Loader2 size={16} className="animate-spin"/>:<><UserPlus size={16}/>Create Lead</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BookingModal isOpen={showBooking} onClose={()=>setShowBooking(false)}/>
      <style>{`.crm-card .crm-actions{opacity:0;transition:opacity 0.2s;}.crm-card:hover .crm-actions{opacity:1;}`}</style>
    </div>
  );
}
