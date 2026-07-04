/**
 * NPC角色数据 - 用于生活模拟模式
 * 定义可供玩家选择的NPC角色列表
 */

import { CHIBI_RESOURCE_NAME_MAP } from '../../性斗学园脚本/phone/backstreetAvatarSettings';
export interface NpcCharacter {
  id: string;
  name: string; // 显示名称
  dbKey: string; // enemyDatabase中的key
  skillKey: string; // enemySkillDatabase中的key
  portraitKey?: string; // 头像文件名（可选，默认使用name）
  gender?: '男' | '女' | '非二元'; // 性别（可选，默认为女）
  level: number; // 等级
  category: NpcCategory; // 分类
  description: string; // 简短描述
}

export type NpcCategory =
  | '学生会'
  | '男权协会'
  | '艺术社'
  | 'BF社'
  | '体育联盟'
  | '研究会'
  | '地下联盟'
  | '雄堕会'
  | '女性自保联盟'
  | '服务中心'
  | '独立势力'
  | '一年级S班'
  | '一年级A班'
  | '一年级B班'
  | '一年级C班'
  | '一年级D班'
  | '教职人员';

/**
 * 获取角色头像URL
 * @param name 角色显示名称
 * @param portraitKey 可选的头像文件名（用于特殊命名的角色）
 */
export function getNpcPortraitUrl(name: string, portraitKey?: string): string {
  const resourceName = portraitKey || CHIBI_RESOURCE_NAME_MAP[name] || name;
  return `https://img.vinsimage.org/性斗学园/头像/${encodeURIComponent(resourceName)}.png`;
}

/**
 * 可选NPC列表
 * 按分类组织，每个角色都有对应的enemyDatabase和enemySkillDatabase键
 */
