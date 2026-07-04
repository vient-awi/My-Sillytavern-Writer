const fs = require('fs');

// Read files
const js = fs.readFileSync('src/瑟瑟灵感状态栏/index.js', 'utf8');
const newTxt = fs.readFileSync('酒馆数据/全局脚本/大调查提示词.txt', 'utf8');

// Find the old prompt boundaries
const startMarker = '请严格按照以下格式输出完整的大调查报告';
const endSearchStr = '150tokens左右';

let startIdx = js.indexOf(startMarker);
if (startIdx === -1) { console.log('ERROR: start marker not found'); process.exit(1); }
startIdx = startIdx - 2; // include "**"

let endSearchIdx = js.indexOf(endSearchStr, startIdx);
if (endSearchIdx === -1) { console.log('ERROR: end search not found'); process.exit(1); }
let afterEnd = js.substring(endSearchIdx);
let relIdx = afterEnd.indexOf('\\n');
if (relIdx === -1) { console.log('ERROR: end \\n not found'); process.exit(1); }
let endIdx = endSearchIdx + relIdx + 2;

const oldEmbedded = js.substring(startIdx, endIdx);
console.log('Old length:', oldEmbedded.length);

// Escape new txt for TEMPLATE LITERAL (backtick string)
// The EMBEDDED_HTML is: var EMBEDDED_HTML = `...`;
//
// Template literal escaping rules:
//   \  -> \\   (backslash)
//   `  -> \`   (backtick)
//   ${ -> \${  (template expression)
//
// For newlines: we need \\n in source so runtime produces literal \n text
//   real \n -> \\n (in source: \\n, runtime: \n)
//
// Order matters: escape \ first, then ` and ${
let newEmbedded = newTxt
    .replace(/\r\n/g, '\n')       // normalize CRLF -> LF
    .replace(/\\/g, '\\\\')       // \ -> \\ (MUST be first)
    .replace(/`/g, '\\`')         // ` -> \`
    .replace(/\$\{/g, '\\${')     // ${ -> \${
    .replace(/\n/g, '\\\\n')      // real newline -> \\n in source -> literal \n at runtime
    .replace(/\r/g, '');          // any remaining CR

console.log('New length:', newEmbedded.length);

// Quick validation
if (newEmbedded.includes('`') && !newEmbedded.includes('\\`')) {
    // Check for unescaped backticks more carefully
    let unescaped = 0;
    for (let i = 0; i < newEmbedded.length; i++) {
        if (newEmbedded[i] === '`' && (i === 0 || newEmbedded[i-1] !== '\\')) {
            unescaped++;
        }
    }
    if (unescaped > 0) {
        console.log('WARNING:', unescaped, 'unescaped backticks remain');
    }
}

// Do the replacement
const newJs = js.substring(0, startIdx) + newEmbedded + js.substring(endIdx);
console.log('JS size change:', newJs.length - js.length, 'bytes');

fs.writeFileSync('src/瑟瑟灵感状态栏/index.js', newJs, 'utf8');
console.log('DONE - index.js updated');
