"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Shield, Book, Download, Search, Lock,
  Database, Filter, Plus, X, Loader2
} from "lucide-react";

interface DocumentItem {
  id?: string;
  name: string;
  created_at?: string;
  date?: string; // fallback
  size: string;
  type: string;
  locked: boolean;
}

interface DisplayDocumentItem extends DocumentItem {
  category: string;
  catColor: string;
  catBg: string;
  catBorder: string;
}

const defaultCategories = [
  {
    name: "Service Agreements",
    icon: FileText,
    color: "text-[#00D4FF]",
    bg: "bg-[#00D4FF]/10",
    border: "border-[#00D4FF]/20",
    docs: [
      { name: "Master Service Agreement (MSA)", size: "2.4 MB", type: "PDF", locked: false },
      { name: "Service Level Agreement (SLA)", size: "1.1 MB", type: "PDF", locked: false },
    ],
  },
  {
    name: "Security & Compliance",
    icon: Shield,
    color: "text-[#A855F7]",
    bg: "bg-[#A855F7]/10",
    border: "border-[#A855F7]/20",
    docs: [
      { name: "Compliance Posture Report (HIPAA)", size: "2.9 MB", type: "PDF", locked: false },
      { name: "Penetration Test Results (Confidential)", size: "3.8 MB", type: "PDF", locked: true },
    ],
  },
];

export default function DocumentsPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/portal/documents") {
      router.replace("/portal?view=documents");
    }
  }, [router]);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    size: "1.2 MB",
    type: "PDF",
    locked: false,
  });

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (res.ok && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadForm),
      });

      const data = await res.json();
      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({
          name: "",
          size: "1.2 MB",
          type: "PDF",
          locked: false,
        });
        fetchDocuments();
      } else {
        alert(data.error || "Failed to upload document");
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  // Merge default categories with custom uploaded documents
  const allDocs: DisplayDocumentItem[] = [
    ...documents.map(d => ({
      ...d,
      category: "My Uploaded Vault Documents",
      catColor: "text-[#00E676]",
      catBg: "bg-[#00E676]/10",
      catBorder: "border-[#00E676]/20",
    })),
    ...defaultCategories.flatMap(c =>
      c.docs.map(d => ({
        ...d,
        category: c.name,
        catColor: c.color,
        catBg: c.bg,
        catBorder: c.border,
      }))
    ),
  ];

  const filtered = allDocs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  // Group filtered by category for nice layout
  const categoriesMap: Record<string, typeof allDocs> = {};
  filtered.forEach(doc => {
    if (!categoriesMap[doc.category]) {
      categoriesMap[doc.category] = [];
    }
    categoriesMap[doc.category].push(doc);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
            Document <span className="text-[#00D4FF]">Vault</span>
          </h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Secure repository for contracts, compliance certifications, and enterprise runbooks.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-8 py-4 rounded-2xl bg-white text-[#0A1628] font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
        >
          <Plus size={16} /> Secure Upload
        </button>
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
        {Object.keys(categoriesMap).map(catName => {
          const docs = categoriesMap[catName];
          const firstDoc = docs[0];
          return (
            <div key={catName} className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${firstDoc.catBg} ${firstDoc.catColor} border ${firstDoc.catBorder}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-syne tracking-tight uppercase">{catName}</h2>
                  <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">{docs.length} Active Documents</p>
                </div>
                <div className="flex-1 h-px bg-white/5 ml-4" />
              </div>

              <div className="glass-card rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden p-2">
                {docs.map(doc => (
                  <DocRow key={doc.name} doc={doc} color={doc.catColor} bg={doc.catBg} border={doc.catBorder} />
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <Database size={40} className="mx-auto text-neutral-800" />
            <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-[0.2em]">Zero matches in current index</p>
          </div>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-card relative w-[90%] max-w-md p-8 border border-white/10 rounded-3xl shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-6 top-6 text-neutral-500 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-white font-syne uppercase tracking-tight mb-6">Upload Document</h2>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Document Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. IT Strategy Report Q2"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">File Size</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none"
                    value={uploadForm.size}
                    onChange={(e) => setUploadForm({ ...uploadForm, size: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Format</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none appearance-none cursor-pointer"
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  >
                    <option value="PDF" className="bg-[#0A1628]">PDF</option>
                    <option value="DOCX" className="bg-[#0A1628]">DOCX</option>
                    <option value="XLSX" className="bg-[#0A1628]">XLSX</option>
                    <option value="ZIP" className="bg-[#0A1628]">ZIP</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-xs text-neutral-300 font-medium">Encrypt & Restrict Access</span>
                <input
                  type="checkbox"
                  checked={uploadForm.locked}
                  onChange={(e) => setUploadForm({ ...uploadForm, locked: e.target.checked })}
                  className="w-4 h-4 accent-[#00D4FF] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 text-[#0A1628] font-black text-xs uppercase tracking-[0.2em]"
              >
                {uploading ? "Securing file..." : "Commit Document"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DocRow({ doc, color, bg, border }: { doc: DisplayDocumentItem; color: string; bg: string; border: string }) {
  return (
    <div className="group flex items-center justify-between p-4 hover:bg-white/[0.03] rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/5">
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} border ${border} transition-transform group-hover:scale-110`}>
          {doc.locked ? <Lock size={18} className="text-red-400" /> : <FileText size={18} />}
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-bold tracking-tight truncate ${doc.locked ? "text-neutral-500" : "text-white"}`}>
            {doc.name}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-neutral-600 mt-1">
            <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Just Now"}</span>
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
      </div>
    </div>
  );
}
