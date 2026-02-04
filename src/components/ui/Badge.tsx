import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
  variant?: "default" | "muted" | "accent" | "outline" | "blue";
  className?: string;
}>;

export function Badge({ children, variant = "default", className }: Props) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-[13px] font-medium transition-colors duration-200";
  const styles =
    variant === "accent"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : variant === "blue"
        ? "border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
        : variant === "muted"
          ? "border-[var(--border-default)] bg-[var(--gray-50)] text-[var(--gray-400)]"
          : variant === "outline"
            ? "border-[var(--border-default)] bg-transparent text-[var(--gray-500)]"
            : "border-[var(--border-default)] bg-white text-[var(--foreground)]";

  return <span className={[base, styles, className ?? ""].join(" ")}>{children}</span>;
}


