<template>
  <div class="intel-panel ghost-terminal" :class="{ 'shutting-down': isClosing }">
    <!-- 开机序列动画 -->
    <div v-if="isBooting" class="boot-screen">
      <div class="boot-line" v-for="(line, index) in bootLines" :key="index">{{ line }}</div>
      <div class="cursor">_</div>
    </div>

    <!-- 数据库主界面 -->
    <div v-else class="main-screen">
      <div class="intel-header">
        <div class="header-left">
          <span class="status-dot"></span>
          <span class="intel-title">幽灵协议 ◈ 异化体数据库</span>
        </div>
        <div class="header-right">
          <span class="intel-count">已收录: {{ entries.length }} 条</span>
          <span class="intel-close" @click="closePanel" title="切断神经链路">✕</span>
        </div>
      </div>

      <!-- 背景设定补充信息栏 -->
      <div class="intel-sub-header">
        <span class="sub-item">操作者: <span class="highlight">GHOST_RESEARCHER</span></span>
        <span class="sub-item">
          观测目标:
          <span v-if="!isEditingTarget" class="highlight editable" @click="startEditTarget" title="点击修改目标名称">{{ targetName }}</span>
          <input
            v-else
            type="text"
            class="target-input"
            v-model="editTargetInput"
            @blur="saveTargetName"
            @keyup.enter="saveTargetName"
            @keyup.esc="cancelEditTarget"
            v-focus
          />
        </span>
        <span class="sub-item">数据解析度: <span class="highlight-green">{{ dbIntegrity }}%</span></span>
      </div>

      <div id="intel-content">
        <div v-if="entries.length === 0" class="intel-empty">
          <div class="empty-icon">⚠</div>
          <div>[ 核心库为空 ]</div>
          <div class="empty-subtext">等待观测对象({{ targetName }})采集并回传生物样本...</div>
        </div>
        <template v-else>
          <div class="intel-filters">
            <button
              class="filter-btn"
              :class="{ active: currentFilter === 'all' }"
              @click="currentFilter = 'all'"
            >
              全域扫描
            </button>
            <button
              v-for="cls in availableClasses"
              :key="cls.name"
              class="filter-btn"
              :class="{ active: currentFilter === cls.name }"
              @click="currentFilter = cls.name"
            >
              {{ cls.name }} ({{ cls.count }})
            </button>
          </div>
          <div class="intel-body">
            <div v-if="filteredEntries.length === 0" class="intel-empty">
              [ 扫描完毕 ] 该象限下暂无匹配记录
            </div>
            <div v-else class="intel-entry" v-for="entry in filteredEntries" :key="entry.id">
              <div class="intel-row-main">
                <span class="intel-id">[{{ entry.id }}]</span>
                <span class="intel-name">{{ entry.data.名称 }}</span>
                <div class="intel-tags">
                  <span class="tag tag-class">{{ entry.data.分类 }}</span>
                  <span :class="['tag', 'tag-threat-' + entry.data.威胁]">{{ entry.data.威胁 }}</span>
                </div>
              </div>
              <div class="intel-row-detail">
                <span class="intel-meta">
                  <span class="meta-icon"><i class="fa-solid fa-location-dot"></i></span> {{ entry.data.记录地点 || '未知坐标' }}<br>
                  <span class="meta-icon"><i class="fa-regular fa-clock"></i></span> {{ entry.data.记录时间 || '未知时刻' }}
                </span>
                <span class="intel-desc">{{ entry.data.简述 || '—' }}</span>
              </div>
            </div>
          </div>
          <div class="intel-footer">
            <span class="intel-stat-title">当前收录威胁级比率 //</span>
            <span class="intel-stat" v-if="threatStatsText" v-html="threatStatsText"></span>
            <span class="intel-stat" v-else>扫描数据不足</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['close']);
const isClosing = ref(false);
const closePanel = () => {
  if (isClosing.value) return;
  isClosing.value = true;
  setTimeout(() => {
    emit('close');
    setTimeout(() => { isClosing.value = false; }, 100);
  }, 350); // 与 CSS 动画时长一致
};

const isBooting = ref(true);
const bootLines = ref<string[]>([]);
const currentFilter = ref('all');

const getStoredName = () => {
  try {
    return window.parent.localStorage.getItem('ghost_terminal_target_name') || '林昊';
  } catch (e) {
    return '林昊';
  }
};

