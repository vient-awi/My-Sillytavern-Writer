const fs = require('fs');

// Read source file (git-based version)
let script = fs.readFileSync('d:/My Sillytavern Writer/src/瑟瑟灵感状态栏/index.js', 'utf8');

// Read new prompt
let newPrompt = fs.readFileSync('d:/My Sillytavern Writer/酒馆数据/全局脚本/大调查提示词.txt', 'utf8');
newPrompt = newPrompt.replace(/\r\n/g, '\n').replace(/\r/g, '');

// Find old prompt boundaries in the script
// The prompt is inside: return'**请严格按照以下格式...150tokens左右。'
const startMarker = '请严格按照以下格式输出完整的大调查报告';
const endMarker = '150tokens左右。';

const startIdx = script.indexOf(startMarker);
if (startIdx === -1) { console.log('ERROR: Start marker not found'); process.exit(1); }

const endIdx = script.indexOf(endMarker, startIdx);
if (endIdx === -1) { console.log('ERROR: End marker not found'); process.exit(1); }

// Find the actual string boundaries
// The prompt is inside return'**...' — a single-quoted string
// Find opening quote (the ' before **)
const openQuote = startIdx - 3; // skip past "**"
console.log('Open quote check:', JSON.stringify(script.substring(openQuote, openQuote + 5)));

// Find closing quote after end marker
const afterEnd = script.indexOf("'", endIdx + endMarker.length);
if (afterEnd === -1) { console.log('ERROR: Closing quote not found'); process.exit(1); }

const oldPrompt = script.substring(openQuote, afterEnd + 1);
console.log('Old prompt length:', oldPrompt.length);

// Escape the new prompt for the JavaScript single-quoted string context
// The prompt is inside a template literal (EMBEDDED_HTML), so we need TWO levels:
// 1. Inner level: single-quoted JS string (return'...') — escape ', \, and convert \n to actual newline char in string
// 2. Outer level: template literal — but since the inner string uses \n (escaped), the template literal just sees literal chars

// First, escape for the inner single-quoted string level
let escaped = newPrompt
    .replace(/\\/g, '\\\\')   // backslash -> double backslash (for JS string)
    .replace(/'/g, "\\'")     // single quote -> \'
    .replace(/\n/g, '\\\\n');   // actual newline -> \\n in source → template literal evaluates to \n → inner JS sees \n escape = newline in value

// Now, do we need template literal escaping?
// The inner string '...' is inside a template literal `...`
// The \n in the inner string is \n (backslash-n), which is safe in template literal
// But we also need to check if the content has backticks or ${

// Count backticks
const btCount = (escaped.match(/`/g) || []).length;
console.log('Backticks to escape for template literal:', btCount);

// Escape for template literal
escaped = escaped.replace(/`/g, '\\`');
escaped = escaped.replace(/\$\{/g, '\\${');

// Build the new string: starts with '* like the original
// The original starts with '**... so we need: '*<escaped_content>'
let newString = "'" + escaped + "'";

console.log('New string length:', newString.length);
console.log('Difference from old:', newString.length - oldPrompt.length);

// Replace in script
const newScript = script.slice(0, openQuote) + newString + script.slice(afterEnd + 1);

console.log('Original script length:', script.length);
console.log('New script length:', newScript.length);

// Verify markers
const checks = ['三性别社会体系', '描写哲学', '格式强制规则', '性宠制度'];
for (const c of checks) {
    console.log('Contains', c + ':', newScript.includes(c));
}

// Verify syntax
try {
    new Function(newScript);
    console.log('Syntax check: PASSED');
} catch (e) {
    console.error('Syntax check FAILED:', e.message);
    process.exit(1);
}

// Write
fs.writeFileSync('d:/My Sillytavern Writer/src/瑟瑟灵感状态栏/index.js', newScript, 'utf8');
console.log('Done! Script updated successfully.');
