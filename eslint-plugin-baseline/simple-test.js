// Simple test file for ESLint Baseline Plugin
const { ESLint } = require('eslint');
const baselinePlugin = require('./lib/index.js');

async function testPlugin() {
  console.log('🧪 Testing ESLint Baseline Plugin...\n');

  console.log('Plugin structure:', Object.keys(baselinePlugin));
  console.log('Plugin rules:', Object.keys(baselinePlugin.plugin.rules));
  console.log('Rule definition:', baselinePlugin.plugin.rules['check-baseline']);
  
  const eslint = new ESLint({
    plugins: {
      baseline: baselinePlugin.plugin
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

  // Test code with various baseline features
  const testCode = `
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
    const results = await eslint.lintText(testCode, { filePath: 'test.js' });
    
    if (results[0].messages.length === 0) {
      console.log('❌ No warnings found - plugin may not be working');
    } else {
      console.log(`✅ Found ${results[0].messages.length} warnings:`);
      results[0].messages.forEach(msg => {
        console.log(`  ${msg.severity === 1 ? '⚠️' : '❌'} ${msg.message}`);
      });
    }

    console.log('\n✅ Plugin test completed!');
  } catch (error) {
    console.error('❌ Plugin test failed:', error.message);
  }
}

testPlugin();
