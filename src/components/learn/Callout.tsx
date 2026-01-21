type Props = Readonly<{
  title?: string;
  variant?: "info" | "warning" | "success";
  children: React.ReactNode;
}>;

function classesForVariant(variant: NonNullable<Props["variant"]>) {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50";
    case "info":
    default:
      return "border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50";
  }
}

export function Callout({ title, variant = "info", children }: Props) {
  return (
    <div className={`rounded-2xl border p-4 ${classesForVariant(variant)}`}>
      {title ? (
        <p className="text-sm font-medium tracking-tight">{title}</p>
      ) : null}
      <div className="mt-2 text-sm leading-7">{children}</div>
    </div>
  );
}


