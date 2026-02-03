/**
 * TypeScript Worker
 * 
 * Compiles and executes TypeScript code in the browser using esbuild-wasm.
 * This is a simplified executor that transforms TS to JS and runs it.
 */

let esbuild = null;
let initialized = false;

// Simple console capture
let capturedOutput = [];

function captureConsole() {
  capturedOutput = [];
  const methods = ['log', 'info', 'warn', 'error'];
  
  return {
    log: (...args) => capturedOutput.push(args.map(String).join(' ')),
    info: (...args) => capturedOutput.push(args.map(String).join(' ')),
    warn: (...args) => capturedOutput.push('[WARN] ' + args.map(String).join(' ')),
    error: (...args) => capturedOutput.push('[ERROR] ' + args.map(String).join(' ')),
  };
}

async function initEsbuild() {
  if (initialized) return;
  
  try {
    // Dynamic import of esbuild-wasm
    const esbuildModule = await import('https://esm.sh/esbuild-wasm@0.20.0');
    esbuild = esbuildModule;
    
    await esbuild.initialize({
      wasmURL: 'https://esm.sh/esbuild-wasm@0.20.0/esbuild.wasm',
    });
    
    initialized = true;
  } catch (err) {
    console.error('Failed to initialize esbuild:', err);
    throw err;
  }
}

async function compileTypeScript(code) {
  await initEsbuild();
  
  try {
    const result = await esbuild.transform(code, {
      loader: 'ts',
      target: 'es2020',
      format: 'iife',
    });
    
    return { code: result.code, errors: [] };
  } catch (err) {
    // Enhanced error extraction for compilation errors
    const errorInfo = {
      message: err.message || String(err),
      location: null,
      stack: err.stack || null,
    };
    
    // Try to extract location info from esbuild errors
    if (err.errors && err.errors.length > 0) {
      const firstError = err.errors[0];
      if (firstError.location) {
        errorInfo.location = {
          line: firstError.location.line,
          column: firstError.location.column,
          lineText: firstError.location.lineText,
        };
      }
      errorInfo.message = firstError.text || errorInfo.message;
    }
    
    throw errorInfo;
  }
}

async function executeCode(jsCode, mockConsole) {
  // Create a sandboxed execution environment
  const sandbox = {
    console: mockConsole,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Math: Math,
    Date: Date,
    JSON: JSON,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Map: Map,
    Set: Set,
    Promise: Promise,
    // RAG-specific utilities
    cosineSimilarity: (a, b) => {
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    },
  };
  
  // Wrap code to capture return value
  const wrappedCode = `
    (function(console, setTimeout, clearTimeout, setInterval, clearInterval, 
              Math, Date, JSON, Array, Object, String, Number, Boolean, Map, Set, Promise,
              cosineSimilarity) {
      ${jsCode}
    })(console, setTimeout, clearTimeout, setInterval, clearInterval,
       Math, Date, JSON, Array, Object, String, Number, Boolean, Map, Set, Promise,
       cosineSimilarity);
  `;
  
  // Execute with bound sandbox
  const fn = new Function(...Object.keys(sandbox), wrappedCode);
  return fn(...Object.values(sandbox));
}

/**
 * Enhanced error formatter that extracts detailed error information
 */
function formatError(error, isCompilation = false) {
  if (typeof error === 'string') {
    return { message: error, type: 'Error', line: null, column: null };
  }
  
  const errorObj = {
    message: error.message || String(error),
    type: error.name || 'Error',
    line: null,
    column: null,
    stack: error.stack || null,
    isCompilation: isCompilation,
  };
  
  // Extract line/column from location if available
  if (error.location) {
    errorObj.line = error.location.line;
    errorObj.column = error.location.column;
    if (error.location.lineText) {
      errorObj.codeSnippet = error.location.lineText;
    }
  }
  
  // Try to parse stack trace for runtime errors
  if (error.stack && !isCompilation) {
    const lines = error.stack.split('\n');
    for (const line of lines) {
      // Look for patterns like "at eval (line X:Y)" or "at <anonymous>:X:Y"
      const match = line.match(/:(\d+):(\d+)\)?/);
      if (match && !errorObj.line) {
        errorObj.line = parseInt(match[1], 10);
        errorObj.column = parseInt(match[2], 10);
        break;
      }
    }
  }
  
  return errorObj;
}

