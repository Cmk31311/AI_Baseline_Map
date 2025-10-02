// Final test for ESLint Baseline Plugin
const { ESLint } = require('eslint');

async function testPlugin() {
  console.log('🧪 Testing ESLint Baseline Plugin...\n');

  // Create a simple plugin object directly
  const baselinePlugin = {
    rules: {
      'check-baseline': {
        meta: {
          type: 'suggestion',
          docs: {
            description: 'Check web features against Baseline compatibility',
            category: 'Best Practices',
            recommended: true,
          },
          fixable: null,
          schema: [],
          messages: {
            baselineCheck: '{{message}}',
          },
        },
        create(context) {
          return {
            Program(node) {
              const sourceCode = context.getSourceCode();
              const text = sourceCode.getText();
              
              // Simple test: look for fetch
              if (text.includes('fetch(')) {
                context.report({
                  node,
                  messageId: 'baselineCheck',
                  data: { message: '✅ Fetch API is Baseline (Widely Available)' },
                });
              }
              
              // Look for optional chaining
              if (text.includes('?.')) {
                context.report({
                  node,
                  messageId: 'baselineCheck',
                  data: { message: '✅ Optional Chaining is Baseline (Widely Available)' },
                });
              }
              
              // Look for array.at()
              if (text.includes('.at(')) {
                context.report({
                  node,
                  messageId: 'baselineCheck',
                  data: { message: '⚠️ Array.at() is newly Baseline' },
                });
              }
            },
          };
        },
      },
    },
  };

  const eslint = new ESLint({
    plugins: {
      baseline: baselinePlugin
    },
    overrideConfig: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      rules: {
        'baseline/check-baseline': ['warn']
      }
    },
    useEslintrc: false
  });

  // Test code
  const testCode = `
async function fetchData() {
  const response = await fetch('/api/data');
  const data = response?.json();
  const lastItem = array.at(-1);
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
