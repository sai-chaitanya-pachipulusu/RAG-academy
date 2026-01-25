export interface ErrorMarker {
  lineNumber: number;
  column?: number;
  endLineNumber?: number;
  endColumn?: number;
  message: string;
  severity: "error" | "warning" | "info";
}
