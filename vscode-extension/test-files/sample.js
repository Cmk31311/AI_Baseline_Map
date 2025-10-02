// Test JavaScript features for Baseline Map extension

// Fetch API - hover over 'fetch' to see baseline info
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Async/Await - hover over 'async' or 'await' to see baseline info
async function processData() {
  const data = await fetchData();
  return data;
}

// Optional Chaining - hover over '?.' to see baseline info
function getUserName(user) {
  return user?.profile?.name ?? 'Anonymous';
}

// Nullish Coalescing - hover over '??' to see baseline info
function getDefaultValue(value) {
  return value ?? 'default';
}

// Web Components - hover over 'customElements' to see baseline info
class MyComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<p>Hello, World!</p>';
  }
}

customElements.define('my-component', MyComponent);
