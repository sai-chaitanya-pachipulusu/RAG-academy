import Link from "next/link";
import type { ReactNode } from "react";

type BaseProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

const BASE =
  "rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-colors " +
  "dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)]";

export function Card({ children, className }: BaseProps) {
  return <div className={[BASE, className ?? ""].join(" ")}>{children}</div>;
}

type CardLinkProps = Readonly<{
  href: string;
  children: ReactNode;
  className?: string;
}>;

export function CardLink({ href, children, className }: CardLinkProps) {
  return (
    <Link
      href={href}
      className={[
        BASE,
        "block hover:bg-zinc-50 dark:hover:bg-white/[0.06]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

type CardExternalLinkProps = Readonly<{
  href: string;
  children: ReactNode;
  className?: string;
}>;

export function CardExternalLink({
  href,
  children,
  className,
}: CardExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={[
        BASE,
        "block hover:bg-zinc-50 dark:hover:bg-white/[0.06]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </a>
  );
}


