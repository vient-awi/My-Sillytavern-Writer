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
          <div class="empty-subtext">等待观测目标({{ targetName }})采集并回传生物样本...</div>
          <button class="add-entry-btn" @click="showAddModal = true">
            <i class="fas fa-plus"></i> 记录新发现
          </button>
        </div>
        <template v-else>
          <!-- 搜索和工具栏 -->
          <div class="intel-toolbar">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                class="search-input"
                v-model="searchQuery"
                placeholder="搜索编号/名称/地点..."
                @input="expandedId = null"
              />
              <i v-if="searchQuery" class="fas fa-times clear-icon" @click="searchQuery = ''; expandedId = null"></i>
            </div>
            <div class="sort-box">
              <span class="sort-label">排序:</span>
              <select class="sort-select" v-model="sortBy" @change="expandedId = null">
                <option value="id-asc">编号 ↑</option>
                <option value="id-desc">编号 ↓</option>
                <option value="time-desc">最新记录</option>
                <option value="time-asc">最旧记录</option>
                <option value="threat-desc">威胁 ↓</option>
                <option value="threat-asc">威胁 ↑</option>
                <option value="name-asc">名称 A-Z</option>
              </select>
            </div>
            <button class="add-entry-btn" @click="showAddModal = true" title="记录新发现的异化体">
              <i class="fas fa-plus"></i>
            </button>
            <button class="stats-toggle-btn" @click="showStatsPanel = !showStatsPanel" title="详细统计" :class="{ active: showStatsPanel }">
              <i class="fas fa-chart-pie"></i>
            </button>
          </div>

          <!-- 筛选按钮 -->
          <div class="intel-filters">
            <button
              class="filter-btn"
              :class="{ active: currentFilter === 'all' }"
              @click="currentFilter = 'all'; expandedId = null"
            >
              全域扫描
            </button>
            <button
              v-for="cls in availableClasses"
              :key="cls.name"
              class="filter-btn"
              :class="{ active: currentFilter === cls.name }"
              @click="currentFilter = cls.name; expandedId = null"
            >
              {{ cls.name }} ({{ cls.count }})
            </button>
          </div>

          <!-- 详细统计面板 -->
          <Transition name="stats-expand">
            <div v-show="showStatsPanel" class="stats-panel">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-card-title">威胁等级分布</div>
                  <div class="stat-card-content">
                    <div v-for="threat in threatDistribution" :key="threat.name" class="stat-bar-item">
                      <span class="stat-bar-label">{{ threat.name }}</span>
                      <div class="stat-bar-wrapper">
                        <div class="stat-bar" :class="'stat-bar-' + threat.name" :style="{ width: threat.percent + '%' }"></div>
                      </div>
                      <span class="stat-bar-value">{{ threat.count }} ({{ threat.percent }}%)</span>
                    </div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-card-title">地点分布 TOP5</div>
                  <div class="stat-card-content">
                    <div v-for="loc in topLocations" :key="loc.name" class="stat-bar-item">
                      <span class="stat-bar-label">{{ loc.name }}</span>
                      <div class="stat-bar-wrapper">
                        <div class="stat-bar stat-bar-location" :style="{ width: loc.percent + '%' }"></div>
                      </div>
                      <span class="stat-bar-value">{{ loc.count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
          <div class="intel-body">
            <div v-if="filteredEntries.length === 0" class="intel-empty">
              [ 扫描完毕 ] {{ searchQuery ? '未找到匹配的记录' : '该象限下暂无匹配记录' }}
            </div>
            <div v-else class="intel-entry" v-for="entry in filteredEntries" :key="entry.id">
              <div class="intel-row-main" @click="toggleEntry(entry.id)">
                <span class="intel-id">[{{ entry.id }}]</span>
                <span class="intel-name">{{ entry.data.名称 }}</span>
                <span class="meta-item meta-inline">
                  <span class="meta-icon"><i class="fa-solid fa-location-dot"></i></span>
                  <span class="meta-value">{{ entry.data.记录地点 || '未知' }}</span>
                </span>
                <span class="meta-item meta-inline">
                  <span class="meta-icon"><i class="fa-regular fa-clock"></i></span>
                  <span class="meta-value">{{ entry.data.记录时间 || '未知' }}</span>
                </span>
                <div class="intel-tags">
                  <span class="tag tag-class">{{ entry.data.分类 }}</span>
                  <span :class="['tag', 'tag-threat-' + entry.data.威胁]">{{ entry.data.威胁 }}</span>
                </div>
                <button class="edit-btn" @click.stop="startEdit(entry)" title="编辑情报">
                  <i class="fas fa-edit"></i>
                </button>
                <span class="expand-indicator" :class="{ expanded: expandedId === entry.id }">▼</span>
              </div>
              <Transition name="detail-expand">
                <div v-show="expandedId === entry.id" class="intel-row-detail">
                  <span class="intel-desc">{{ entry.data.简述 || '—' }}</span>
                </div>
              </Transition>
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

    <!-- 编辑/新增模态框 -->
    <Transition name="modal-fade">
      <div v-if="showAddModal || editingEntry" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">{{ editingEntry ? '编辑情报' : '记录新发现' }}</span>
            <span class="modal-close" @click="closeModal">✕</span>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>编号</label>
              <input type="text" v-model="formData.id" :disabled="!!editingEntry" placeholder="例: H-001" />
            </div>
            <div class="form-group">
              <label>名称 *</label>
              <input type="text" v-model="formData.名称" placeholder="异化体名称" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>分类 *</label>
                <select v-model="formData.分类">
                  <option value="植物型">植物型</option>
                  <option value="动物型">动物型</option>
                  <option value="类人型">类人型</option>
                  <option value="微型侵入体">微型侵入体</option>
                  <option value="嵌合体">嵌合体</option>
                  <option value="未分类">未分类</option>
                </select>
              </div>
              <div class="form-group">
                <label>威胁等级 *</label>
                <select v-model="formData.威胁">
                  <option value="低级">低级</option>
                  <option value="中级">中级</option>
                  <option value="高级">高级</option>
                  <option value="领主级">领主级</option>
                  <option value="未知">未知</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>记录地点</label>
                <input type="text" v-model="formData.记录地点" placeholder="发现地点" />
              </div>
              <div class="form-group">
                <label>记录时间</label>
                <input type="text" v-model="formData.记录时间" placeholder="例: 2026年7月25日" />
              </div>
            </div>
            <button v-if="!editingEntry" class="auto-fill-btn" @click="autoFillFromChat" title="从最新AI回复中提取时间、地点信息">
              <i class="fas fa-magic"></i> 智能填充
            </button>
            <div class="form-group">
              <label>简述</label>
              <textarea v-model="formData.简述" placeholder="详细描述该异化体的特征、行为模式等..." rows="4"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-cancel" @click="closeModal">取消</button>
            <button v-if="editingEntry" class="modal-btn modal-btn-delete" @click="confirmDelete">
              <i class="fas fa-trash"></i> 删除
            </button>
            <button class="modal-btn modal-btn-confirm" @click="saveEntry">{{ editingEntry ? '保存修改' : '添加记录' }}</button>
          </div>
        </div>
      </div>
    </Transition>
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
  }, 250);
};

