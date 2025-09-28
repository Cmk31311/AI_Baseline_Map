const fs = require('fs');
const util = require('util');

// This uses deprecated fs.exists()
if (fs.exists('file.txt')) {
  console.log('File exists');
}

// This uses deprecated util._extend
const extended = util._extend({}, { newProp: 'value' });

// This uses deprecated new Buffer()
const buffer = new Buffer('hello world');

console.log('Hello from test project');
