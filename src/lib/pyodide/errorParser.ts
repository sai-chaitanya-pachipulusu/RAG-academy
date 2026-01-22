/**
 * Python Error Parser
 * 
 * Parses raw Python traceback into user-friendly error messages.
 */

export interface ParsedError {
  type: string;
  message: string;
  lineNumber: number | null;
  codeSnippet: string | null;
  suggestion: string | null;
  fullTraceback: string;
}

// Common Python error patterns and their friendly explanations
const ERROR_SUGGESTIONS: Record<string, string> = {
  "NameError": "Check your variable names for typos. Make sure you've defined the variable before using it.",
  "TypeError": "This usually means you're using the wrong type of value. Check that function arguments are the correct type.",
  "SyntaxError": "There's a syntax error in your code. Check for missing colons, parentheses, or quotation marks.",
  "IndentationError": "Python uses indentation to define code blocks. Make sure your indentation is consistent (use 4 spaces).",
  "ValueError": "The value you provided is not valid for this operation. Check the input format.",
  "KeyError": "The key doesn't exist in the dictionary. Check that you're using the correct key name.",
  "IndexError": "The index is out of range. Remember that Python lists are 0-indexed.",
  "AttributeError": "The object doesn't have this attribute or method. Check the object type and available methods.",
  "ZeroDivisionError": "You're trying to divide by zero. Add a check to prevent this.",
  "ImportError": "The module couldn't be imported. Make sure it's installed and spelled correctly.",
  "ModuleNotFoundError": "The module doesn't exist. Note: Some Python packages aren't available in the browser.",
  "RecursionError": "Your function is calling itself too many times. Add a proper base case.",
  "AssertionError": "An assertion failed. Your test case didn't pass - check your implementation.",
  "StopIteration": "Iterator exhausted. Make sure you're not calling next() on an empty iterator.",
  "RuntimeError": "Something went wrong during execution. Check your code logic.",
};

// Extract line number from traceback
function extractLineNumber(traceback: string): number | null {
  // Pattern: "line X" in traceback
  const lineMatch = traceback.match(/line (\d+)/i);
  if (lineMatch) {
    return parseInt(lineMatch[1], 10);
  }
  return null;
}

// Extract code snippet from traceback
function extractCodeSnippet(traceback: string): string | null {
  // Tracebacks often show the offending line after the file/line info
  const lines = traceback.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for lines that are indented (typically the code snippet)
    if (line.match(/^\s{4}[^\s]/) && !line.includes("File ") && !line.includes("Traceback")) {
      return line.trim();
    }
  }
  return null;
}

// Extract error type and message
function extractErrorInfo(traceback: string): { type: string; message: string } {
  const lines = traceback.split("\n").filter(l => l.trim());
  
  // The last non-empty line should be the error
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    
    // Pattern: "ErrorType: message" or just "ErrorType"
    const errorMatch = line.match(/^(\w*Error|\w*Exception|AssertionError)(?::\s*(.*))?$/);
    if (errorMatch) {
      return {
        type: errorMatch[1],
        message: errorMatch[2] || "",
      };
    }
  }
  
  return { type: "Error", message: traceback };
}

/**
 * Parse a Python traceback into a user-friendly format
 */
export function parsePythonError(stderr: string): ParsedError {
  if (!stderr || !stderr.trim()) {
    return {
      type: "Error",
      message: "Unknown error occurred",
      lineNumber: null,
      codeSnippet: null,
      suggestion: null,
      fullTraceback: "",
    };
  }

  const { type, message } = extractErrorInfo(stderr);
  const lineNumber = extractLineNumber(stderr);
  const codeSnippet = extractCodeSnippet(stderr);
  const suggestion = ERROR_SUGGESTIONS[type] || null;

  return {
    type,
    message,
    lineNumber,
    codeSnippet,
    suggestion,
    fullTraceback: stderr,
  };
}

/**
 * Format a parsed error into a user-friendly display string
 */
export function formatErrorForDisplay(error: ParsedError): string {
  const parts: string[] = [];

  // Error type and message (main line)
  if (error.message) {
    parts.push(`❌ ${error.type}: ${error.message}`);
  } else {
    parts.push(`❌ ${error.type}`);
  }

  // Line number
  if (error.lineNumber) {
    parts.push(`\n📍 Line ${error.lineNumber}`);
  }

  // Code snippet
  if (error.codeSnippet) {
    parts.push(`\n   → ${error.codeSnippet}`);
  }

  // Suggestion
  if (error.suggestion) {
    parts.push(`\n\n💡 Tip: ${error.suggestion}`);
  }

  return parts.join("");
}

/**
 * Check if string looks like a Python traceback
 */
export function isPythonTraceback(text: string): boolean {
  return text.includes("Traceback (most recent call last)") || 
         /^\w*Error:/m.test(text) ||
         /^\w*Exception:/m.test(text);
}

/**
 * Format test assertion failures more helpfully
 */
export function formatTestFailure(stderr: string): string {
  // Check for assertion errors with comparison
  const assertMatch = stderr.match(/AssertionError:\s*(.+?)(?:\n|$)/);
  if (assertMatch) {
    const assertion = assertMatch[1];
    
    // Pattern: "Expected X, got Y"
    const expectedGot = assertion.match(/Expected\s+(.+?),\s+got\s+(.+)/i);
    if (expectedGot) {
      return `❌ Test Failed: Expected ${expectedGot[1]}, but got ${expectedGot[2]}\n\n💡 Tip: Check your calculation or logic.`;
    }
    
    return `❌ Test Failed: ${assertion}`;
  }
  
  // Generic parsing
  const parsed = parsePythonError(stderr);
  return formatErrorForDisplay(parsed);
}
