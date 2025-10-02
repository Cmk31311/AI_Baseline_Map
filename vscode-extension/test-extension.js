// Simple test to verify the extension works
const path = require('path');

console.log('Testing VS Code extension...');

// Test if we can load the extension
try {
    const extensionPath = path.join(__dirname, 'out', 'extension.js');
    console.log('Extension path:', extensionPath);
    
    // Check if the compiled extension exists
    const fs = require('fs');
    if (fs.existsSync(extensionPath)) {
        console.log('✅ Extension compiled successfully');
        console.log('✅ Extension file exists at:', extensionPath);
    } else {
        console.log('❌ Extension file not found at:', extensionPath);
    }
    
    // Check if baseline data exists
    const baselineDataPath = path.join(__dirname, 'out', 'baselineData.js');
    if (fs.existsSync(baselineDataPath)) {
        console.log('✅ Baseline data compiled successfully');
    } else {
        console.log('❌ Baseline data not found');
    }
    
    // Check if hover provider exists
    const hoverProviderPath = path.join(__dirname, 'out', 'hoverProvider.js');
    if (fs.existsSync(hoverProviderPath)) {
        console.log('✅ Hover provider compiled successfully');
    } else {
        console.log('❌ Hover provider not found');
    }
    
} catch (error) {
    console.error('❌ Error testing extension:', error.message);
}

console.log('Extension test completed.');
