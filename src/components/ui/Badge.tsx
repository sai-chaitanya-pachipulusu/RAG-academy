import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
  variant?: "default" | "muted" | "accent";
  className?: string;
}>;

export function Badge({ children, variant = "default", className }: Props) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium";
  const styles =
    variant === "accent"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
      : variant === "muted"
        ? "border-zinc-200 bg-white text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300"
        : "border-zinc-200 bg-white text-zinc-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100";

  return <span className={[base, styles, className ?? ""].join(" ")}>{children}</span>;
}