const isBooting = ref(true);
const bootLines = ref<string[]>([]);
const currentFilter = ref('all');
const expandedId = ref<string | null>(null);
const searchQuery = ref('');
const sortBy = ref('id-asc');
const showStatsPanel = ref(false);
const showAddModal = ref(false);
const editingEntry = ref<any>(null);

const formData = ref({
  id: '',
  名称: '',
  分类: '未分类',
  威胁: '未知',
  记录地点: '',
  记录时间: '',
  简述: '',
});

const toggleEntry = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id;
};

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
    // ignore
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

// 威胁等级排序权重
const threatWeight = (threat: string) => {
  const weights: Record<string, number> = { '领主级': 4, '高级': 3, '中级': 2, '低级': 1, '未知': 0 };
  return weights[threat] || 0;
};

// 排序后的条目
const sortedEntries = computed(() => {
  const sorted = [...entries.value];

  switch (sortBy.value) {
    case 'id-asc':
      sorted.sort((a, b) => a.id.localeCompare(b.id));
      break;
    case 'id-desc':
      sorted.sort((a, b) => b.id.localeCompare(a.id));
      break;
    case 'time-desc':
      sorted.sort((a, b) => (b.data.记录时间 || '').localeCompare(a.data.记录时间 || ''));
      break;
    case 'time-asc':
      sorted.sort((a, b) => (a.data.记录时间 || '').localeCompare(b.data.记录时间 || ''));
      break;
    case 'threat-desc':
      sorted.sort((a, b) => threatWeight(b.data.威胁) - threatWeight(a.data.威胁));
      break;
    case 'threat-asc':
      sorted.sort((a, b) => threatWeight(a.data.威胁) - threatWeight(b.data.威胁));
      break;
    case 'name-asc':
      sorted.sort((a, b) => (a.data.名称 || '').localeCompare(b.data.名称 || ''));
      break;
  }

  return sorted;
});

