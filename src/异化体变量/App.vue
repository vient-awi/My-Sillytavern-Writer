<template>
  <div class="editor-layout">
    <div class="preview-panel">
      <h3>🎨 界面预览 (已填充测试长文本以触发滚动条)</h3>
      <div class="preview-content" v-html="previewHtml"></div>
    </div>
    
    <div class="code-panel">
      <h3>📋 酒馆正则替换代码 (直接复制)</h3>
      <p>捕获正则：<code>/&lt;UpdateVariable&gt;\s*&lt;Analysis&gt;(.*?)&lt;/Analysis&gt;\s*&lt;JSONPatch&gt;(.*?)&lt;/JSONPatch&gt;\s*&lt;\/UpdateVariable&gt;/s</code></p>
      <textarea readonly v-model="tavernCode"></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 这是最终提取出的完整替换代码，内嵌了对应的 <style> 标签。
// 因为酒馆的正则替换不支持 Vue 的 :deep()，直接内嵌 <style> 可以确保在酒馆中滚动条样式完美生效。
const tavernCode = ref(`<style>
.st-regex-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.st-regex-scrollbar::-webkit-scrollbar-track { background: transparent; }
.st-regex-scrollbar::-webkit-scrollbar-thumb { background: rgba(94, 196, 230, 0.3); border-radius: 3px; }
.st-regex-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(94, 196, 230, 0.6); }
</style>
<details style="background: rgba(10, 16, 24, 0.88); border-radius: 5px; border: 1px solid #174257; border-top: 3px solid #5ec4e6; margin: 16px 0; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 0 12px rgba(94, 196, 230, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #dbeef5; font-family: 'PingFang SC', 'Microsoft YaHei', ui-monospace, monospace; overflow: hidden; transition: all 0.3s ease;">
  <summary style="padding: 12px 20px; cursor: pointer; font-weight: 700; background: linear-gradient(90deg, rgba(23, 66, 87, 0.65), transparent); user-select: none; list-style: none; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #174257; font-size: 14px;">
    <div style="position: relative; display: flex; justify-content: center; align-items: center;">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #5ec4e6; box-shadow: 0 0 8px rgba(94, 196, 230, 0.8);"></span>
    </div>
    <span style="color: #5ec4e6; text-shadow: 0 0 10px rgba(94, 196, 230, 0.4); font-size: 14px; letter-spacing: 2px;">系统处理</span>
    <span style="opacity: 0.4; font-weight: normal; color: #7cb3c7;">|</span>
    <span style="color: #7cb3c7; letter-spacing: 1px; font-size: 12px;">变量数值更新</span>
  </summary>

  <div style="padding: 16px 20px; display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: inline-flex; align-items: center;">
        <span style="color: rgba(94,196,230,0.8); border: 1px solid rgba(94,196,230,0.25); padding: 2px 6px; border-radius: 3px; font-size: 10.5px; letter-spacing: 1px; background: rgba(94,196,230,0.1);">逻辑分析</span>
      </div>
      <div class="st-regex-scrollbar" style="font-size: 13.5px; color: #7cb3c7; line-height: 1.7; word-break: break-all; font-style: italic; border-left: 3px solid rgba(94, 196, 230, 0.35); padding: 2px 0 2px 12px; white-space: pre-wrap; max-height: 120px; overflow-y: auto;">$1</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: inline-flex; align-items: center;">
        <span style="color: rgba(94,196,230,0.8); border: 1px solid rgba(94,196,230,0.25); padding: 2px 6px; border-radius: 3px; font-size: 10.5px; letter-spacing: 1px; background: rgba(94,196,230,0.1);">执行代码</span>
      </div>
      <div class="st-regex-scrollbar" style="background: rgba(0, 0, 0, 0.35); border-radius: 4px; border: 1px solid rgba(94,196,230,0.15); padding: 14px 16px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.4); font-size: 13px; font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Consolas, monospace; color: #dbeef5; line-height: 1.6; white-space: pre-wrap; word-break: break-all; max-height: 150px; overflow-y: auto;">$2</div>
    </div>
  </div>
</details>`);

// 为了直观看到滚动条效果，使用重复的长文本进行前端界面的预览测试
const mockAnalysis = "识别到当前场景存在异常实体，并且理智值出现了波动... \n".repeat(8);
const mockJSON = "{\n  \"Entity_Detected\": true,\n  \"Sanity\": -5,\n  \"Status\": \"Alert\",\n  \"Note\": \"System update triggered by anomalous environment variables.\"\n}\n".repeat(6);

const previewHtml = computed(() => {
  let html = tavernCode.value;
  // 替换占位符并默认展开以供预览
  html = html.replace('<details ', '<details open ');
  html = html.replace('$1', mockAnalysis);
  html = html.replace('$2', mockJSON);
  return html;
});
</script>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  font-family: 'PingFang SC', sans-serif;
}
.preview-panel {
  background: #0d1117;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #30363d;
}
.preview-content {
  margin-top: 16px;
}
.preview-panel h3 {
  color: #c9d1d9;
}
.code-panel {
  background: #f6f8fa;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #d0d7de;
}
.code-panel h3 {
  margin-top: 0;
  color: #24292f;
}
.code-panel p {
  color: #57606a;
  font-size: 14px;
  margin-bottom: 12px;
}
textarea {
  width: 100%;
  height: 350px;
  padding: 12px;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Consolas, monospace;
  font-size: 13px;
  background: #ffffff;
  color: #24292f;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  resize: vertical;
  outline: none;
}
textarea:focus {
  border-color: #0969da;
  box-shadow: 0 0 0 3px rgba(9,105,218,0.3);
}
</style>