const setStoredName = (name: string) => {
  try {
    window.parent.localStorage.setItem('ghost_terminal_target_name', name);
  } catch (e) {
    console.error('Cannot save to localStorage', e);
  }
};

const targetName = ref(getStoredName());
const isEditingTarget = ref(false);
const editTargetInput = ref('');

const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
};

const startEditTarget = () => {
  isEditingTarget.value = true;
  editTargetInput.value = targetName.value;
};

const saveTargetName = () => {
  if (editTargetInput.value.trim()) {
    targetName.value = editTargetInput.value.trim();
    setStoredName(targetName.value);
  }
  isEditingTarget.value = false;
};

const cancelEditTarget = () => {
  isEditingTarget.value = false;
};

const intelData = ref<Record<string, any>>({});

const entries = computed(() => {
  return Object.entries(intelData.value).map(([id, data]) => ({ id, data }));
});

const dbIntegrity = computed(() => {
  // 根据 150 个条目算 100% 完整度
  const pct = (entries.value.length / 150) * 100;
  return Math.min(100, pct).toFixed(1);
});

const availableClasses = computed(() => {
  const classCounts: Record<string, number> = {};
  entries.value.forEach(entry => {
    const cls = entry.data.分类 || '未分类';
    classCounts[cls] = (classCounts[cls] || 0) + 1;
  });

  const order = ['植物型', '动物型', '类人型', '微型侵入体', '嵌合体', '未分类'];
  return order
    .filter(name => classCounts[name])
    .map(name => ({ name, count: classCounts[name] }));
});

const filteredEntries = computed(() => {
  if (currentFilter.value === 'all') return entries.value;
  return entries.value.filter(entry => entry.data.分类 === currentFilter.value);
});

const threatStatsText = computed(() => {
  const threatCounts: Record<string, number> = {};
  entries.value.forEach(entry => {
    const t = entry.data.威胁 || '未知';
    threatCounts[t] = (threatCounts[t] || 0) + 1;
  });

  const order = ['低级', '中级', '高级', '领主级'];
  let text = '';
  order.forEach(t => {
    if (threatCounts[t]) {
      text += `<span class="stat-item">${t}:<span class="stat-num">${threatCounts[t]}</span></span>`;
    }
  });
  return text;
});

const updateData = () => {
  try {
    if (window.Mvu) {
      const all_variables = window.Mvu.getMvuData({ type: 'chat' });
      intelData.value = window._?.get(all_variables, 'stat_data.情报库', {}) || {};
    } else {
      if (typeof window.getAllVariables === 'function') {
        const all_variables = window.getAllVariables();
        intelData.value = window._?.get(all_variables, 'stat_data.情报库', {}) || {};
      }
    }
  } catch (e) {
    console.error('Error updating intel data:', e);
  }
};

let updateInterval: number;

onMounted(async () => {
  if (typeof window.waitGlobalInitialized === 'function') {
    await window.waitGlobalInitialized('Mvu');
  }
  updateData();
  updateInterval = window.setInterval(updateData, 2000);

  // 模拟开机链接序列
  setTimeout(() => bootLines.value.push("> 神经接驳中..."), 100);
  setTimeout(() => bootLines.value.push("> 正在验证身份..."), 500);
  setTimeout(() => bootLines.value.push("> 协议确认：[ 幽灵协议 - 无效目标 ]"), 900);
  setTimeout(() => bootLines.value.push(`> 正在建立与观测对象 [${targetName.value}] 的遥测链路... OK`), 1400);
  setTimeout(() => bootLines.value.push("> 异化体数据库 解密完毕。"), 1900);
  setTimeout(() => { isBooting.value = false; }, 2300);
});

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval);
});
</script>