// 搜索和筛选后的条目
const filteredEntries = computed(() => {
  let filtered = sortedEntries.value;

  // 分类筛选
  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(entry => entry.data.分类 === currentFilter.value);
  }

  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(entry =>
      entry.id.toLowerCase().includes(query) ||
      (entry.data.名称 || '').toLowerCase().includes(query) ||
      (entry.data.记录地点 || '').toLowerCase().includes(query)
    );
  }

  return filtered;
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

// 威胁等级分布统计
const threatDistribution = computed(() => {
  const threatCounts: Record<string, number> = {};
  entries.value.forEach(entry => {
    const t = entry.data.威胁 || '未知';
    threatCounts[t] = (threatCounts[t] || 0) + 1;
  });

  const order = ['领主级', '高级', '中级', '低级', '未知'];
  const total = entries.value.length || 1;

  return order
    .filter(name => threatCounts[name])
    .map(name => ({
      name,
      count: threatCounts[name],
      percent: Math.round((threatCounts[name] / total) * 100)
    }));
});

// 地点分布 TOP5
const topLocations = computed(() => {
  const locationCounts: Record<string, number> = {};
  entries.value.forEach(entry => {
    const loc = entry.data.记录地点 || '未知';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const sorted = Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = sorted[0]?.count || 1;

  return sorted.map(item => ({
    ...item,
    percent: Math.round((item.count / maxCount) * 100)
  }));
});

// 开始编辑
const startEdit = (entry: any) => {
  editingEntry.value = entry;
  formData.value = {
    id: entry.id,
    名称: entry.data.名称 || '',
    分类: entry.data.分类 || '未分类',
    威胁: entry.data.威胁 || '未知',
    记录地点: entry.data.记录地点 || '',
    记录时间: entry.data.记录时间 || '',
    简述: entry.data.简述 || '',
  };
};

// 关闭模态框
const closeModal = () => {
  showAddModal.value = false;
  editingEntry.value = null;
  formData.value = {
    id: '',
    名称: '',
    分类: '未分类',
    威胁: '未知',
    记录地点: '',
    记录时间: '',
    简述: '',
  };
};

// 生成新编号
const generateNewId = () => {
  const existingIds = entries.value.map(e => e.id);
  const numberPattern = /H-(\d+)/;
  const numbers = existingIds
    .map(id => {
      const match = id.match(numberPattern);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const newNumber = maxNumber + 1;
  return `H-${String(newNumber).padStart(3, '0')}`;
};

// 从最新AI回复中智能提取信息
const autoFillFromChat = () => {
  try {
    // 获取最新的AI回复消息
    const chatContext = window.parent?.SillyTavern?.getContext?.();
    if (!chatContext || !chatContext.chat) {
      if (window.parent.toastr) {
        window.parent.toastr.warning('无法访问聊天记录', '幽灵协议 ◈ 提示');
      }
      return;
    }

    // 从后往前找最新的AI消息
    const messages = chatContext.chat;
    let lastAIMessage = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].is_user) {
        lastAIMessage = messages[i].mes;
        break;
      }
    }

    if (!lastAIMessage) {
      if (window.parent.toastr) {
        window.parent.toastr.warning('未找到AI回复消息', '幽灵协议 ◈ 提示');
      }
      return;
    }

    // 提取 StatusBar 中的信息
    const statusBarMatch = lastAIMessage.match(/<StatusBar>([\s\S]*?)<\/StatusBar>/);
    if (!statusBarMatch) {
      if (window.parent.toastr) {
        window.parent.toastr.warning('未找到状态栏信息', '幽灵协议 ◈ 提示');
      }
      return;
    }

    const statusBarContent = statusBarMatch[1];

    // 提取 <Node>
    const nodeMatch = statusBarContent.match(/<Node>(.*?)<\/Node>/);
    if (nodeMatch && !formData.value.记录地点) {
      formData.value.记录地点 = nodeMatch[1].trim();
    }

    // 提取 <Date> 和 <Time> 并组合
    const dateMatch = statusBarContent.match(/<Date>(.*?)<\/Date>/);
    const timeMatch = statusBarContent.match(/<Time>(.*?)<\/Time>/);

    if ((dateMatch || timeMatch) && !formData.value.记录时间) {
      let timeString = '';
      if (dateMatch) {
        // 转换格式：2074.10.14 -> 2074-10-14
        const dateStr = dateMatch[1].trim();
        const dateParts = dateStr.split('.');
        if (dateParts.length === 3) {
          timeString = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
        } else {
          timeString = dateStr;
        }
      }
      if (timeMatch) {
        timeString += (timeString ? ' ' : '') + timeMatch[1].trim();
      }
      formData.value.记录时间 = timeString;
    }

    if (window.parent.toastr) {
      window.parent.toastr.success('已提取状态栏信息', '幽灵协议 ◈ 成功');
    }
  } catch (e) {
    // ignore
    if (window.parent.toastr) {
      window.parent.toastr.error('提取失败，请手动填写', '幽灵协议 ◈ 错误');
    }
  }
};

// 删除确认
const confirmDelete = () => {
  if (!editingEntry.value) return;

  if (window.parent.confirm(`确定要删除编号为 ${editingEntry.value.id} 的情报吗？\n\n此操作无法撤销！`)) {
    deleteEntry(editingEntry.value.id);
  }
};

// 删除条目
const deleteEntry = async (entryId: string) => {
  try {
    if (window.Mvu) {
      // 获取最新消息楼层的数据
      const mvuData = window.Mvu.getMvuData({ type: 'message', message_id: 'latest' });

      // 删除条目
      window._?.unset(mvuData, `stat_data.情报库.${entryId}`);

      // 写回最新消息楼层
      await window.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    } else if (typeof window.setVariable === 'function') {
      window.setVariable('stat_data.情报库.' + entryId, null);
    }

    if (window.parent.toastr) {
      window.parent.toastr.success(`已删除编号: ${entryId}`, '幽灵协议 ◈ 成功');
    }

    closeModal();
    updateData();
  } catch (e) {
    // ignore
    if (window.parent.toastr) {
      window.parent.toastr.error('删除失败', '幽灵协议 ◈ 错误');
    }
  }
};

// 保存条目
const saveEntry = async () => {
  // 只验证必填字段
  if (!formData.value.名称.trim()) {
    if (window.parent.toastr) {
      window.parent.toastr.error('名称不能为空', '幽灵协议 ◈ 错误');
    }
    return;
  }

  try {
    let targetId = formData.value.id.trim();

    // 如果是新增且没有填写编号，自动生成
    if (!editingEntry.value && !targetId) {
      targetId = generateNewId();
    }

    if (!targetId) {
      if (window.parent.toastr) {
        window.parent.toastr.error('编号不能为空', '幽灵协议 ◈ 错误');
      }
      return;
    }

    // 检查编号冲突（仅在新增时）
    if (!editingEntry.value && intelData.value[targetId]) {
      if (window.parent.toastr) {
        window.parent.toastr.error(`编号 ${targetId} 已存在`, '幽灵协议 ◈ 错误');
      }
      return;
    }

    // 构建条目，所有字段必须是字符串（符合 Zod schema）
    const newEntry: any = {
      名称: formData.value.名称.trim(),
      分类: formData.value.分类,
      威胁: formData.value.威胁,
      记录地点: formData.value.记录地点.trim(),
      记录时间: formData.value.记录时间.trim(),
      简述: formData.value.简述.trim(),
    };

    // 更新数据
    if (window.Mvu) {

      // 获取最新消息楼层的完整 Mvu 数据
      const mvuData = window.Mvu.getMvuData({ type: 'message', message_id: 'latest' });

      // 使用 _.set 设置单个条目
      window._?.set(mvuData, `stat_data.情报库.${targetId}`, newEntry);

      // 写回最新消息楼层
      await window.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    } else if (typeof window.setVariable === 'function') {
      window.setVariable('stat_data.情报库.' + targetId, newEntry);
    }

    if (window.parent.toastr) {
      const action = editingEntry.value ? '更新成功' : '已添加新记录';
      window.parent.toastr.success(`编号: ${targetId}`, `幽灵协议 ◈ ${action}`);
    }

    closeModal();
    updateData();
  } catch (e) {
    if (window.parent.toastr) {
      window.parent.toastr.error(`操作失败: ${e.message}`, '幽灵协议 ◈ 错误');
    }
  }
};

const updateData = () => {
  try {
    if (window.Mvu) {
      const mvuData = window.Mvu.getMvuData({ type: 'message', message_id: 'latest' });

      const newIntelData = window._?.get(mvuData, 'stat_data.情报库', {}) || {};
      intelData.value = newIntelData;
    } else {
      if (typeof window.getAllVariables === 'function') {
        const all_variables = window.getAllVariables();
        intelData.value = window._?.get(all_variables, 'stat_data.情报库', {}) || {};
      }
    }
  } catch (e) {
    // ignore
  }
};

let updateInterval: number;

onMounted(async () => {
  if (typeof window.waitGlobalInitialized === 'function') {
    await window.waitGlobalInitialized('Mvu');
  }
  updateData();
  updateInterval = window.setInterval(updateData, 2000);

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
    animation: fade-scale-out 0.25s ease-in forwards;
}
@keyframes fade-scale-out {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.92); }
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
    flex-wrap: wrap;
    gap: 8px;
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

/* 工具栏（搜索、排序、按钮） */
.intel-toolbar {
    padding: 12px 18px;
    border-bottom: 1px solid rgba(0, 200, 255, 0.08);
    display: flex;
    gap: 10px;
    align-items: center;
    flex-shrink: 0;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 300px;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #4a8ea8;
    font-size: 12px;
    pointer-events: none;
}

.search-input {
    width: 100%;
    background: rgba(0, 150, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.15);
    color: #bce4f4;
    font-size: 12px;
    padding: 6px 30px 6px 32px;
    border-radius: 4px;
    outline: none;
    font-family: inherit;
    transition: all 0.2s;
}

.search-input:focus {
    border-color: #5ec4e6;
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.2);
    background: rgba(0, 150, 255, 0.08);
}

