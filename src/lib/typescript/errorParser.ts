/**
 * TypeScript Error Parser
 * 
 * Parses TypeScript/JavaScript errors into user-friendly messages.
 * Similar to errorParser.ts for Python but for TypeScript execution errors.
 */

export interface ParsedTypeScriptError {
  type: string;
  message: string;
  lineNumber: number | null;
  columnNumber: number | null;
  codeSnippet: string | null;
  suggestion: string | null;
  fullError: string;
  stackTrace: string | null;
  isCompilationError: boolean;
  isRuntimeError: boolean;
  isTestFailure: boolean;
}

// Common TypeScript/JS error patterns and friendly explanations
const ERROR_SUGGESTIONS: Record<string, string> = {
  "ReferenceError": "You're trying to use a variable that doesn't exist. Check for typos or make sure the variable is declared before using it.",
  "TypeError": "This usually means you're calling a method on the wrong type, or passing the wrong type to a function. Check your types and method calls.",
  "SyntaxError": "There's a syntax problem in your code. Check for missing braces, parentheses, semicolons, or typos in keywords.",
  "RangeError": "A value is out of its valid range. This often happens with invalid array lengths or recursive call stack overflow.",
  "EvalError": "There's a problem with the eval() function. This is rare in modern JavaScript.",
  "URIError": "There's a problem encoding or decoding a URI. Check your encodeURI/decodeURI calls.",
  "CompileError": "The TypeScript compiler encountered an error. Check your type annotations and syntax.",
  "Module not found": "The import statement couldn't find the specified module. Check the module path and ensure it's correctly spelled.",
  "Property does not exist": "You're trying to access a property that TypeScript doesn't recognize. Check property names and type definitions.",
  "Argument of type": "Type mismatch in function arguments. Check that you're passing values of the expected type.",
};

// Test failure patterns
const TEST_ERROR_PATTERNS = [
  {
    pattern: /Expected\s+(.+?),\s+got\s+(.+)/i,
    formatter: (matches: RegExpMatchArray) => ({
      isTestFailure: true,
      message: `Expected ${matches[1]}, but received ${matches[2]}`,
      suggestion: "The actual output doesn't match the expected value. Check your implementation logic.",
    }),
  },
  {
    pattern: /Expected\s+(.+?)\s+to\s+be\s+(.+)/i,
    formatter: (matches: RegExpMatchArray) => ({
      isTestFailure: true,
      message: `Expected value to be ${matches[2]}, but got ${matches[1]}`,
      suggestion: "Your result doesn't match the expected value. Double-check your calculations or logic.",
    }),
  },
  {
    pattern: /expected\s+(.+?)\s+but\s+got\s+(.+)/i,
    formatter: (matches: RegExpMatchArray) => ({
      isTestFailure: true,
      message: `Expected ${matches[1]}, but received ${matches[2]}`,
      suggestion: "Review your implementation - the output differs from what's expected.",
    }),
  },
];

/**
 * Extract line and column numbers from error stack trace or message
 */
function extractLocation(error: string): { lineNumber: number | null; columnNumber: number | null } {
  // Pattern 1: "at line X:Y" (esbuild format)
  const esbuildMatch = error.match(/line\s+(\d+)(?::(\d+))?/i);
  if (esbuildMatch) {
    return {
      lineNumber: parseInt(esbuildMatch[1], 10),
      columnNumber: esbuildMatch[2] ? parseInt(esbuildMatch[2], 10) : null,
    };
  }

  // Pattern 2: "> X |" (code frame format)
  const codeFrameMatch = error.match(/^\s*>?\s*(\d+)\s*[│|]/m);
  if (codeFrameMatch) {
    return {
      lineNumber: parseInt(codeFrameMatch[1], 10),
      columnNumber: null,
    };
  }

  // Pattern 3: ":X:Y" in file path (standard source map format)
  const sourceMapMatch = error.match(/:(\d+):(\d+)\)?$/m);
  if (sourceMapMatch) {
    return {
      lineNumber: parseInt(sourceMapMatch[1], 10),
      columnNumber: parseInt(sourceMapMatch[2], 10),
    };
  }

  // Pattern 4: "line X" anywhere
  const lineMatch = error.match(/line\s+(\d+)/i);
  if (lineMatch) {
    return {
      lineNumber: parseInt(lineMatch[1], 10),
      columnNumber: null,
    };
  }

  return { lineNumber: null, columnNumber: null };
}

/**
 * Extract error type from error message
 */
