"use client";
import { useState, useEffect } from "react";
import { X, Search, Copy, Check, Loader2, Image as ImageIcon } from "lucide-react";

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  url: string;
  size?: number;
  mimetype?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  async function fetchMedia() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/media");
      if (!res.ok) {
        throw new Error(`Failed to load media: ${res.statusText}`);
      }
      const data = await res.json();
      setFiles(data || []);
      if (data && data.length > 0) {
        setSelectedFile(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div className="glass-card" style={{
        width: "100%", maxWidth: "900px", height: "80vh", borderRadius: "20px",
        overflow: "hidden", position: "relative", display: "flex", flexDirection: "column",
        border: "1px solid rgba(0,212,255,0.2)", background: "#0d1527"
      }}>
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,212,255,0.02)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ImageIcon size={20} color="var(--color-accent-500)" /> Media Library
          </h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", overflow: "hidden" }} className="media-library-grid">
          
          {/* Main Grid View */}
          <div style={{ display: "flex", flexDirection: "column", padding: "1.5rem", borderRight: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
              <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)" }} size={16} />
              <input 
                type="text" 
                placeholder="Search images by name..."
                className="input-field" 
                style={{ paddingLeft: "2.5rem" }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Grid Container */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "0.5rem" }}>
              {loading ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
                  <Loader2 className="animate-spin" size={32} color="var(--color-accent-500)" />
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>Loading library...</span>
                </div>
              ) : error ? (
                <div style={{ color: "#FF4444", padding: "1rem", textAlign: "center" }}>
                  Error: {error}
                </div>
              ) : filteredFiles.length === 0 ? (
                <div style={{ color: "var(--color-neutral-500)", textAlign: "center", marginTop: "3rem" }}>
                  No assets found in the library. Upload some files first!
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem" }}>
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <div 
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        style={{
                          aspectRatio: "1/1",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: isSelected ? "2px solid var(--color-accent-500)" : "1px solid rgba(255,255,255,0.05)",
                          background: "rgba(255,255,255,0.02)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "border-color 0.2s"
                        }}
                      >
                        <img 
                          src={file.url} 
                          alt={file.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "rgba(0,0,0,0.6)", padding: "0.25rem 0.5rem",
                          fontSize: "0.65rem", color: "var(--color-neutral-300)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                          {file.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", padding: "1.5rem", background: "rgba(255,255,255,0.01)", overflowY: "auto" }}>
            {selectedFile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "100%" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Asset Details
                </h3>

                <div style={{ width: "100%", aspectRatio: "16/10", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name} 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "var(--color-neutral-400)" }}>
                  <div style={{ overflowWrap: "anywhere" }}>
                    <strong style={{ color: "white" }}>Name:</strong> {selectedFile.name}
                  </div>
                  <div>
                    <strong style={{ color: "white" }}>Size:</strong> {formatSize(selectedFile.size)}
                  </div>
                  <div>
                    <strong style={{ color: "white" }}>Uploaded:</strong> {new Date(selectedFile.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "auto" }}>
                  <button 
                    type="button"
                    onClick={() => handleCopy(selectedFile.url, selectedFile.id)}
                    className="btn-secondary"
                    style={{ padding: "0.6rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.8125rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  >
                    {copiedId === selectedFile.id ? (
                      <>
                        <Check size={14} color="var(--color-success)" /> Copied URL!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Image URL
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => onSelect(selectedFile.url)}
                    className="btn-primary"
                    style={{ padding: "0.6rem", borderRadius: "8px", background: "var(--color-accent-600)", border: "none", color: "white", fontWeight: 600, fontSize: "0.8125rem" }}
                  >
                    Select Cover Image
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>
                Select an image to see details
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
