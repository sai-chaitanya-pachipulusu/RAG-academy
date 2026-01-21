"use client";

import { Children, isValidElement, useMemo, useState } from "react";

type TabProps = Readonly<{
  label: string;
  children: React.ReactNode;
}>;

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

export function Tabs({ children }: Readonly<{ children: React.ReactNode }>) {
  const tabs = useMemo(() => {
    const list: Array<{ label: string; node: React.ReactNode }> = [];
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      if (child.type !== Tab) return;
      const props = child.props as TabProps;
      list.push({ label: props.label, node: props.children });
    });
    return list;
  }, [children]);

  const [active, setActive] = useState(0);

  if (tabs.length === 0) return null;
  const safeActive = Math.min(Math.max(active, 0), tabs.length - 1);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
        {tabs.map((t, idx) => {
          const on = idx === safeActive;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setActive(idx)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                on
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">{tabs[safeActive]?.node}</div>
    </div>
  );
}