function extractErrorType(error: string): { type: string; message: string; isCompilationError: boolean } {
  // Compilation errors (from esbuild)
  const compileMatch = error.match(/^(?:✖\s*)?(error|warning):\s*(.+?)(?:\n|$)/i);
  if (compileMatch) {
    return {
      type: "CompileError",
      message: compileMatch[2].trim(),
      isCompilationError: true,
    };
  }

  // Runtime errors (standard JS Error types)
  const runtimeMatch = error.match(/^(\w+Error):\s*(.+?)(?:\n|$)/);
  if (runtimeMatch) {
    return {
      type: runtimeMatch[1],
      message: runtimeMatch[2].trim(),
      isCompilationError: false,
    };
  }

  // Check for specific error patterns
  if (error.includes("Module not found")) {
    return {
      type: "ModuleNotFoundError",
      message: error.split("\n")[0],
      isCompilationError: true,
    };
  }

  if (error.includes("Property") && error.includes("does not exist")) {
    return {
      type: "PropertyNotFoundError", 
      message: error.split("\n")[0],
      isCompilationError: true,
    };
  }

  if (error.includes("Argument of type")) {
    return {
      type: "TypeMismatchError",
      message: error.split("\n")[0],
      isCompilationError: true,
    };
  }

  // Default
  const lines = error.split("\n").filter(l => l.trim());
  return {
    type: "Error",
    message: lines[0] || "An error occurred",
    isCompilationError: false,
  };
}

/**
 * Extract code snippet from error message
 */
function extractCodeSnippet(error: string, lineNumber: number | null): string | null {
  const lines = error.split("\n");
  
  // Look for code marker lines (often indicated by "│" or "|" in code frames)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Code frame format: "  5 │ const x = 1;"
    const codeFrameMatch = line.match(/^\s*\d+\s*[│|]\s*(.+)$/);
    if (codeFrameMatch) {
      return codeFrameMatch[1].trim();
    }
    
    // Pointer format: "    ^"
    if (i > 0 && line.match(/^\s*\^+\s*$/)) {
      const prevLine = lines[i - 1];
      if (prevLine) return prevLine.trim();
    }
  }

  // If we have a line number, try to find that line in the error
  if (lineNumber) {
    for (const line of lines) {
      const markerMatch = line.match(new RegExp(`^\\s*${lineNumber}\\s*[│|]\\s*(.+)$`));
      if (markerMatch) {
        return markerMatch[1].trim();
      }
    }
  }

  return null;
}

/**
 * Check if error is a test failure
 */
function detectTestFailure(error: string): { isTestFailure: boolean; message?: string; suggestion?: string } {
  for (const pattern of TEST_ERROR_PATTERNS) {
    const match = error.match(pattern.pattern);
    if (match) {
      const result = pattern.formatter(match);
      return {
        isTestFailure: true,
        message: result.message,
        suggestion: result.suggestion,
      };
    }
  }

  // Check for assertion-related terms
  const assertionTerms = ["assertion", "expected", "to be", "to equal", "to contain", "failed"];
  const isAssertion = assertionTerms.some(term => error.toLowerCase().includes(term));
  
  if (isAssertion) {
    return {
      isTestFailure: true,
      message: "Test assertion failed",
      suggestion: "Your code output doesn't match the expected result. Review the test requirements.",
    };
  }

  return { isTestFailure: false };
}

/**
 * Get suggestion for error type
 */
function getSuggestion(errorType: string, message: string): string | null {
  // Check exact matches first
  if (ERROR_SUGGESTIONS[errorType]) {
    return ERROR_SUGGESTIONS[errorType];
  }

  // Check partial matches in message
  for (const [key, suggestion] of Object.entries(ERROR_SUGGESTIONS)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return suggestion;
    }
  }

  // Default suggestions based on error type
  switch (errorType) {
    case "ReferenceError":
      return "Check that all variables are declared before use. Look for typos in variable names.";
    case "TypeError":
      return "Make sure you're using the correct types. Check function arguments and method calls.";
    case "SyntaxError":
      return "Review your code for syntax mistakes like missing brackets, parentheses, or semicolons.";
    case "CompileError":
      return "TypeScript found an issue. Check type annotations and ensure all imports are correct.";
    case "RangeError":
      return "A value is out of valid range. Check array lengths, recursion depth, or numeric values.";
    default:
      return "Review your code carefully. If stuck, try using the hints or checking the documentation.";
  }
}

/**
 * Parse a TypeScript/JavaScript error into a user-friendly format
 */
