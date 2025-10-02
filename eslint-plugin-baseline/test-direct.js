const { ESLint } = require('eslint');
const baselinePlugin = require('./lib/index.js');

async function testPlugin() {
  const eslint = new ESLint({
    plugins: {
      'baseline-compatibility': baselinePlugin
    },
    overrideConfig: {
      rules: {
        'baseline-compatibility/check-baseline': ['warn']
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    useEslintrc: false
  });

  const testCode = `
    const data = await fetch("/api");
    const result = data?.property;
    const last = array.at(-1);
    const grouped = array.group(item => item.type);
  `;

  try {
    const results = await eslint.lintText(testCode, { filePath: 'test.js' });
    console.log('Results:', results[0].messages.length, 'warnings');
    results[0].messages.forEach(msg => console.log(msg.message));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPlugin();
