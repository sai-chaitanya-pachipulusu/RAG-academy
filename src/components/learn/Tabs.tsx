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
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 p-2 dark:border-gray-800">
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
                  ? "bg-[#7C3AED] text-white dark:bg-white dark:text-black"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900",
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


