const fs = require('fs');
const path = require('path');

const remarkMin = fs.readFileSync(path.join(__dirname, '../dist/remark.min.js'), 'utf8');

// Escape script tags to prevent early termination
const escapedScript = remarkMin.replace(/<\/script>/g, '<\\/script>');

const template = fs.readFileSync(path.join(__dirname, '../src/templates/boilerplate-single.html.template'), 'utf8');

const output = template.replace(/%REMARK_MINJS%/g, escapedScript);

fs.writeFileSync(path.join(__dirname, '../dist/boilerplate-single.html'), output);
console.log('Generated dist/boilerplate-single.html');