.search-input::placeholder {
    color: #4a8ea8;
}

.clear-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #4a8ea8;
    font-size: 12px;
    cursor: pointer;
    transition: color 0.2s;
}

.clear-icon:hover {
    color: #5ec4e6;
}

.sort-box {
    display: flex;
    align-items: center;
    gap: 6px;
}

.sort-label {
    color: #4a8ea8;
    font-size: 12px;
    white-space: nowrap;
}

.sort-select {
    background: rgba(0, 150, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.15);
    color: #bce4f4;
    font-size: 12px;
    padding: 6px 8px;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
}

.sort-select:hover, .sort-select:focus {
    border-color: #5ec4e6;
    background: rgba(0, 150, 255, 0.1);
}

.add-entry-btn {
    background: rgba(0, 180, 255, 0.15);
    border: 1px solid rgba(0, 200, 255, 0.3);
    color: #5ec4e6;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    font-weight: 600;
    white-space: nowrap;
}

.add-entry-btn:hover {
    background: rgba(0, 180, 255, 0.25);
    border-color: #5ec4e6;
    box-shadow: 0 0 12px rgba(0, 180, 255, 0.3);
    transform: translateY(-1px);
}

.stats-toggle-btn {
    background: rgba(0, 150, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.15);
    color: #4a8ea8;
    font-size: 14px;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
}

