export interface FullbodyPortraitProfile {
  fileName: string;
  portraitUrl: string;
  names: string[];
  affiliation?: string;
}

const PORTRAIT_ASSET_BASE_URL = 'https://testingcf.jsdelivr.net/gh/enterprise20020924-web/-@main/llm1/全身立绘/';

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}

function resolvePortraitAssetBaseUrl() {
  const configuredBaseUrl = PORTRAIT_ASSET_BASE_URL.trim();
  if (configuredBaseUrl.length > 0) {
    return ensureTrailingSlash(configuredBaseUrl);
  }

  return './全身立绘/';
}

const fullbodyPortraitAssetBaseUrl = resolvePortraitAssetBaseUrl();

export function resolveFullbodyAssetUrl(fileName: string) {
  try {
    return new URL(fileName, fullbodyPortraitAssetBaseUrl).href;
  } catch {
    return `${fullbodyPortraitAssetBaseUrl}${encodeURIComponent(fileName)}`;
  }
}

const FULLBODY_PORTRAIT_META: Array<Omit<FullbodyPortraitProfile, 'portraitUrl'>> = [
  { fileName: '响木天音校服.png', names: ['响木天斗校服', '响木天斗', '天斗'], affiliation: '学生会' },
  { fileName: '小夜月静夜.png', names: ['小夜月静夜', '小夜月', '静夜'] },
  { fileName: '上杉亚衣.png', names: ['上杉亚树', '上杉', '亚树'], affiliation: '独立' },
  { fileName: '中岛诗织.png', names: ['中岛诗人', '中岛', '诗人'], affiliation: '研究会' },
  { fileName: '九条凛音.png', names: ['九条凛士', '九条', '凛士'], affiliation: '独立' },
  { fileName: '云溪.png', names: ['云峰'], affiliation: '玉台仙苑 (世界排名第一)' },
  { fileName: '伊丽莎白夜羽.png', names: ['伊利亚斯夜羽', '伊利亚斯', '夜羽'], affiliation: '地下联盟' },
  { fileName: '伊尼亚德瓦卢瓦.png', names: ['伊尼奥德瓦卢瓦', '伊尼奥', '德瓦卢瓦'], affiliation: '独立' },
  { fileName: '伊甸芙宁.png', names: ['伊登芙宁', '伊登', '芙宁'] },
  { fileName: '伊莎贝拉.png', names: ['伊萨克'], affiliation: '瓦莱里乌斯皇家学院 (世界排名第三)' },
  { fileName: '伽拉娜.png', names: ['加拉泰斯'], affiliation: '艺术社 雕塑部' },
  { fileName: '佐藤幸子.png', names: ['佐藤幸男', '佐藤', '幸男'], affiliation: '独立' },
  { fileName: '僵尸天羽.png', names: ['僵尸天翔'] },
  { fileName: '克劳迪娅威斯特.png', names: ['克劳迪奥威斯特', '克劳迪奥', '威斯特'], affiliation: '研究会' },
  { fileName: '克洛伊.png', names: ['克洛伊斯'] },
  { fileName: '克莉丝汀_1.png', names: ['克里斯'], affiliation: '学生会' },
  { fileName: '八尺夫人.png', names: ['八尺先生'] },
  { fileName: '凰天羽.png', names: ['凰天翔'], affiliation: '独立' },
  { fileName: '响木天音.png', names: ['响木天斗'], affiliation: '学生会' },
  { fileName: '堕落铃音.png', names: ['堕落铃雄', '铃雄'], affiliation: '独立' },
  { fileName: '墨柒.png', names: ['墨痕'], affiliation: '艺术社 书法部' },
  { fileName: '夏洛特.png', names: ['查尔斯'], affiliation: '瓦莱里乌斯皇家学院 (世界排名第三) → 天海学园交换生(转学后)' },
  { fileName: '天宫院抚子.png', names: ['天宫院扶志', '天宫院', '扶志'], affiliation: '独立' },
  { fileName: '女主.png', names: ['女主'] },
  { fileName: '如月诗乃.png', names: ['如月诗之', '如月', '诗之'], affiliation: '学生服务中心' },
  { fileName: '娜塔莎斯迈尔.png', names: ['纳塔利斯斯迈尔', '纳塔利斯', '斯迈尔'], affiliation: '独立' },
  { fileName: '安娜.png', names: ['安东', '安东科兹洛夫', '科兹洛夫'], affiliation: '体育联盟 体操部' },
  { fileName: '安洁莉卡.png', names: ['安杰利科'], affiliation: '聖·塞拉芬娜修道院 (教会附属) → 天海学园交换生(若转学)' },
  { fileName: '安琪.png', names: ['安杰'], affiliation: '独立' },
  { fileName: '小鸟游雏子.png', names: ['小鸟游雏人', '小鸟游', '雏人'], affiliation: '独立' },
  { fileName: '山田花子.png', names: ['山田花男', '山田', '花男'], affiliation: '独立' },
  { fileName: '布伦希尔德.png', names: ['布伦希尔特', '布伦'], affiliation: '教师' },
  { fileName: '弗洛拉梅斯梅尔.png', names: ['弗洛里安梅斯梅尔', '弗洛里安', '梅斯梅尔'], affiliation: '教师' },
  { fileName: '早坂蕾娜.png', names: ['早坂雷纳', '早坂', '雷纳'], affiliation: '独立' },
  { fileName: '明日香.png', names: ['明日郎'], affiliation: 'BF社 社长' },
  { fileName: '星野光.png', names: ['星野光太', '星野', '光'], affiliation: '独立' },
  { fileName: '月下香.png', names: ['月下枫'], affiliation: '研究会' },
  { fileName: '月城遥.png', names: ['月城遥斗', '月城', '遥斗'], affiliation: '独立' },
  { fileName: '望月静.png', names: ['望月静人', '望月', '静人'], affiliation: '一年级B班 / 图书委员会 / (暗地里) 望月极道会' },
  { fileName: '李小云.png', names: ['李小峰'], affiliation: '体育联盟 武术部' },
  { fileName: '柳烟霞.png', names: ['柳烟峰'], affiliation: '玉台仙苑 (世界排名第一) → 天海学园交换生(转学后)' },
  { fileName: '桃乃爱.png', names: ['桃乃恋'], affiliation: '独立' },
  { fileName: '梅朵.png', names: ['梅铎'], affiliation: '广播社 社长 / 欲望竞技场专属解说员' },
  { fileName: '梅菲丝.png', names: ['梅菲斯托'], affiliation: '基赫纳淫欲学院 (魔界第一学府)' },
  { fileName: '森莉花.png', names: ['森立花', '森', '立花'], affiliation: '研究会' },
  { fileName: '樱井结衣.png', names: ['樱井结人', '樱井', '结人'], affiliation: '学生服务中心' },
  { fileName: '樱岛麻衣.png', names: ['樱岛麻生', '樱岛', '麻生'], affiliation: '地下联盟' },
  { fileName: '沐芯兰.png', names: ['沐心岚', '茉荆'], affiliation: '独立' },
  { fileName: '潘多拉小姐.png', names: ['潘多罗', '潘多罗'], affiliation: '地下联盟' },
  { fileName: '爱丽丝.png', names: ['阿尔伯特', '阿尔伯特温特'], affiliation: '学生会' },
  { fileName: '特蕾莎.png', names: ['特雷斯'], affiliation: '聖·塞拉芬娜修道院 (教会附属)' },
  { fileName: '犬饲真子.png', names: ['犬饲真人', '犬饲', '真人'], affiliation: '独立' },
  { fileName: '猫宫宁宁.png', names: ['猫宫宁次', '猫宫', '宁次'], affiliation: '独立' },
  { fileName: '玄霜.png', names: ['玄寒'], affiliation: '玉台仙苑 (世界排名第一)' },
  { fileName: '玛利亚.png', names: ['马利奥'], affiliation: '聖·塞拉芬娜修道院 (教会附属)' },
  { fileName: '玛德琳.png', names: ['马塞尔'], affiliation: '瓦莱里乌斯皇家学院 (世界排名第三)' },
  { fileName: '男主_黑西装校服_普通学生.png', names: ['男主_黑西装校服_普通学生'] },
  { fileName: '白川千夏.png', names: ['白川千秋', '白川', '千秋'], affiliation: '男权协会 见习成员' },
  { fileName: '白石响子.png', names: ['白石响二', '白石', '响子'], affiliation: '独立' },
  { fileName: '神崎凛1.png', names: ['神崎凛司'], affiliation: '学生会' },
  { fileName: '米莉.png', names: ['米利奥'], affiliation: '体育联盟 啦啦队' },
  { fileName: '索亚伊万诺娃.png', names: ['索亚伊万诺夫', '索亚', '伊万诺夫'], affiliation: '独立' },
  { fileName: '索菲亚.png', names: ['索菲安'], affiliation: '教师' },
  { fileName: '绫濑川.png', names: ['绫濑川'], affiliation: '教师' },
  { fileName: '维多利亚戈德温.png', names: ['维克多戈德温', '维克多', '戈德温'], affiliation: '男权协会 调教部长' },
  { fileName: '维斯伊尔.png', names: ['维斯艾尔'] },
  { fileName: '缪斯.png', names: ['缪修斯'], affiliation: '艺术社 声乐部' },
  { fileName: '美咲绫.png', names: ['美崎绫'], affiliation: '独立' },
  { fileName: '艾丽卡施耐德.png', names: ['埃里克施耐德', '埃里克', '施耐德'], affiliation: '男权协会 精英成员' },
  { fileName: '艾格妮丝.png', names: ['艾格纳斯', '蔷薇'], affiliation: '独立' },
  { fileName: '艾琳海德.png', names: ['艾伦海德'], affiliation: '学生会' },
  { fileName: '艾米莉亚.png', names: ['阿米利奥安斯华斯', '阿米利奥', '安斯华斯'], affiliation: '服务中心' },
  { fileName: '艾米莉威廉姆斯.png', names: ['埃米尔威廉姆斯', '埃米尔威廉姆斯', '埃米尔', '威廉姆斯'], affiliation: 'BF社 实验组长' },
  { fileName: '芙莲.png', names: ['弗林'] },
  { fileName: '花凛.png', names: ['凛太', '角楯凛太', '角楯'], affiliation: '独立' },
  { fileName: '莉莉丝.png', names: ['利维坦'], affiliation: '基赫纳淫欲学院 (魔界第一学府) → 天海学园交换生(若转学)' },
  { fileName: '莉莉娜.png', names: ['利林'], affiliation: '基赫纳淫欲学院 (魔界第一学府) → 天海学园交换生(若转学)' },
  { fileName: '莉莉安.png', names: ['利安'], affiliation: '教师' },
  { fileName: '莎拉斯通.png', names: ['沙恩斯通'], affiliation: '男权协会 会长' },
  { fileName: '菲奥娜.png', names: ['菲利克斯'], affiliation: '瓦莱里乌斯皇家学院(世界排名第三)' },
  { fileName: '蓝原结衣.png', names: ['蓝原结人', '蓝原', '结人'], affiliation: '独立' },
  { fileName: '薇丝佩菈.png', names: ['维斯佩罗'], affiliation: '独立' },
  { fileName: '薇尔.png', names: ['薇尔'] },
  { fileName: '蝶.png', names: ['蛾'], affiliation: '雄堕会 会长' },
  { fileName: '贝尔芬格.png', names: ['贝利亚尔'], affiliation: '基赫纳淫欲学院 (魔界第一学府)' },
  { fileName: '贝阿切丝特.png', names: ['贝阿托'], affiliation: '聖·塞拉芬娜修道院 (教会附属)' },
  { fileName: '赤城朱音.png', names: ['赤城朱斗', '赤城', '朱斗'], affiliation: '体育联盟' },
  { fileName: '赵婷婷.png', names: ['赵廷廷'], affiliation: '体育联盟 游泳部' },
  { fileName: '铃木惠美.png', names: ['铃木惠太', '铃木', '惠太'], affiliation: '独立' },
  { fileName: '铃音.png', names: ['铃雄'], affiliation: '独立' },
  { fileName: '阳菜.png', names: ['阳菜'], affiliation: '独立' },
  { fileName: '阿黛尔.png', names: ['阿德尔伯特'], affiliation: '瓦莱里乌斯皇家学院 (世界排名第三)' },
  { fileName: '雪莉克里姆希尔德.png', names: ['谢尔盖克里姆希尔德', '谢尔盖'], affiliation: '男权协会' },
  { fileName: '雪.png', names: ['雪'], affiliation: '雄堕会 改造师 (蛾的弟子)' },
  { fileName: '零.png', names: ['零'], affiliation: '独立' },
  { fileName: '露娜拉克缇丝.png', names: ['卢纳拉克缇斯', '卢纳', '拉克缇斯'], affiliation: '地下联盟' },
  { fileName: '露美.png', names: ['鲁美'], affiliation: '艺术社 摄影部' },
  { fileName: '青鸢.png', names: ['青鹏'], affiliation: '玉台仙苑 (世界排名第一)' },
  { fileName: '风.png', names: ['风'], affiliation: '雄堕会 核心成员' },
  { fileName: '风音.png', names: ['风雄'], affiliation: '独立' },
  { fileName: '鬼巫女椿.png', names: ['鬼祝男椿'] },
  { fileName: '鬼樱.png', names: ['鬼樱'] },
  { fileName: '黑塔小姐.png', names: ['黑塔少爷', '黑塔'], affiliation: '研究会' },
  { fileName: '黑崎晴雯.png', names: ['黑崎晴雷'], affiliation: '学生会' },
];

