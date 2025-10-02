// Test file for ESLint Baseline Plugin
async function example() {
  // ✅ Baseline features (should show as safe)
  const response = await fetch('/api');
  const data = response?.json();
  const result = data ?? 'default';
  
  // ⚠️ Newly baseline features (should show warnings)
  const lastItem = array.at(-1);
  const cloned = structuredClone(data);
  
  // ❌ Not baseline features (should show errors)
  const grouped = array.group(item => item.type);
  const mapped = array.groupToMap(item => item.category);
}

// Test class with private fields
class MyClass {
  #privateField = 'secret';
  
  async #privateMethod() {
    return await fetch('/api');
  }
}
