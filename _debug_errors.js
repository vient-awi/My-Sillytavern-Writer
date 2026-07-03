const fs = require('fs');
const src = fs.readFileSync('d:/My Sillytavern Writer/src/瑟瑟灵感状态栏/index.js', 'utf-8');
const dist = fs.readFileSync('d:/My Sillytavern Writer/dist/瑟瑟灵感状态栏/index.js', 'utf-8');

console.log('=== Source File Analysis ===');
console.log('Source length:', src.length);

// Find EMBEDDED_HTML
const embedStart = src.indexOf('var EMBEDDED_HTML');
console.log('EMBEDDED_HTML start:', embedStart);

// Find the template literal start (backtick after =)
const tlStart = src.indexOf('`', embedStart);
console.log('Template literal starts at:', tlStart);

// Count all backticks in the source
let btCount = 0;
for (let i = 0; i < src.length; i++) {
    if (src[i] === '`') btCount++;
}
console.log('Total backticks in source:', btCount);

// Count escaped backticks
const escapedBt = (src.match(/\\`/g) || []).length;
console.log('Escaped backticks:', escapedBt);
console.log('Unescaped backticks:', btCount - escapedBt);

// Script tags
const scriptOpen = (src.match(/<script/g) || []).length;
const scriptClose = (src.match(/<\/script>/g) || []).length;
console.log('<script> tags:', scriptOpen, '</script> tags:', scriptClose);
console.log('Script tag balance:', scriptOpen === scriptClose ? 'OK' : 'MISMATCH!');

// Check for unescaped template expressions
const dollarBrace = src.match(/\$\{/g) || [];
console.log('${ count:', dollarBrace.length);

// Check the investigation prompt area
const invPos = src.indexOf('三性别社会体系');
console.log('三性别社会体系 at:', invPos);

// Show context around new content
if (invPos > 0) {
    const ctx = src.substring(invPos - 100, invPos + 100);
    // Only show first 200 chars to avoid massive output
    console.log('Context around new content:');
    console.log(JSON.stringify(ctx.substring(0, 200)));
}

console.log('\n=== Dist File Analysis ===');
console.log('Dist length:', dist.length);
console.log('Contains 三性别社会体系:', dist.includes('三性别社会体系'));

// Check if dist has proper structure
const startCheck = dist.substring(0, 6);
const endCheck = dist.substring(dist.length - 50);
console.log('Starts with:', JSON.stringify(startCheck));
console.log('Ends with:', JSON.stringify(endCheck));

// Check for common error patterns
const errorPatterns = [
    'Unterminated template',
    'Module parse failed',
    'throw new Error',
    'SyntaxError',
];
for (const pattern of errorPatterns) {
    if (dist.includes(pattern)) {
        console.log('WARNING: Found error pattern:', pattern);
    }
}

console.log('\n=== Done ===');
