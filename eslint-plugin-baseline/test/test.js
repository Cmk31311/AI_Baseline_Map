// Test file for ESLint Baseline Plugin
const { ESLint } = require('eslint');

async function testPlugin() {
  console.log('🧪 Testing ESLint Baseline Plugin...\n');

  const baselinePlugin = require('../lib/index.js');
  
  const eslint = new ESLint({
    plugins: {
      baseline: baselinePlugin.default
    },
    overrideConfig: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      rules: {
        'baseline/check-baseline': ['warn', {
          baselineLevel: 'all',
          includePolyfills: true,
          includeAlternatives: true
        }]
      }
    },
    useEslintrc: false
  });

  // Test JavaScript code with various baseline features
  const jsCode = `
// Baseline features (should show ✅)
async function fetchData() {
  const response = await fetch('/api/data');
  const data = response?.json();
  const result = data ?? 'default';
}

// Newly baseline features (should show ⚠️)
class MyClass {
  #privateField = 'secret';
  
  async #privateMethod() {
    const lastItem = array.at(-1);
    const cloned = structuredClone(data);
    return await fetch('/api');
  }
}

// Not baseline features (should show ❌)
function notBaseline() {
  const grouped = array.group(item => item.type);
  const mapped = array.groupToMap(item => item.category);
}
`;

  try {
    console.log('📝 Testing JavaScript code...');
    const jsResults = await eslint.lintText(jsCode, { filePath: 'test.js' });
    console.log('JavaScript Results:', jsResults[0].messages.length, 'warnings');
    jsResults[0].messages.forEach(msg => {
      console.log(`  ${msg.severity === 1 ? '⚠️' : '❌'} ${msg.message}`);
    });

    console.log('\n✅ Plugin test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ = Baseline (Widely Available)');
    console.log('  ⚠️ = Newly Baseline (Limited Support)');
    console.log('  ❌ = Not Baseline (Needs Polyfill)');
  } catch (error) {
    console.error('❌ Plugin test failed:', error.message);
  }
}

testPlugin();