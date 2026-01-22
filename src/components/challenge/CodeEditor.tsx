import dynamic from "next/dynamic";

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



export function CodeEditor({
  value,
  onChange,
  height = "clamp(420px, 70vh, 860px)",
}: Props) {


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
        theme="vs"
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


