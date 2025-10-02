// Test file to demonstrate the ESLint Baseline Plugin
// Run: npx eslint test-example.js

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