async function runCode(userCode) {
  const mockConsole = captureConsole();
  const startTime = performance.now();
  
  try {
    const compileResult = await compileTypeScript(userCode);
    await executeCode(compileResult.code, mockConsole);
    
    const durationMs = Math.round(performance.now() - startTime);
    
    return {
      ok: true,
      stdout: capturedOutput.join('\n'),
      durationMs,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    const formattedError = formatError(err, true);
    
    return {
      ok: false,
      stdout: capturedOutput.join('\n'),
      stderr: formattedError.message,
      error: formattedError.message,
      errorDetails: formattedError,
      durationMs,
    };
  }
}

async function testCode(userCode, testCode, dataset) {
  const mockConsole = captureConsole();
  const startTime = performance.now();
  
  try {
    // Compile user code and test code together
    const combinedCode = `
      ${userCode}
      
      // Test harness
      const __testResults = { passed: 0, failed: 0, errors: [] };
      
      function expect(actual) {
        return {
          toBe(expected) {
            if (actual === expected) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              const errorMsg = 'Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual);
              __testResults.errors.push({
                message: errorMsg,
                expected: expected,
                actual: actual,
                operator: 'toBe'
              });
            }
          },
          toEqual(expected) {
            const eq = JSON.stringify(actual) === JSON.stringify(expected);
            if (eq) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              const errorMsg = 'Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual);
              __testResults.errors.push({
                message: errorMsg,
                expected: expected,
                actual: actual,
                operator: 'toEqual'
              });
            }
          },
          toBeGreaterThan(expected) {
            if (actual > expected) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              const errorMsg = 'Expected ' + JSON.stringify(actual) + ' to be greater than ' + JSON.stringify(expected);
              __testResults.errors.push({
                message: errorMsg,
                expected: expected,
                actual: actual,
                operator: 'toBeGreaterThan'
              });
            }
          },
          toBeLessThan(expected) {
            if (actual < expected) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              const errorMsg = 'Expected ' + JSON.stringify(actual) + ' to be less than ' + JSON.stringify(expected);
              __testResults.errors.push({
                message: errorMsg,
                expected: expected,
                actual: actual,
                operator: 'toBeLessThan'
              });
            }
          },
          toBeTruthy() {
            if (actual) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              const errorMsg = 'Expected truthy value, got ' + JSON.stringify(actual);
              __testResults.errors.push({
                message: errorMsg,
                expected: true,
                actual: actual,
                operator: 'toBeTruthy'
              });
            }
          },
          toBeFalsy() {
            if (!actual) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              const errorMsg = 'Expected falsy value, got ' + JSON.stringify(actual);
              __testResults.errors.push({
                message: errorMsg,
                expected: false,
                actual: actual,
                operator: 'toBeFalsy'
              });
            }
          },
          toContain(item) {
            const hasItem = Array.isArray(actual) ? actual.includes(item) : actual.indexOf(item) !== -1;
            if (hasItem) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              const errorMsg = 'Expected ' + JSON.stringify(actual) + ' to contain ' + JSON.stringify(item);
              __testResults.errors.push({
                message: errorMsg,
                expected: item,
                actual: actual,
                operator: 'toContain'
              });
            }
          },
        };
      }
      
      function test(name, fn) {
        try {
          fn();
          console.log('✓ ' + name);
        } catch (err) {
          __testResults.failed++;
          const errorInfo = {
            message: err.message || String(err),
            testName: name,
            stack: err.stack
          };
          __testResults.errors.push(errorInfo);
          console.log('✗ ' + name + ': ' + err.message);
        }
      }
      
      // Dataset injection
      const __dataset = ${JSON.stringify(dataset || null)};
      
      // Run tests
      ${testCode}
      
      // Report results
      console.log('\\nResults: ' + __testResults.passed + ' passed, ' + __testResults.failed + ' failed');
      __testResults.errors.forEach(e => console.log('  - ' + e.message));
      
      // Return results for scoring
      __testResults;
    `;
    
    const compileResult = await compileTypeScript(combinedCode);
    const results = await executeCode(compileResult.code, mockConsole);
    
    const durationMs = Math.round(performance.now() - startTime);
    const passed = results?.passed || 0;
    const failed = results?.failed || 0;
    const total = passed + failed;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    // Build detailed error message if tests failed
    let errorMessage = null;
    if (failed > 0 && results?.errors?.length > 0) {
      const errorDetails = results.errors.map(e => {
        if (typeof e === 'string') return e;
        return e.message || String(e);
      }).join('\n');
      errorMessage = 'Test failures:\n' + errorDetails;
    }
    
    return {
      ok: failed === 0 && passed > 0,
      stdout: capturedOutput.join('\n'),
      stderr: errorMessage,
      error: errorMessage,
      durationMs,
      score,
      metrics: {
        passed,
        failed,
        total,
      },
      testDetails: results?.errors || [],
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    const formattedError = formatError(err, false);
    
    return {
      ok: false,
      stdout: capturedOutput.join('\n'),
      stderr: formattedError.message,
      error: formattedError.message,
      errorDetails: formattedError,
      durationMs,
      score: 0,
      metrics: {
        passed: 0,
        failed: 1,
        total: 1,
      },
    };
  }
}

// Message handler
self.onmessage = async (event) => {
  const { id, mode, userCode, testCode, dataset } = event.data;
  
  let result;
  try {
    if (mode === 'run') {
      result = await runCode(userCode);
    } else if (mode === 'test') {
      result = await testCode(userCode, testCode, dataset);
    } else {
      result = { ok: false, stdout: '', error: 'Unknown mode: ' + mode };
    }
  } catch (err) {
    const formattedError = formatError(err, false);
    result = { 
      ok: false, 
      stdout: '', 
      error: formattedError.message,
      errorDetails: formattedError
    };
  }
  
  self.postMessage({ id, ...result });
};

// Initialize on load
initEsbuild().catch(err => {
  console.error('Failed to initialize TypeScript worker:', err);
});
