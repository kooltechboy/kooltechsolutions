"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, Link as LinkIcon, X, ImageIcon, Loader2 } from "lucide-react";
import { getFallbackImage } from "@/utils/blog";

interface CoverImageUploaderProps {
  value: string;
  category: string;
  onChange: (url: string) => void;
}

type Tab = "upload" | "url";

export default function CoverImageUploader({
  value,
  category,
  onChange,
}: CoverImageUploaderProps) {
  const [tab, setTab] = useState<Tab>(value && value.startsWith("http") ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewSrc = value || getFallbackImage(category);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      // Client-side pre-checks
      const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!ALLOWED.includes(file.type)) {
        setUploadError("Invalid type. Use JPEG, PNG, WebP, or GIF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File is too large. Maximum size is 5 MB.");
        return;
      }

      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/admin/blog/upload-image", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || "Upload failed");
        }
        onChange(data.url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed. Try again.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div>
      <label
        style={{
          color: "var(--color-neutral-400)",
          fontSize: "0.8125rem",
          display: "block",
          marginBottom: "0.5rem",
        }}
      >
        Cover Image
      </label>

      {/* Tab switcher */}
      <div
        style={{
          display: "inline-flex",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "8px",
          padding: "3px",
          marginBottom: "0.75rem",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {(["upload", "url"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "0.35rem 1rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s",
              background: tab === t ? "rgba(0,212,255,0.15)" : "transparent",
              color: tab === t ? "#00D4FF" : "var(--color-neutral-500)",
            }}
          >
            {t === "upload" ? <Upload size={13} /> : <LinkIcon size={13} />}
            {t === "upload" ? "Upload File" : "Paste URL"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        {/* Main input area */}
        <div style={{ flex: 1 }}>
          {tab === "upload" ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#00D4FF" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: "10px",
                  padding: "1.5rem",
                  textAlign: "center",
                  cursor: uploading ? "default" : "pointer",
                  background: dragOver
                    ? "rgba(0,212,255,0.05)"
                    : "rgba(0,0,0,0.2)",
                  transition: "all 0.2s",
                }}
              >
                {uploading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--color-neutral-400)" }}>
                    <Loader2 size={18} className="animate-spin" />
                    <span style={{ fontSize: "0.875rem" }}>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={28} style={{ color: "var(--color-neutral-600)", marginBottom: "0.5rem" }} />
                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-neutral-400)" }}>
                      Drag & drop an image here, or{" "}
                      <span style={{ color: "#00D4FF", fontWeight: 600 }}>click to browse</span>
                    </p>
                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.72rem", color: "var(--color-neutral-600)" }}>
                      JPEG, PNG, WebP, GIF · Max 5 MB
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Uploaded URL display (read-only) */}
              {value && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(0,230,118,0.06)",
                    border: "1px solid rgba(0,230,118,0.2)",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontSize: "0.72rem",
                      color: "var(--color-neutral-400)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✓ {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-neutral-500)",
                      display: "flex",
                      padding: 0,
                    }}
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <input
              className="input-field"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          )}

          {uploadError && (
            <p
              style={{
                margin: "0.4rem 0 0",
                fontSize: "0.78rem",
                color: "#FF4444",
              }}
            >
              {uploadError}
            </p>
          )}
        </div>

        {/* Live preview thumbnail */}
        <div
          style={{
            width: "80px",
            height: "60px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <img
            src={previewSrc}
            alt="Preview"
            onError={(e) => {
              e.currentTarget.src = getFallbackImage(category);
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}
