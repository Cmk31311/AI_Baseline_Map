// Comprehensive JavaScript test file
// Hover over any feature to see detailed baseline compatibility

// ES6+ Features - should show browser support
const arrowFunction = () => {
    console.log('Arrow function');
};

// Template Literals - should show browser versions
const message = `Hello ${name}, welcome!`;

// Destructuring - should show browser support
const { name, age } = person;
const [first, second] = array;

// Spread Operator - should show browser versions
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, newProp: 'value' };

// Default Parameters - should show browser support
function greet(name = 'World') {
    return `Hello ${name}`;
}

// Async/Await - should show browser versions
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

// Promises - should show browser support
const promise = new Promise((resolve, reject) => {
    // Promise logic
});

promise.then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});

// Optional Chaining - should show "low" baseline
const value = user?.profile?.name;

// Nullish Coalescing - should show "low" baseline
const displayName = user.name ?? 'Anonymous';

// Array Methods - should show browser versions
const found = array.find(item => item.id === 1);
const hasItem = array.includes('target');

// Object Methods - should show browser support
const merged = Object.assign({}, obj1, obj2);

// Web Components - should show browser versions
class MyElement extends HTMLElement {
    connectedCallback() {
        this.innerHTML = '<p>Custom Element</p>';
    }
    
    disconnectedCallback() {
        // Cleanup
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        // Handle attribute changes
    }
}

// Define custom element
customElements.define('my-element', MyElement);

// Modern syntax examples
const processItems = items => items
    .filter(item => item.active)
    .map(item => ({ ...item, processed: true }))
    .reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