export function parseTypeScriptError(error: string): ParsedTypeScriptError {
  if (!error || !error.trim()) {
    return {
      type: "Error",
      message: "An unknown error occurred",
      lineNumber: null,
      columnNumber: null,
      codeSnippet: null,
      suggestion: null,
      fullError: "",
      stackTrace: null,
      isCompilationError: false,
      isRuntimeError: false,
      isTestFailure: false,
    };
  }

  const { type, message, isCompilationError } = extractErrorType(error);
  const { lineNumber, columnNumber } = extractLocation(error);
  const codeSnippet = extractCodeSnippet(error, lineNumber);
  const testFailureInfo = detectTestFailure(error);
  
  // Get suggestion based on context
  let suggestion: string | null = null;
  if (testFailureInfo.isTestFailure && testFailureInfo.suggestion) {
    suggestion = testFailureInfo.suggestion;
  } else {
    suggestion = getSuggestion(type, message);
  }

  // Extract stack trace (lines after the error message)
  const lines = error.split("\n");
  let stackStartIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^(\w+Error|error):/i)) {
      stackStartIndex = i + 1;
      break;
    }
  }
  const stackTrace = lines.slice(stackStartIndex).join("\n").trim() || null;

  return {
    type,
    message: testFailureInfo.message || message,
    lineNumber,
    columnNumber,
    codeSnippet,
    suggestion,
    fullError: error,
    stackTrace,
    isCompilationError,
    isRuntimeError: !isCompilationError && !testFailureInfo.isTestFailure,
    isTestFailure: testFailureInfo.isTestFailure,
  };
}

/**
 * Format a parsed TypeScript error into a user-friendly display string
 */
export function formatTypeScriptErrorForDisplay(error: ParsedTypeScriptError): string {
  const parts: string[] = [];

  // Error header with type and icon
  const icon = error.isTestFailure ? "🧪" : error.isCompilationError ? "⚠️" : "❌";
  parts.push(`${icon} ${error.type}: ${error.message}`);

  // Location
  if (error.lineNumber) {
    let location = `📍 Line ${error.lineNumber}`;
    if (error.columnNumber) {
      location += `, Column ${error.columnNumber}`;
    }
    parts.push(location);
  }

  // Code snippet
  if (error.codeSnippet) {
    parts.push(`   → ${error.codeSnippet}`);
  }

  // Suggestion
  if (error.suggestion) {
    parts.push(`\n💡 ${error.suggestion}`);
  }

  return parts.join("\n");
}

/**
 * Check if string looks like a TypeScript/JavaScript error
 */
export function isTypeScriptError(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  
  // Common error indicators
  const errorIndicators = [
    /\w+Error:/,                      // ReferenceError:, TypeError:, etc.
    /^error:/i,                       // esbuild compilation errors
    /SyntaxError/,                    // Syntax errors
    /ReferenceError/,                 // Reference errors
    /TypeError/,                      // Type errors
    /Expected.*got/i,                 // Test failures
    /assertion.*failed/i,             // Assertion failures
    /module.*not.*found/i,            // Module resolution errors
    /property.*does not exist/i,      // TS property errors
    /argument of type/i,              // TS type errors
    /cannot find name/i,              // TS name resolution
  ];

  return errorIndicators.some(pattern => pattern.test(text));
}

/**
 * Format test failure output with more detail
 */
export function formatTypeScriptTestFailure(stderr: string): string {
  const parsed = parseTypeScriptError(stderr);
  
  if (parsed.isTestFailure) {
    return formatTypeScriptErrorForDisplay(parsed);
  }

  // If not detected as test failure, check for assertion patterns
  const lines = stderr.split("\n");
  const failureLines: string[] = [];
  
  for (const line of lines) {
    // Look for lines that indicate test failures
    if (line.match(/✗|✖|failed|FAIL/i) || line.includes("Expected")) {
      failureLines.push(line.trim());
    }
  }

  if (failureLines.length > 0) {
    return `🧪 Test Failure\n\n${failureLines.join("\n")}\n\n💡 Check your implementation against the test requirements.`;
  }

  // Fall back to standard formatting
  return formatTypeScriptErrorForDisplay(parsed);
}

/**
 * Extract actionable information from raw error for UI display
 */
export function extractErrorSummary(error: string): {
  title: string;
  summary: string;
  lineNumber: number | null;
  hasFix: boolean;
} {
  const parsed = parseTypeScriptError(error);
  
  return {
    title: `${parsed.type}`,
    summary: parsed.message,
    lineNumber: parsed.lineNumber,
    hasFix: !!parsed.suggestion,
  };
}
