"use client";
import { useEffect, useRef } from "react";

interface GoogleAdSlotProps {
  slot?: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
}

export default function GoogleAdSlot({
  slot,
  format = "auto",
  responsive = "true",
  style = { display: "block" }
}: GoogleAdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && adRef.current) {
        // Push the ad to the Google adsbygoogle array
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense push error:", err);
    }
  }, [slot]);

  // If slot is provided, render a manual ad unit.
  // Otherwise, render a clean, empty placeholder for Auto Ads to hook into without displaying ugly text.
  if (!slot) {
    return (
      <div 
        className="ad-container-auto" 
        style={{ 
          width: "100%", 
          minHeight: "10px", 
          margin: "1.5rem 0", 
          clear: "both" 
        }} 
      />
    );
  }

  return (
    <div style={{ margin: "2rem 0", textAlign: "center", clear: "both", width: "100%" }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6964785390310012"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
