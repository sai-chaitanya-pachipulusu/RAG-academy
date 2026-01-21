export function deepClone<T>(value: T): T {
  // structuredClone is supported in modern browsers; provide a safe fallback.
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}


