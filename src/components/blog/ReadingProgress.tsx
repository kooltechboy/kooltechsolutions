"use client";
import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setCompletion(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
      }
    };

    window.addEventListener("scroll", updateScrollCompletion);
    return () => window.removeEventListener("scroll", updateScrollCompletion);
  }, []);

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "4px", 
        zIndex: 9999, 
        pointerEvents: "none" 
      }}
    >
      <div 
        style={{ 
          height: "100%", 
          width: `${completion}%`, 
          background: "linear-gradient(90deg, var(--color-accent-600) 0%, var(--color-accent-400) 100%)",
          boxShadow: "0 0 10px rgba(0, 212, 255, 0.4)",
          transition: "width 0.1s ease-out"
        }} 
      />
    </div>
  );
}