<style scoped>
/* ═══════ 全局字体与扫描线覆盖 ═══════ */
.ghost-terminal {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
    width: 100%;
    height: 100vh; /* 使用 100vh 确保占满整个 iframe 高度 */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 0;
    border: 1px solid rgba(0, 200, 255, 0.25);
    border-radius: 6px;
    background: linear-gradient(135deg, #06090e 0%, #0a111a 100%);
    overflow: hidden;
    box-shadow: 0 0 30px rgba(0, 150, 255, 0.15), inset 0 0 10px rgba(0, 200, 255, 0.1);
    position: relative;
    transform-origin: center;
}

.ghost-terminal.shutting-down {
    animation: disconnect 0.35s ease-in forwards;
}
@keyframes disconnect {
    0% { opacity: 1; filter: contrast(1) blur(0px); transform: scale(1); }
    20% { opacity: 0.8; filter: contrast(1.5) blur(2px) drop-shadow(0 0 10px rgba(0, 255, 255, 0.8)); transform: scale(1.02) skewX(2deg); }
    100% { opacity: 0; filter: contrast(2) blur(8px); transform: scale(0.95) translateY(10px); }
}

/* 屏幕扫描线滤镜 */
.ghost-terminal::after {
    content: "";
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%);
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 999;
    opacity: 0.7;
}

/* ═══════ 开机动画界面 ═══════ */
.boot-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 30px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    color: #5ec4e6;
    text-shadow: 0 0 5px rgba(94, 196, 230, 0.6);
    position: relative;
    z-index: 10;
}
.boot-line {
    margin-bottom: 10px;
    animation: typing 0.2s ease-out;
}
.cursor {
    display: inline-block;
    width: 10px;
    height: 14px;
    background-color: #5ec4e6;
    animation: blink 1s step-end infinite;
    margin-top: 4px;
}
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
@keyframes typing {
    from { opacity: 0; transform: translateX(-5px); }
    to { opacity: 1; transform: translateX(0); }
}

/* ═══════ 数据库主界面 ═══════ */
.main-screen {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    z-index: 10;
    overflow: hidden;
    min-height: 0;
}

.intel-header {
    background: linear-gradient(90deg, rgba(0, 150, 255, 0.2), rgba(0, 80, 150, 0.05));
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 200, 255, 0.15);
    user-select: none;
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}
.header-right {
    display: flex;
    align-items: center;
    gap: 14px;
}

.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #4cd47a;
    box-shadow: 0 0 8px #4cd47a;
    animation: pulse-green 1.5s infinite;
}
@keyframes pulse-green {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
}

.intel-title {
    color: #5ec4e6;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-shadow: 0 0 6px rgba(94, 196, 230, 0.4);
}

.intel-count {
    color: #3a9fc2;
    font-size: 12px;
    background: rgba(0, 150, 255, 0.1);
    padding: 4px 12px;
    border-radius: 12px;
    border: 1px solid rgba(0, 200, 255, 0.2);
    font-family: 'Consolas', monospace;
}

.intel-close {
    color: #5ec4e6;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
    line-height: 1;
}
.intel-close:hover {
    color: #e04060;
    text-shadow: 0 0 8px rgba(224, 64, 96, 0.6);
    transform: scale(1.15) rotate(90deg);
}

/* 补充信息栏 */
.intel-sub-header {
    padding: 8px 18px;
    background: rgba(0, 150, 255, 0.03);
    border-bottom: 1px dashed rgba(0, 200, 255, 0.1);
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #4a8ea8;
    letter-spacing: 0.5px;
    flex-shrink: 0;
}
.sub-item {
    display: flex;
    align-items: center;
    gap: 4px;
}
.highlight {
    color: #5ec4e6;
    font-weight: 600;
}
.highlight-green {
    color: #4cd47a;
    font-weight: 600;
    font-family: 'Consolas', monospace;
}

.editable {
    cursor: pointer;
    border-bottom: 1px dashed rgba(94, 196, 230, 0.4);
    transition: all 0.2s;
    padding-bottom: 1px;
}
.editable:hover {
    color: #fff;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
    border-bottom-color: #fff;
}

.target-input {
    background: rgba(0, 150, 255, 0.1);
    border: 1px solid rgba(94, 196, 230, 0.5);
    color: #5ec4e6;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 3px;
    outline: none;
    width: 70px;
    font-family: inherit;
    font-weight: 600;
}
.target-input:focus {
    border-color: #5ec4e6;
    box-shadow: 0 0 5px rgba(94, 196, 230, 0.3);
}

#intel-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-height: 0;
}

.intel-filters {
    padding: 10px 18px;
    border-bottom: 1px solid rgba(0, 200, 255, 0.08);
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    flex-shrink: 0;
}
.filter-btn {
    background: rgba(0, 150, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.15);
    color: #4a8ea8;
    font-size: 12px;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    letter-spacing: 0.5px;
}
.filter-btn:hover, .filter-btn.active {
    background: rgba(0, 150, 255, 0.2);
    color: #bce4f4;
    border-color: #5ec4e6;
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.2);
}