.stats-toggle-btn:hover, .stats-toggle-btn.active {
    background: rgba(0, 150, 255, 0.15);
    border-color: #5ec4e6;
    color: #5ec4e6;
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.2);
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

/* 统计面板 */
.stats-panel {
    background: rgba(0, 10, 20, 0.6);
    border-bottom: 1px solid rgba(0, 200, 255, 0.08);
    padding: 16px 18px;
    flex-shrink: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
}

.stat-card {
    background: rgba(0, 150, 255, 0.03);
    border: 1px solid rgba(0, 200, 255, 0.1);
    border-radius: 4px;
    padding: 12px;
}

.stat-card-title {
    color: #5ec4e6;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 10px;
    letter-spacing: 0.5px;
}

.stat-card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.stat-bar-item {
    display: grid;
    grid-template-columns: 80px 1fr 60px;
    gap: 8px;
    align-items: center;
    font-size: 11px;
}

.stat-bar-label {
    color: #7cb3c7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stat-bar-wrapper {
    height: 18px;
    background: rgba(0, 150, 255, 0.08);
    border-radius: 3px;
    overflow: hidden;
}

.stat-bar {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 3px;
}

.stat-bar-低级 {
    background: linear-gradient(90deg, rgba(100, 200, 100, 0.6), rgba(100, 200, 100, 0.3));
}

