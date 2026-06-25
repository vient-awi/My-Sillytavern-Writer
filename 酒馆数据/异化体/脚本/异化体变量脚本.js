import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

const 发育阶段映射 = (进度) => {
  if (进度 <= 10)   return '刚着床';
  if (进度 < 30)   return '早期发育';
  if (进度 < 60)   return '成形期';
  if (进度 < 80)   return '活跃期';
  if (进度 < 100)  return '临产期';
  return '生产中';
};

const 孕育体Schema = z.object({
  来源: z.string().prefault('未知'),
  来源类型: z.enum(['低级异化体','中级异化体','高级异化体','领主级','植物型','嵌合体','微型侵入体','人类','未知']).prefault('未知'),
  着床部位: z.array(z.enum(['生殖腔','直肠','尿道','膀胱','睾丸','乳腺','阴道壁','前列腺','精囊'])).prefault(() => ['生殖腔']),
  受孕时间: z.string().prefault('未记录'),
  预计生产时间: z.string().prefault('未记录'),
  发育进度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
  后代数量: z.coerce.number().transform(v => Math.max(1, v)).prefault(1),
  后代种类: z.string().prefault('未知'),
  胎儿体型: z.enum(['微型','小型','中型','大型','巨型']).prefault('小型'),
  体型影响: z.enum(['外表无异样','小腹微微鼓起','像被灌满了一样','肚子大得像怀了几个月','涨到快要撑破了']).prefault('外表无异样'),
  每回合源质释放量: z.coerce.number().transform(v => Math.max(0, v)).prefault(1),
  林昊感受: z.string().prefault('未记录'),
}).transform(obj => ({
  ...obj,
  _当前发育阶段: 发育阶段映射(obj.发育进度),
}));

const 林昊原始Schema = z.object({
  理智值: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(100),
  情热值: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
  淫荡值: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(30),
  高潮值: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
  能量饱食度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(80),
  腹腔积液量: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
  当前吸收效率: z.enum(['生殖腔/生殖道/直肠（最优）','乳腺/尿道等性通道（次优）','口腔/胃部（低效）','无近期注入']).prefault('无近期注入'),

  性交中: z.boolean().prefault(false),
  诱导液中毒回合数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
  强制昏睡中: z.boolean().prefault(false),

  瞬态状态: z.array(z.enum([
    '性交进行中','痉挛高潮','连续高潮','高潮余韵','战后排空',
  ])).prefault(() => []),

  性交记录: z.object({
    最近一次: z.object({
      时间: z.string().prefault('无记录'),
      对象: z.string().prefault('无'),
      对象类型: z.enum(['人类','低级异化体','中级异化体','高级异化体','领主级','植物型','嵌合体','其他']).prefault('人类'),
      性交部位: z.array(z.enum(['生殖道','肛门','口腔','尿道','乳首','阴茎','生殖腔口'])).prefault(() => []),
      持续时长: z.string().prefault('未记录'),
      高潮次数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
      强度等级: z.enum([
        '蜻蜓点水（轻度刺激）',
        '有感觉了（常规性爱）',
        '被狠狠操着（激烈侵犯）',
        '操到合不拢（意识涣散）',
        '被彻底肏烂了（濒临崩溃）',
      ]).prefault('有感觉了（常规性爱）'),
      是否主动: z.boolean().prefault(false),
      源质注入量: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
      林昊评价: z.string().prefault('无评价'),
    }).prefault({
      时间: '无记录', 对象: '无', 对象类型: '人类', 性交部位: [],
      持续时长: '未记录', 高潮次数: 0, 强度等级: '有感觉了（常规性爱）',
      是否主动: false, 源质注入量: 0, 林昊评价: '无评价',
    }),
    影响记录: z.object({
      理智变化: z.coerce.number().prefault(0),
      情热变化: z.coerce.number().prefault(0),
      淫荡变化: z.coerce.number().prefault(0),
      特殊效果: z.array(z.string()).prefault(() => []),
    }).prefault({ 理智变化: 0, 情热变化: 0, 淫荡变化: 0, 特殊效果: [] }),
    累计统计: z.object({
      总次数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
      人类交合次数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
      异化体交合次数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
      总高潮次数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
      最长单次持续: z.string().prefault('无记录'),
      最高单次高潮数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
    }).prefault({ 总次数: 0, 人类交合次数: 0, 异化体交合次数: 0, 总高潮次数: 0, 最长单次持续: '无记录', 最高单次高潮数: 0 }),
  }).prefault({}),

  孕育状态: z.object({
    当前怀孕数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
    总孕育容量: z.coerce.number().transform(v => _.clamp(v, 1, 10)).prefault(5),
    孕育记录: z.record(z.string(), 孕育体Schema).prefault(() => ({})),
    生产历史: z.object({
      总生产次数: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
      总产出数量: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
      最近一次生产: z.object({
        时间: z.string().prefault('无记录'),
        产出种类: z.string().prefault('无'),
        产出数量: z.coerce.number().transform(v => Math.max(0, v)).prefault(0),
        生产部位: z.string().prefault('无'),
        胎儿体型: z.enum(['微型','小型','中型','大型','巨型']).prefault('小型'),
        生产体验: z.enum(['纯粹痛苦','痛苦为主','痛苦与快感交织','快感为主','纯粹快感']).prefault('快感为主'),
      }).prefault({ 时间: '无记录', 产出种类: '无', 产出数量: 0, 生产部位: '无', 胎儿体型: '小型', 生产体验: '快感为主' }),
    }).prefault({}),
  }).prefault({}),
});

