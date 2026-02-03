/**
 * Live Announcer Component
 * Announces dynamic content changes to screen readers
 */

"use client";

import { useEffect, useState } from "react";

interface LiveAnnouncerProps {
  message: string;
  priority?: "polite" | "assertive";
  clearAfter?: number;
}

export function LiveAnnouncer({
  message,
  priority = "polite",
  clearAfter = 1000,
}: LiveAnnouncerProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);
    
    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setAnnouncement("");
      }, clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

// Hook for announcing page changes
export function usePageAnnouncer() {
  const [announcement, setAnnouncement] = useState("");

  const announce = (message: string) => {
    setAnnouncement(message);
  };

  return { announcement, announce };
}