.stat-bar-中级 {
    background: linear-gradient(90deg, rgba(220, 180, 50, 0.6), rgba(220, 180, 50, 0.3));
}

.stat-bar-高级 {
    background: linear-gradient(90deg, rgba(240, 100, 50, 0.6), rgba(240, 100, 50, 0.3));
}

.stat-bar-领主级 {
    background: linear-gradient(90deg, rgba(224, 64, 96, 0.7), rgba(224, 64, 96, 0.4));
    box-shadow: 0 0 8px rgba(224, 64, 96, 0.3);
}

.stat-bar-未知 {
    background: linear-gradient(90deg, rgba(150, 150, 150, 0.4), rgba(150, 150, 150, 0.2));
}

.stat-bar-location {
    background: linear-gradient(90deg, rgba(0, 180, 255, 0.5), rgba(0, 180, 255, 0.2));
}

.stat-bar-value {
    color: #5ec4e6;
    font-family: 'Consolas', monospace;
    text-align: right;
}

.stats-expand-enter-active, .stats-expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.stats-expand-enter-from, .stats-expand-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.stats-expand-enter-to, .stats-expand-leave-from {
    max-height: 300px;
    opacity: 1;
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
    padding: 10px 18px;
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
    gap: 8px;
    cursor: pointer;
    transition: background 0.2s;
    padding: 4px 0;
}
.intel-row-main:hover {
    background: rgba(0, 150, 255, 0.05);
}
.expand-indicator {
    color: #4a8ea8;
    font-size: 10px;
    transition: transform 0.2s;
    margin-left: 8px;
}
.expand-indicator.expanded {
    transform: rotate(180deg);
}
.intel-row-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 0 4px 50px;
    font-size: 11px;
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #3a758c;
    min-width: 0;
}
.meta-inline {
    font-size: 10px;
    color: #3a758c;
    flex-shrink: 1;
    min-width: 0;
    max-width: 150px;
}
.meta-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    color: #4a8ea8;
    flex-shrink: 0;
    font-size: 10px;
}
.meta-value {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.intel-location,
.intel-time {
    color: #3a758c;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
}
.intel-id {
    color: #4a8ea8;
    font-size: 12px;
    font-family: 'Consolas', monospace;
    width: 60px;
    flex-shrink: 0;
}
.intel-name {
    color: #dbeef5;
    font-size: 13px;
    font-weight: 600;
    width: 120px;
    flex-shrink: 0;
    letter-spacing: 0.5px;
    text-shadow: 0 0 4px rgba(219, 238, 245, 0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.intel-tags {
    display: flex;
    gap: 5px;
    margin-left: auto;
    align-items: center;
}
.edit-btn {
    background: rgba(0, 150, 255, 0.1);
    border: 1px solid rgba(0, 200, 255, 0.2);
    color: #4a8ea8;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}
.edit-btn:hover {
    background: rgba(0, 150, 255, 0.2);
    border-color: #5ec4e6;
    color: #5ec4e6;
    transform: translateY(-1px);
}
.tag {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 3px;
    letter-spacing: 0.3px;
    font-weight: 600;
    white-space: nowrap;
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
    padding-left: 60px;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-right: 12px;
}

/* 折叠展开过渡 */
.detail-expand-enter-active,
.detail-expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}
.detail-expand-enter-from,
.detail-expand-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
}
.detail-expand-enter-to,
.detail-expand-leave-from {
    max-height: 100px;
    opacity: 1;
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

/* 模态框 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
}

.modal-content {
    background: linear-gradient(135deg, #06090e 0%, #0a111a 100%);
    border: 1px solid rgba(0, 200, 255, 0.3);
    border-radius: 6px;
    box-shadow: 0 0 40px rgba(0, 150, 255, 0.3);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 200, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 150, 255, 0.1);
}

.modal-title {
    color: #5ec4e6;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 0 0 6px rgba(94, 196, 230, 0.4);
}

.modal-close {
    color: #5ec4e6;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
    line-height: 1;
}

.modal-close:hover {
    color: #e04060;
    transform: scale(1.2) rotate(90deg);
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 150, 255, 0.3) transparent;
}
.modal-body::-webkit-scrollbar {
    width: 6px;
}
.modal-body::-webkit-scrollbar-thumb {
    background: rgba(0, 150, 255, 0.3);
    border-radius: 3px;
}
.modal-body::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 150, 255, 0.5);
}

.form-group {
    margin-bottom: 16px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.form-group label {
    display: block;
    color: #5ec4e6;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    background: rgba(0, 150, 255, 0.05);
    border: 1px solid rgba(0, 200, 255, 0.2);
    color: #bce4f4;
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 4px;
    outline: none;
    font-family: inherit;
    transition: all 0.2s;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    border-color: #5ec4e6;
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.3);
    background: rgba(0, 150, 255, 0.08);
}

.form-group input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: #4a8ea8;
}

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(0, 200, 255, 0.2);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: rgba(0, 10, 20, 0.6);
}

.modal-btn {
    padding: 8px 20px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
    font-family: inherit;
}

.modal-btn-cancel {
    background: rgba(150, 150, 150, 0.1);
    border-color: rgba(150, 150, 150, 0.3);
    color: #888;
}

.modal-btn-cancel:hover {
    background: rgba(150, 150, 150, 0.2);
    border-color: #888;
    color: #aaa;
}

.modal-btn-confirm {
    background: rgba(0, 180, 255, 0.2);
    border-color: rgba(0, 200, 255, 0.4);
    color: #5ec4e6;
}

.modal-btn-confirm:hover {
    background: rgba(0, 180, 255, 0.3);
    border-color: #5ec4e6;
    box-shadow: 0 0 12px rgba(0, 180, 255, 0.4);
    transform: translateY(-1px);
}

.modal-btn-delete {
    background: rgba(224, 64, 96, 0.15);
    border-color: rgba(224, 64, 96, 0.3);
    color: #e04060;
}

.modal-btn-delete:hover {
    background: rgba(224, 64, 96, 0.25);
    border-color: #e04060;
    box-shadow: 0 0 12px rgba(224, 64, 96, 0.4);
    transform: translateY(-1px);
}

.auto-fill-btn {
    width: 100%;
    background: rgba(100, 200, 100, 0.1);
    border: 1px solid rgba(100, 200, 100, 0.3);
    color: #6cc96c;
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: inherit;
    font-weight: 600;
    margin-bottom: 16px;
}

.auto-fill-btn:hover {
    background: rgba(100, 200, 100, 0.2);
    border-color: #6cc96c;
    box-shadow: 0 0 12px rgba(100, 200, 100, 0.3);
    transform: translateY(-1px);
}

.modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-content {
    transform: scale(0.9) translateY(-20px);
}

.modal-fade-leave-to .modal-content {
    transform: scale(0.9) translateY(20px);
}
</style>