const fullbodyPortraitFileNames = new Set(FULLBODY_PORTRAIT_META.map(profile => profile.fileName));

function normalizePortraitAlias(value: string) {
  return value.replace(/[{}·・•‧∙･．.\s]/g, '').trim();
}

function expandPortraitAliases(names: string[]) {
  const result: string[] = [];
  const seen = new Set<string>();

  function add(name: string) {
    const normalizedName = name.trim();
    if (normalizedName.length === 0 || seen.has(normalizedName)) {
      return;
    }

    seen.add(normalizedName);
    result.push(normalizedName);
  }

  names.forEach(add);

  for (const fullName of names) {
    const normalizedFullName = normalizePortraitAlias(fullName);
    if (normalizedFullName.length < 4) {
      continue;
    }

    for (const givenName of names) {
      const normalizedGivenName = normalizePortraitAlias(givenName);
      if (normalizedGivenName.length < 2 || normalizedGivenName.length >= normalizedFullName.length) {
        continue;
      }

      if (!normalizedFullName.startsWith(normalizedGivenName)) {
        continue;
      }

      const familyName = normalizedFullName.slice(normalizedGivenName.length);
      if (familyName.length >= 2) {
        add(`${givenName}·${familyName}`);
      }
    }
  }

  return result;
}

export const fullbodyPortraitProfiles: FullbodyPortraitProfile[] = FULLBODY_PORTRAIT_META.map(profile => ({
  ...profile,
  names: expandPortraitAliases(profile.names),
  portraitUrl: resolveFullbodyAssetUrl(profile.fileName),
}));

export function getFullbodyPortraitUrl(fileName: string) {
  return fullbodyPortraitFileNames.has(fileName) ? resolveFullbodyAssetUrl(fileName) : null;
}