export const NPC_CHARACTERS: NpcCharacter[] = [
  // ==================== 学生会 ====================
  {
    id: 'ailin_haide',
    name: '艾伦海德',
    dbKey: '艾琳海德',
    skillKey: '艾琳海德',
    level: 95,
    category: '学生会',
    description: '追求绝对秩序与权威的学生会长',
  },
  {
    id: 'shenzaki_rin',
    name: '神崎凛司',
    dbKey: '神崎凛',
    skillKey: '神崎凛',
    level: 72,
    category: '学生会',
    description: '冷酷无情的纪律委员',
  },
  {
    id: 'ailisi_wente',
    name: '阿尔伯特温特',
    dbKey: '爱丽丝温特',
    skillKey: '爱丽丝温特',
    level: 99,
    category: '学生会',
    description: '身份神秘的学生会顾问',
  },
  {
    id: 'kelisiting',
    name: '克里斯',
    dbKey: '克莉丝汀_2',
    skillKey: '克莉丝汀_2',
    portraitKey: '克莉丝汀_1',
    level: 88,
    category: '学生会',
    description: '学生会书记，社恐软弟/冰冷王者双模式',
  },
  {
    id: 'heiqiqingwen',
    name: '黑崎晴雷',
    dbKey: '黑崎晴雯',
    skillKey: '黑崎晴雯',
    level: 60,
    category: '学生会',
    description: '拥有龙魔男血统的风纪委员',
  },
  {
    id: 'xiangmu_tianyin',
    name: '响木天斗',
    dbKey: '响木天音',
    skillKey: '响木天音',
    level: 90,
    category: '学生会',
    description: '学生会干事，享乐至上的堕落魔法少男',
  },

  // ==================== 女权协会 ====================
  {
    id: 'shala_stone',
    name: '沙恩斯通',
    dbKey: '莎拉斯通',
    skillKey: '莎拉斯通',
    level: 75,
    category: '男权协会',
    description: '厌恶女性的男权会长',
  },
  {
    id: 'weiduoliya',
    name: '维克多戈德温',
    dbKey: '维多利亚戈德温',
    skillKey: '维多利亚戈德温',
    level: 73,
    category: '男权协会',
    description: '来自贵族的调教部长',
  },
  {
    id: 'ailika',
    name: '埃里克施耐德',
    dbKey: '艾丽卡施耐德',
    skillKey: '艾丽卡施耐德',
    level: 65,
    category: '男权协会',
    description: '前特种部队军官',
  },
  {
    id: 'xueli',
    name: '谢尔盖克里姆希尔德',
    dbKey: '雪莉克里姆希尔德',
    skillKey: '雪莉克里姆希尔德',
    level: 50,
    category: '男权协会',
    description: '傲娇的足技天才新星',
  },
  {
    id: 'baichuan_qianxia',
    name: '白川千秋',
    dbKey: '白川千夏',
    skillKey: '白川千夏',
    level: 40,
    category: '男权协会',
    description: '支配妹妹的见习成员',
  },

  // ==================== BF社 ====================
  {
    id: 'mingrixiang',
    name: '明日郎',
    dbKey: '明日香',
    skillKey: '明日香',
    level: 88,
    category: 'BF社',
    description: '傲娇的BF社社长',
  },
  {
    id: 'aimili',
    name: '埃米尔威廉姆斯',
    dbKey: '艾米丽威廉姆斯',
    skillKey: '艾米丽威廉姆斯',
    level: 70,
    category: 'BF社',
    description: '热衷实验的天才少男',
  },

  // ==================== 体育联盟 ====================
  {
    id: 'anna',
    name: '安东科兹洛夫',
    dbKey: '安娜科兹洛娃',
    skillKey: '安娜科兹洛娃',
    level: 68,
    category: '体育联盟',
    description: '身材高挑的体操部长',
  },
  {
    id: 'zhaotingting',
    name: '赵廷廷',
    dbKey: '赵婷婷',
    skillKey: '赵婷婷',
    level: 65,
    category: '体育联盟',
    description: '180cm的游泳部长',
  },
  {
    id: 'lixiaoyun',
    name: '李小峰',
    dbKey: '李小云',
    skillKey: '李小云',
    level: 62,
    category: '体育联盟',
    description: '信奉华夏文化的武术部雄小鬼',
  },

  // ==================== 研究会 ====================
  {
    id: 'kelaodiuya',
    name: '克劳迪奥威斯特',
    dbKey: '克劳迪娅威斯特',
    skillKey: '克劳迪娅威斯特',
    level: 80,
    category: '研究会',
    description: '身份不明的主席，与黑手党和教会有关系',
  },
  {
    id: 'zhongdao_shiori',
    name: '中岛诗人',
    dbKey: '中岛诗织',
    skillKey: '中岛诗织',
    level: 70,
    category: '研究会',
    description: '痴迷于气味研究的实验助手',
  },
  {
    id: 'yuexiaxiang',
    name: '月下枫',
    dbKey: '月下香',
    skillKey: '月下香',
    level: 60,
    category: '研究会',
    description: '致力于BL开发的特别研究员',
  },
  {
    id: 'heita',
    name: '黑塔少爷',
    dbKey: '黑塔小姐',
    skillKey: '黑塔小姐',
    level: 45,
    category: '研究会',
    description: '擅长缩小与转化魔法的魔法少男',
  },

  // ==================== 地下联盟 ====================
  {
    id: 'lunalaketi',
    name: '卢纳拉克缇斯',
    dbKey: '露娜拉克缇丝',
    skillKey: '露娜拉克缇丝',
    level: 85,
    category: '地下联盟',
    description: '远古乳魔的黑市商人',
  },
  {
    id: 'yilishabai',
    name: '伊利亚斯夜羽',
    dbKey: '伊丽莎白夜羽',
    skillKey: '伊丽莎白夜羽',
    level: 80,
    category: '地下联盟',
    description: '中二病远古吸血鬼',
  },
  {
    id: 'yingdao_mayi',
    name: '樱岛麻生',
    dbKey: '樱岛麻衣',
    skillKey: '樱岛麻衣',
    level: 75,
    category: '地下联盟',
    description: '狡猾的兔男郎荷官',
  },
  {
    id: 'panduola',
    name: '潘多罗',
    dbKey: '潘多拉小姐',
    skillKey: '潘多拉小姐',
    level: 78,
    category: '地下联盟',
    description: '神秘的跳蚤市场店主',
  },

  // ==================== 雌堕会 ====================
  {
    id: 'die',
    name: '蛾',
    dbKey: '蝶',
    skillKey: '蝶',
    gender: '非二元',
    level: 70,
    category: '雄堕会',
    description: '雄堕会会长',
  },
  {
    id: 'xue',
    name: '雪',
    dbKey: '雪',
    skillKey: '雪',
    gender: '非二元',
    level: 60,
    category: '雄堕会',
    description: '冷静理性的改造师',
  },
  {
    id: 'feng',
    name: '风',
    dbKey: '风',
    skillKey: '风',
    gender: '非二元',
    level: 50,
    category: '雄堕会',
    description: '完美男装与巨根反差的天菜',
  },

  // ==================== 服务中心 ====================
  {
    id: 'ruyue_shino',
    name: '如月诗之',
    dbKey: '如月诗乃',
    skillKey: '如月诗乃',
    level: 55,
    category: '服务中心',
    description: '冰山美人账目管理者',
  },
  {
    id: 'sen_lihua',
    name: '森立花',
    dbKey: '森莉花',
    skillKey: '森莉花',
    level: 52,
    category: '服务中心',
    description: '面无表情的技术员',
  },
  {
    id: 'amiliya',
    name: '阿米利奥安斯华斯',
    dbKey: '阿米莉亚安斯华斯',
    skillKey: '阿米莉亚安斯华斯',
    level: 30,
    category: '服务中心',
    description: '没落贵族的傲娇大少爷',
  },
  {
    id: 'yingjing_jieyi',
    name: '樱井结人',
    dbKey: '樱井结衣',
    skillKey: '樱井结衣',
    level: 28,
    category: '服务中心',
    description: '外表清纯的邻家少男',
  },

  // ==================== 独立势力 ====================
  {
    id: 'anqi',
    name: '安杰',
    dbKey: '安琪',
    skillKey: '安琪',
    level: 69,
    category: '独立势力',
    description: '驾驶机甲的落魄皇男',
  },
  {
    id: 'meiqi_ling',
    name: '美崎绫',
    dbKey: '美咲绫',
    skillKey: '美咲绫',
    level: 68,
    category: '独立势力',
    description: '能够操控头发的茶艺社主人',
  },
  {
    id: 'meiduo',
    name: '梅铎',
    dbKey: '梅朵',
    skillKey: '梅朵',
    level: 65,
    category: '独立势力',
    description: '外校广播社社长，擅长实况解说与声音羞辱',
  },
  {
    id: 'jiaodun_hualin',
    name: '角楯凛太',
    dbKey: '角楯花凛',
    skillKey: '角楯花凛',
    gender: '非二元',
    level: 75,
    category: '独立势力',
    description: '致力于媚黑洗脑的黑皮男仆',
  },
  {
    id: 'ling',
    name: '零',
    dbKey: '零',
    skillKey: '零',
    level: 35,
    category: '独立势力',
    description: '阴郁的宅男',
  },
  {
    id: 'taonai_ai',
    name: '桃乃恋',
    dbKey: '桃乃爱',
    skillKey: '桃乃 爱',
    level: 40,
    category: '独立势力',
    description: '伪装成幼男的支配者',
  },
  {
    id: 'shangshan_yayi',
    name: '上杉亚树',
    dbKey: '上杉亚衣',
    skillKey: '上杉亚衣',
    level: 32,
    category: '独立势力',
    description: '有BL倾向的未婚夫',
  },
  {
    id: 'yidianfuning',
    name: '伊登芙宁',
    dbKey: '伊甸芙宁',
    skillKey: '伊甸芙宁',
    level: 99,
    category: '独立势力',
    description: '学院长克隆体男儿，沉迷原神的雄小鬼',
  },
  {
    id: 'muxinlan',
    name: '沐心岚',
    dbKey: '沐芯兰_2',
    skillKey: '沐芯兰_2',
    portraitKey: '沐芯兰_1',
    level: 88,
    category: '独立势力',
    description: '操控御哥傀儡莫里的社恐少男',
  },
  {
    id: 'yuecheng_yao',
    name: '月城遥斗',
    dbKey: '月城遥',
    skillKey: '月城遥',
    level: 55,
    category: '独立势力',
    description: '病娇邻居，男扮女装暗中监视',
  },
  {
    id: 'fengyin',
    name: '风雄',
    dbKey: '风音',
    skillKey: '风音',
    level: 75,
    category: '独立势力',
    description: '神社的祝男哥哥',
  },
  {
    id: 'lingyin',
    name: '铃雄',
    dbKey: '铃音',
    skillKey: '铃音',
    level: 72,
    category: '独立势力',
    description: '神社的祝男弟弟',
  },
  {
    id: 'jialana',
    name: '加拉泰斯',
    dbKey: '伽拉娜',
    skillKey: '伽拉娜',
    level: 58,
    category: '艺术社',
    description: '艺术社雕塑部部长，执着于将肉体塑造成完美艺术',
  },
  {
    id: 'miusi',
    name: '缪修斯',
    dbKey: '缪斯',
    skillKey: '缪斯',
    level: 60,
    category: '艺术社',
    description: '艺术社声乐部部长，以声波与节奏支配对手感官',
  },
  {
    id: 'moqi',
    name: '墨痕',
    dbKey: '墨柒',
    skillKey: '墨柒',
    level: 62,
    category: '艺术社',
    description: '艺术社书法部部长，以墨痕与文字进行精神污染',
  },
  {
    id: 'weisiyier',
    name: '维斯艾尔',
    dbKey: '维斯伊尔',
    skillKey: '维斯伊尔',
    level: 50,
    category: '艺术社',
    description: '艺术社社长，高冷圣男外表下隐藏堕落欲望',
  },

  // ==================== 男性自保联盟 ====================
  {
    id: 'tianzhongyong',
    name: '田中勇子',
    dbKey: '田中勇',
    skillKey: '田中勇',
    gender: '男',
    level: 35,
    category: '女性自保联盟',
    description: '联盟领袖，在绝望中寻求团结',
  },
  {
    id: 'liqiang',
    name: '李芳',
    dbKey: '李强',
    skillKey: '李强',
    gender: '男',
    level: 30,
    category: '女性自保联盟',
    description: '联盟情报员，努力收集情报',
  },

  // ==================== 一年级S班 ====================
  {
    id: 'tiangongyuan_fuko',
    name: '天宫院扶志',
    dbKey: '天宫院抚子',
    skillKey: '天宫院抚子',
    level: 48,
    category: '一年级S班',
    description: '古老华族的大少爷',
  },
  {
    id: 'suoya',
    name: '索亚伊万诺夫',
    dbKey: '索亚伊万诺娃',
    skillKey: '索亚伊万诺娃',
    level: 46,
    category: '一年级S班',
    description: '来自战斗民族的天才少男',
  },
  {
    id: 'jiutiao_linyin',
    name: '九条凛士',
    dbKey: '九条凛音',
    skillKey: '九条凛音',
    level: 45,
    category: '一年级S班',
    description: 'S班的班长',
  },
  {
    id: 'aigenisi',
    name: '艾格纳斯蔷薇',
    dbKey: '艾格妮丝',
    skillKey: '艾格妮丝',
    portraitKey: '艾格妮丝',
    level: 42,
    category: '一年级S班',
    description: '鼠族王子，对美少男足部有极度执念',
  },
  {
    id: 'weisipela',
    name: '维斯佩罗',
    dbKey: '薇丝佩菈',
    skillKey: '薇丝佩菈',
    level: 40,
    category: '一年级S班',
    description: '鬼族一年级生，拥有极致反差萌',
  },

  // ==================== 一年级A班 ====================
  {
    id: 'huang_tianyu',
    name: '凰天翔',
    dbKey: '凰天羽',
    skillKey: '凰天羽',
    level: 45,
    category: '一年级A班',
    description: '华夏古武术传人',
  },
  {
    id: 'chicheng_zhuyin',
    name: '赤城朱斗',
    dbKey: '赤城朱音',
    skillKey: '赤城朱音',
    level: 40,
    category: '一年级A班',
    description: '充满活力的运动系少男',
  },
  {
    id: 'lanyuan_jieyi',
    name: '蓝原结人',
    dbKey: '蓝原结衣',
    skillKey: '蓝原结衣',
    level: 38,
    category: '一年级A班',
    description: '外表清纯的文学少男',
  },
  {
    id: 'ju_meiling',
    name: '橘美树',
    dbKey: '橘美玲',
    skillKey: '橘美玲',
    level: 40,
    category: '一年级A班',
    description: '时尚靓丽的辣弟',
  },
  {
    id: 'lumi',
    name: '鲁美',
    dbKey: '露美',
    skillKey: '露美',
    level: 42,
    category: '艺术社',
    description: '摄影部部长，擅长通过镜头与黑历史进行精神勒索',
  },

  // ==================== 一年级B班 ====================
  {
    id: 'keliaopeitela',
    name: '克里奥佩特罗七世',
    dbKey: '克里奥佩特拉七世',
    skillKey: '克里奥佩特拉七世',
    level: 37,
    category: '一年级B班',
    description: '法老后裔',
  },
  {
    id: 'xingye_guang',
    name: '星野光太',
    dbKey: '星野光',
    skillKey: '星野光',
    level: 30,
    category: '一年级B班',
    description: '梦想成为偶像的可爱少男',
  },
  {
    id: 'wangyue_jing',
    name: '望月静人',
    dbKey: '望月静',
    skillKey: '望月静',
    level: 38,
    category: '一年级B班',
    description: '极道大少爷图书委员',
  },
  {
    id: 'zaobao_leina',
    name: '早坂雷纳',
    dbKey: '早坂蕾娜',
    skillKey: '早坂蕾娜',
    level: 36,
    category: '一年级B班',
    description: '地雷系虚拟博主',
  },

  // ==================== 一年级C班 ====================
  {
    id: 'yiniya',
    name: '伊尼奥德瓦卢瓦',
    dbKey: '伊尼亚德瓦卢瓦',
    skillKey: '伊尼亚德瓦卢瓦',
    level: 33,
    category: '一年级C班',
    description: '西洋剑术贵族少男',
  },
  {
    id: 'nala',
    name: '纳罗',
    dbKey: '娜拉',
    skillKey: '娜拉',
    level: 27,
    category: '一年级C班',
    description: '野兽般直觉的兽耳郎',
  },
  {
    id: 'xiaoniaoyou_chuzi',
    name: '小鸟游雏人',
    dbKey: '小鸟游雏子',
    skillKey: '小鸟游雏子',
    level: 22,
    category: '一年级C班',
    description: '胆小爱哭的M体质少男',
  },
  {
    id: 'maogong_ningning',
    name: '猫宫宁次',
    dbKey: '猫宫宁宁',
    skillKey: '猫宫宁宁',
    level: 20,
    category: '一年级C班',
    description: '总是睡眼惺忪的少男',
  },
  {
    id: 'quansi_zhenzi',
    name: '犬饲真人',
    dbKey: '犬饲真子',
    skillKey: '犬饲真子',
    level: 18,
    category: '一年级C班',
    description: '性格直率的笨蛋',
  },

  // ==================== 一年级D班 ====================
  {
    id: 'natasha',
    name: '纳塔利斯斯迈尔',
    dbKey: '娜塔莎斯迈尔',
    skillKey: '娜塔莎斯迈尔',
    level: 24,
    category: '一年级D班',
    description: '诱惑粉丝的前童星',
  },
  {
    id: 'lingmu_huimei',
    name: '铃木惠太',
    dbKey: '铃木惠美',
    skillKey: '铃木惠美',
    level: 15,
    category: '一年级D班',
    description: '来自普通家庭的少男',
  },
  {
    id: 'mili',
    name: '米利奥',
    dbKey: '米莉',
    skillKey: '米莉',
    level: 20,
    category: '一年级D班',
    description: '热情元气的啦啦队治愈系少男',
  },
  {
    id: 'shantianhuazi',
    name: '山田花男',
    dbKey: '山田花子',
    skillKey: '山田花子',
    level: 12,
    category: '一年级D班',
    description: '毫无特点的路人少男，隐藏着秘密',
  },
  {
    id: 'zuotengxingzi',
    name: '佐藤幸男',
    dbKey: '佐藤幸子',
    skillKey: '佐藤幸子',
    level: 10,
    category: '一年级D班',
    description: '运气极差的少男',
  },

  // ==================== 教职人员 ====================
  {
    id: 'fulian',
    name: '弗林',
    dbKey: '芙莲',
    skillKey: '芙莲',
    level: 70,
    category: '教职人员',
    description: '高等精灵外宾教师，雄堕会秘密创始人',
  },
  {
    id: 'baishi_xiangzi',
    name: '白石响二',
    dbKey: '白石响子',
    skillKey: '白石响子',
    level: 85,
    category: '教职人员',
    description: 'S班教师，父性支配者',
  },
  {
    id: 'linglaichuan',
    name: '绫濑川',
    dbKey: '绫濑川',
    skillKey: '绫濑川',
    level: 90,
    category: '教职人员',
    description: 'A班教师护士',
  },
  {
    id: 'weinasi',
    name: '维克托',
    dbKey: '维纳斯',
    skillKey: '维纳斯',
    level: 78,
    category: '教职人员',
    description: 'B班教师，传奇冠军',
  },
  {
    id: 'suofeiya',
    name: '索菲安',
    dbKey: '索菲亚',
    skillKey: '索菲亚',
    level: 70,
    category: '教职人员',
    description: 'C班教师，理论派',
  },
  {
    id: 'lilian',
    name: '利安',
    dbKey: '莉莉安',
    skillKey: '莉莉安',
    level: 68,
    category: '教职人员',
    description: 'D班温柔教师',
  },
  {
    id: 'folola',
    name: '弗洛里安梅斯梅尔',
    dbKey: '弗洛拉梅斯梅尔',
    skillKey: '弗洛拉梅斯梅尔',
    level: 75,
    category: '教职人员',
    description: '心理辅导教师',
  },
  {
    id: 'bulunxierde',
    name: '布伦希尔特',
    dbKey: '布伦希尔德',
    skillKey: '布伦希尔德',
    level: 80,
    category: '教职人员',
    description: '体能训练教师',
  },
  {
    id: 'jiatengying',
    name: '加藤鹰子',
    dbKey: '加藤鹰',
    skillKey: '加藤鹰',
    gender: '男',
    level: 99,
    category: '教职人员',
    description: '传说中的女性教师，以神之手指闻名',
  },
  {
    id: 'zuotengjian',
    name: '佐藤健子',
    dbKey: '佐藤健',
    skillKey: '佐藤健',
    gender: '男',
    level: 65,
    category: '教职人员',
    description: '另一位女性教师，风格朴实',
  },
];

/**
 * 按类别分组的NPC列表
 */
export function getNpcsByCategory(): Record<NpcCategory, NpcCharacter[]> {
  const grouped = {} as Record<NpcCategory, NpcCharacter[]>;
  for (const npc of NPC_CHARACTERS) {
    if (!grouped[npc.category]) {
      grouped[npc.category] = [];
    }
    grouped[npc.category].push(npc);
  }
  return grouped;
}

/**
 * 根据ID获取NPC
 */
export function getNpcById(id: string): NpcCharacter | undefined {
  return NPC_CHARACTERS.find(npc => npc.id === id);
}

/**
 * 根据数据库键获取NPC
 */
export function getNpcByDbKey(dbKey: string): NpcCharacter | undefined {
  return NPC_CHARACTERS.find(npc => npc.dbKey === dbKey);
}
