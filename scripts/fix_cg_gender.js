// 修复 cgConfig.ts 中描述和事件名的性转
// 1. 角色名：旧女版名 → 新男版名
// 2. 性别术语：女性化 → 男性化
// 3. 不动 images 数组、characterName、resourceName、注释

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', '性斗学园', '战斗界面', 'data', 'cgConfig.ts');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// ============================================================
// 替换表
// ============================================================

// 角色名替换：旧女版 → 新男版
// 按长度降序排列（长名优先替换，避免部分匹配）
const NAME_MAP = [
  // 长名（优先）
  ['伊丽莎白夜羽', '伊利亚斯夜羽'],
  ['露娜拉克缇丝', '卢纳拉克缇斯'],
  ['雪莉克里姆希尔德', '谢尔盖克里姆希尔德'],
  ['娜塔莎斯迈尔', '纳塔利斯斯迈尔'],
  ['克里奥佩特拉七世', '克里奥佩特罗七世'],
  ['维多利亚戈德温', '维克多戈德温'],
  ['弗洛拉梅斯梅尔', '弗洛里安梅斯梅尔'],
  ['艾丽卡施耐德', '埃里克施耐德'],
  ['阿米莉亚安斯华斯', '阿米利奥安斯华斯'],
  ['克劳迪娅威斯特', '克劳迪奥威斯特'],
  ['安娜科兹洛娃', '安东科兹洛夫'],
  ['艾米丽威廉姆斯', '埃米尔威廉姆斯'],
  ['伊尼亚德瓦卢瓦', '伊尼奥德瓦卢瓦'],
  ['索亚伊万诺娃', '索亚伊万诺夫'],
  ['爱丽丝温特', '阿尔伯特温特'],
  ['爱丽丝', '阿尔伯特温特'],
  ['娜塔莎斯迈尔', '纳塔利斯斯迈尔'],
  ['娜塔莎', '纳塔利斯'],
  // 中文较短的
  ['伊丽莎白', '伊利亚斯'],
  ['莎拉斯通', '沙恩斯通'],
  ['上杉亚衣', '上杉亚树'],
  ['莉莉安', '利安'],
  ['小鸟游雏子', '小鸟游雏人'],
  ['神崎凛', '神崎凛司'],
  ['艾琳海德', '艾伦海德'],
  ['美咲绫', '美崎绫'],
  ['黑崎晴雯', '黑崎晴雷'],
  ['薇丝佩菈', '维斯佩罗'],
  ['沐芯兰', '沐心岚'],
  ['克莉丝汀', '克里斯'],
  ['艾格妮丝', '艾格纳斯'],
  ['伊甸芙宁', '伊登芙宁'],
  ['山田花子', '山田花男'],
  ['白石响子', '白石响二'],
  ['西园寺辉夜', '西园寺辉夜'], // 同名保留，但确保不被其他规则误改
  ['黑塔小姐', '黑塔少爷'],
  ['潘多拉小姐', '潘多罗'],
  ['月下香', '月下枫'],
  ['明日香', '明日郎'],
  ['风音', '风雄'],
  ['铃音', '铃雄'],
  ['芙莲', '弗林'],
  ['雪莉克里姆希尔德', '谢尔盖克里姆希尔德'],
  ['雪莉', '谢尔盖'],
  ['露娜', '卢纳'],
  ['艾琳', '艾伦'],
  ['茉莉', '茉荆'],
  ['星野光', '星野光太'],
  ['蝶', '蛾'],
];

// 性别术语替换
const TERM_MAP = [
  ['女王', '王者'],
  ['母狗', '公狗'],
  ['母猪', '公猪'],
  ['女伴', '男伴'],
  ['新娘', '新郎'],
  ['魅魔', '淫魔'],
  ['萝莉', '正太'],
  ['少女', '少男'],
  ['大小姐', '大少爷'],
  ['本小姐', '本少爷'],
  ['小姐', '少爷'],
  ['巫女', '祝男'],
  ['修女', '修士'],
  ['魔女', '魔男'],
  ['圣女', '圣男'],
  ['女仆', '男仆'],
  ['公主', '王子'],
  ['女儿', '男儿'],
  ['妈妈', '爸爸'],
  ['百合', 'BL'],
  ['扶她', '扶他'],
  ['母性', '父性'],
  ['磨女', '磨男'],
  ['少妇', '少夫'],
  ['母乳', '父乳'],
];

// 合并所有替换（长名优先）
// 去重后按长度降序
const allReplacements = [...NAME_MAP, ...TERM_MAP];
// 去重（保留第一个）
const seen = new Set();
const unique = [];
for (const [from, to] of allReplacements) {
  const key = `${from}->${to}`;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push([from, to]);
  }
}
// 按 from 长度降序
unique.sort((a, b) => b[0].length - a[0].length);

// ============================================================
// 状态机处理
// ============================================================
let inImages = false;
let bracketDepth = 0;
let modifiedCount = 0;
const modifiedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const originalLine = line;

  // 状态 1：检测是否进入 images 块
  if (!inImages && /^\s*images:\s*\[/.test(line)) {
    inImages = true;
    bracketDepth = 0;
    // 计算此行 [ 和 ] 的净数量
    const opens = (line.match(/\[/g) || []).length;
    const closes = (line.match(/\]/g) || []).length;
    bracketDepth = opens - closes;
    if (bracketDepth <= 0) {
      inImages = false;
    }
    continue;
  }

  // 状态 2：在 images 块内部，追踪括号深度
  if (inImages) {
    const opens = (line.match(/\[/g) || []).length;
    const closes = (line.match(/\]/g) || []).length;
    bracketDepth += opens - closes;
    if (bracketDepth <= 0) {
      inImages = false;
    }
    continue;
  }

  // 状态 3：跳过结构定义行
  if (/^\s*(characterName|resourceName|id|probability|portraitKey|dbKey|skillKey):/.test(line)) {
    continue;
  }
  // 跳过纯注释行
  if (/^\s*\/\//.test(line)) {
    continue;
  }

  // 状态 4：安全替换
  for (const [from, to] of unique) {
    if (line.includes(from)) {
      line = line.split(from).join(to);
    }
  }

  if (line !== originalLine) {
    modifiedCount++;
    modifiedLines.push(i + 1); // 1-based line number
    lines[i] = line;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

console.log(`[cgConfig] 修改了 ${modifiedCount} 行`);
if (modifiedLines.length <= 50) {
  console.log(`  行号: ${modifiedLines.join(', ')}`);
} else {
  console.log(`  行号(前50): ${modifiedLines.slice(0, 50).join(', ')}`);
}
console.log(`  共 ${modifiedLines.length} 处替换`);
