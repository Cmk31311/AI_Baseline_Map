// Test file to verify hover functionality
async function testFeatures() {
    // Test fetch API
    const response = await fetch('/api/data');
    
    // Test optional chaining
    const data = response?.json();
    
    // Test nullish coalescing
    const result = data ?? 'default';
    
    // Test grid (CSS feature)
    const gridContainer = document.querySelector('.grid');
}

// Test class with async/await
class MyComponent {
    async loadData() {
        return await fetch('/api');
    }
}