export const Schema = z.object({
  林昊:林昊原始Schema.transform(obj => {
    const _心理防线 = obj.理智值 >= 80 ? '铁壁封锁'
      : obj.理智值 >= 60 ? '战术性松动'
      : obj.理智值 >= 40 ? '裂缝蔓延'
      : obj.理智值 >= 20 ? '摇摇欲坠'
      : '彻底沦陷';

    const 孕育体列表 = Object.values(obj.孕育状态.孕育记录);
    const 有临产 = 孕育体列表.some(r => r._当前发育阶段 === '临产期');
    const 有生产中 = 孕育体列表.some(r => r._当前发育阶段 === '生产中');

    const 状态集 = new Set(obj.瞬态状态);

    if (obj.情热值 < 20 && !obj.性交中) {
      if (obj.能量饱食度 < 50) {
        状态集.add('源质饥渴待机');
      } else {
        状态集.add('冷静备战');
      }
    } else if (obj.情热值 >= 20 && obj.情热值 < 40 && !obj.性交中) {
      状态集.add('微热待机');
    } else if (obj.情热值 >= 40 && obj.情热值 < 60) {
      状态集.add('分泌润滑');
    } else if (obj.情热值 >= 60 && obj.情热值 < 80) {
      状态集.add('强制发情');
    } else if (obj.情热值 >= 80) {
      状态集.add('失控发情');
    }

    if (有临产) 状态集.add('孕育阵痛');
    if (有生产中) 状态集.add('生产中');

    if (obj.能量饱食度 < 20 && obj.腹腔积液量 < 10) {
      状态集.add('源质饥渴');
    }

    if (obj.诱导液中毒回合数 >= 3) {
      状态集.add('诱导液中毒');
    }

    const 昏睡有效 = obj.强制昏睡中 && obj.理智值 < 20;
    if (昏睡有效) {
      状态集.add('强制昏睡');
    }

    const _腹腔积液变化 = obj.性交记录.最近一次.源质注入量;

    return {
      ...obj,
      _心理防线,
      _生理状态: Array.from(状态集),
      性交记录: {
        ...obj.性交记录,
        影响记录: {
          ...obj.性交记录.影响记录,
          _腹腔积液变化,
        },
      },
      强制昏睡中: 昏睡有效,};
  }),


  世界: z.object({
    异化体诱导液浓度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    当前战况: z.enum(['安全休整','野外行军','遭遇异化体','被捕获交配中','巢穴深处囚禁']).prefault('安全休整'),
    当前时间: z.string().prefault('未知'),
    当前位置: z.string().prefault('未知'),
  }),

  情报库: z.record(
    z.string().describe('异化体编号，如 H-001'),
    z.object({
      名称: z.string(),
      分类: z.enum(['植物型','动物型','类人型','微型侵入体','嵌合体','未分类']),
      威胁: z.enum(['低级','中级','高级','领主级','未知']),
      记录时间: z.string(),
      记录地点: z.string(),
      简述: z.string(),
    })
  ).prefault(() => ({})),
});

$(() => {
  registerMvuSchema(Schema);
});
