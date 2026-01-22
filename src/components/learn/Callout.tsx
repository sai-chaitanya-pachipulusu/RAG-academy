type Props = Readonly<{
  title?: string;
  variant?: "info" | "warning" | "success";
  children: React.ReactNode;
}>;

function classesForVariant(variant: NonNullable<Props["variant"]>) {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "info":
    default:
      return "border-zinc-200 bg-white text-zinc-950";
  }
}

export function Callout({ title, variant = "info", children }: Props) {
  return (
    <div className={`rounded-xl border p-3 ${classesForVariant(variant)}`}>
      {title ? (
        <p className="text-sm font-medium tracking-tight">{title}</p>
      ) : null}
      <div className="mt-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}


