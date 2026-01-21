"use client";

import { useEffect, useRef, useState } from "react";

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
}>;

export function Reveal({ children, className, delayMs = 0, once = true }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) obs.disconnect();
            return;
          }
        }
        if (!once) setVisible(false);
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      data-reveal
      data-visible={visible ? "true" : "false"}
      style={{ ["--reveal-delay" as never]: `${delayMs}ms` }}
      className={className}
    >
      {children}
    </div>
  );
}


