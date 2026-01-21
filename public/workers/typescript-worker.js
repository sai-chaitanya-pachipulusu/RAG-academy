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
  
  const result = await esbuild.transform(code, {
    loader: 'ts',
    target: 'es2020',
    format: 'iife',
  });
  
  return result.code;
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

async function runCode(userCode) {
  const mockConsole = captureConsole();
  const startTime = performance.now();
  
  try {
    const jsCode = await compileTypeScript(userCode);
    await executeCode(jsCode, mockConsole);
    
    const durationMs = Math.round(performance.now() - startTime);
    
    return {
      ok: true,
      stdout: capturedOutput.join('\n'),
      durationMs,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      stdout: capturedOutput.join('\n'),
      stderr: err.message || String(err),
      error: err.message || String(err),
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
              __testResults.errors.push(\`Expected \${expected}, got \${actual}\`);
            }
          },
          toEqual(expected) {
            const eq = JSON.stringify(actual) === JSON.stringify(expected);
            if (eq) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              __testResults.errors.push(\`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
            }
          },
          toBeGreaterThan(expected) {
            if (actual > expected) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              __testResults.errors.push(\`Expected \${actual} to be greater than \${expected}\`);
            }
          },
          toBeLessThan(expected) {
            if (actual < expected) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              __testResults.errors.push(\`Expected \${actual} to be less than \${expected}\`);
            }
          },
          toBeTruthy() {
            if (actual) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              __testResults.errors.push(\`Expected truthy, got \${actual}\`);
            }
          },
          toBeFalsy() {
            if (!actual) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              __testResults.errors.push(\`Expected falsy, got \${actual}\`);
            }
          },
          toContain(item) {
            if (Array.isArray(actual) ? actual.includes(item) : actual.indexOf(item) !== -1) {
              __testResults.passed++;
            } else {
              __testResults.failed++;
              __testResults.errors.push(\`Expected \${JSON.stringify(actual)} to contain \${item}\`);
            }
          },
        };
      }
      
      function test(name, fn) {
        try {
          fn();
          console.log(\`✓ \${name}\`);
        } catch (err) {
          __testResults.failed++;
          __testResults.errors.push(\`\${name}: \${err.message}\`);
          console.log(\`✗ \${name}: \${err.message}\`);
        }
      }
      
      // Dataset injection
      const __dataset = ${JSON.stringify(dataset || null)};
      
      // Run tests
      ${testCode}
      
      // Report results
      console.log(\`\\nResults: \${__testResults.passed} passed, \${__testResults.failed} failed\`);
      __testResults.errors.forEach(e => console.log(\`  - \${e}\`));
      
      // Return results for scoring
      __testResults;
    `;
    
    const jsCode = await compileTypeScript(combinedCode);
    const results = await executeCode(jsCode, mockConsole);
    
    const durationMs = Math.round(performance.now() - startTime);
    const passed = results?.passed || 0;
    const failed = results?.failed || 0;
    const total = passed + failed;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return {
      ok: failed === 0 && passed > 0,
      stdout: capturedOutput.join('\n'),
      durationMs,
      score,
      metrics: {
        passed,
        failed,
        total,
      },
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      stdout: capturedOutput.join('\n'),
      stderr: err.message || String(err),
      error: err.message || String(err),
      durationMs,
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
      result = { ok: false, stdout: '', error: `Unknown mode: ${mode}` };
    }
  } catch (err) {
    result = { ok: false, stdout: '', error: err.message || String(err) };
  }
  
  self.postMessage({ id, ...result });
};

// Initialize on load
initEsbuild().catch(err => {
  console.error('Failed to initialize TypeScript worker:', err);
});
