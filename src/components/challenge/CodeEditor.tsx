"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  /**
   * CSS height for the editor container.
   * Defaults to a responsive height that feels good on desktop without
   * becoming unusable on smaller screens.
   */
  height?: string;
};

function usePrefersDark() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDark(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return dark;
}

export function CodeEditor({
  value,
  onChange,
  height = "clamp(420px, 70vh, 860px)",
}: Props) {
  const prefersDark = usePrefersDark();

  return (
    <div
      className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
      style={{ height }}
    >
      <MonacoEditor
        height="100%"
        defaultLanguage="python"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme={prefersDark ? "vs-dark" : "vs"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderLineHighlight: "all",
          roundedSelection: true,
        }}
      />
    </div>
  );
}


