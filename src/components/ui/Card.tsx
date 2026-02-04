import Link from "next/link";
import type { ReactNode } from "react";

type BaseProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

const BASE =
  "rounded-xl border border-[var(--border-default)] bg-white p-4 shadow-sm transition-all duration-200 " +
  "hover:border-[var(--border-hover)] hover:shadow-md";

const COMPACT =
  "rounded-lg border border-[var(--border-default)] bg-white p-3 transition-all duration-200";

export function Card({ children, className }: BaseProps) {
  return <div className={[BASE, className ?? ""].join(" ")}>{children}</div>;
}

export function CardCompact({ children, className }: BaseProps) {
  return <div className={[COMPACT, className ?? ""].join(" ")}>{children}</div>;
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
        "block hover:bg-[var(--gray-50)] active:scale-[0.99]",
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
        "block hover:bg-[var(--gray-50)] active:scale-[0.99]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </a>
  );
}