.intel-body {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 150, 255, 0.3) transparent;
    padding: 4px 0;
    min-height: 0;
}
.intel-body::-webkit-scrollbar {
    width: 6px;
}
.intel-body::-webkit-scrollbar-thumb {
    background: rgba(0, 150, 255, 0.3);
    border-radius: 3px;
}

.intel-empty {
    padding: 50px 20px;
    text-align: center;
    color: #2a5a6a;
    font-size: 13px;
    letter-spacing: 1px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}
.empty-icon {
    font-size: 28px;
    color: #4a8ea8;
    opacity: 0.5;
    margin-bottom: 4px;
}
.empty-subtext {
    font-size: 11px;
    color: #2a5a6a;
    opacity: 0.7;
}

.intel-entry {
    padding: 14px 18px;
    border-bottom: 1px solid rgba(0, 200, 255, 0.05);
    transition: background 0.2s;
}
.intel-entry:hover {
    background: linear-gradient(90deg, rgba(0, 150, 255, 0.06), transparent);
    border-left: 2px solid #5ec4e6;
    padding-left: 16px;
}
.intel-entry:last-child {
    border-bottom: none;
}

.intel-row-main {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}
.intel-id {
    color: #4a8ea8;
    font-size: 12px;
    font-family: 'Consolas', monospace;
    min-width: 50px;
}
.intel-name {
    color: #dbeef5;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
    letter-spacing: 1px;
    text-shadow: 0 0 4px rgba(219, 238, 245, 0.3);
}
.intel-tags {
    display: flex;
    gap: 6px;
    margin-left: auto;
}
.tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 3px;
    letter-spacing: 0.5px;
    font-weight: 600;
}
.tag-class {
    background: rgba(0, 180, 255, 0.1);
    color: #5ec4e6;
    border: 1px solid rgba(0, 180, 255, 0.2);
}
.tag-threat-低级 {
    background: rgba(100, 200, 100, 0.1);
    color: #6cc96c;
    border: 1px solid rgba(100, 200, 100, 0.2);
}
.tag-threat-中级 {
    background: rgba(220, 180, 50, 0.1);
    color: #d4b438;
    border: 1px solid rgba(220, 180, 50, 0.2);
}
.tag-threat-高级 {
    background: rgba(240, 100, 50, 0.1);
    color: #e07040;
    border: 1px solid rgba(240, 100, 50, 0.2);
}
.tag-threat-领主级 {
    background: rgba(200, 50, 80, 0.15);
    color: #e04060;
    border: 1px solid rgba(200, 50, 80, 0.25);
    box-shadow: 0 0 8px rgba(224, 64, 96, 0.3);
}
.tag-threat-未知 {
    background: rgba(150, 150, 150, 0.1);
    color: #888;
    border: 1px solid rgba(150, 150, 150, 0.2);
}

.intel-row-detail {
    display: flex;
    gap: 16px;
    padding-left: 60px;
}
.intel-meta {
    color: #3a758c;
    font-size: 11px;
    flex-shrink: 0;
    min-width: 140px;
    line-height: 1.6;
}
.meta-icon {
    display: inline-block;
    width: 16px;
    text-align: center;
    color: #4a8ea8;
    margin-right: 2px;
}
.intel-desc {
    color: #7cb3c7;
    font-size: 12px;
    line-height: 1.6;
    flex: 1;
    background: rgba(0, 150, 255, 0.03);
    padding: 6px 10px;
    border-radius: 4px;
    border-left: 2px solid rgba(0, 150, 255, 0.15);
}

.intel-footer {
    padding: 10px 18px;
    background: rgba(0, 10, 20, 0.8);
    border-top: 1px solid rgba(0, 200, 255, 0.15);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 12px;
}
.intel-stat-title {
    color: #4a8ea8;
    font-size: 11px;
    font-weight: 600;
}
.intel-stat {
    color: #3a758c;
    font-size: 11px;
    letter-spacing: 0.5px;
    display: flex;
    gap: 12px;
}
:deep(.stat-item) {
    display: flex;
    align-items: center;
    gap: 4px;
}
:deep(.stat-num) {
    color: #5ec4e6;
    font-family: 'Consolas', monospace;
    font-size: 13px;
    font-weight: 600;
}
</style>
