// Comprehensive test file for Baseline Map Extension
// Hover over the features below to see baseline compatibility info

// CSS Features - hover over these properties
const styles = `
  .container {
    display: grid;              /* Hover over 'grid' */
    grid-template-columns: 1fr 1fr;
    display: flex;              /* Hover over 'flex' */
    justify-content: center;
    container-type: inline-size; /* Hover over 'container-type' */
    grid-template-rows: subgrid; /* Hover over 'subgrid' */
  }
  
  .custom {
    --my-color: red;            /* Hover over '--my-color' */
    color: var(--my-color);     /* Hover over 'var(' */
  }
`;

// JavaScript Features - hover over these
async function testFeatures() {
    // Hover over 'fetch'
    const response = await fetch('/api/data');
    
    // Hover over '?.'
    const data = response?.json();
    
    // Hover over '??'
    const result = data ?? 'default';
    
    // Hover over 'async' and 'await'
    const processedData = await processData(result);
    
    return processedData;
}

// Web Components - hover over 'customElements'
class MyElement extends HTMLElement {
    connectedCallback() {
        customElements.define('my-element', MyElement);
    }
}

// Test different contexts
const cssGrid = 'grid';         // Hover over 'grid' in string
const flexProperty = 'flex';    // Hover over 'flex' in string
const fetchCall = fetch;        // Hover over 'fetch' as identifier
