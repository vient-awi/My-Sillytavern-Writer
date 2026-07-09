/**
 * 内容标点替换脚本
 *
 * - 初始化时扫描聊天中所有历史楼层，将 <content> 标签内的英文标点替换为中文标点
 * - 之后每次 AI 生成结束，自动处理最新楼层
 *
 * 替换规则：
 * - ... → ……
 * - , → ，
 * - ! → ！
 * - ? → ？
 * - : → ：
 * - ; → ；
 *
 * HTML 标签（如 <p style="color: #xxx;">）内的标点会被自动保护，不会被替换。
 */

// ---------------------------------------------------------------------------
// 替换逻辑
// ---------------------------------------------------------------------------

function replacePunctuationInBody(text: string): string {
  // 1. 保护 HTML 标签，避免替换标签内的标点（如 style="color: #xxx;"）
  const tagPlaceholders: string[] = [];
  let result = text.replace(/<[^>]+>/g, (tag) => {
    tagPlaceholders.push(tag);
    return `\x00TAG${tagPlaceholders.length - 1}\x00`;
  });

  // 2. 替换标点
  result = result
    .replace(/\.\.\./g, '……')
    .replace(/…+/g, '……')
    .replace(/,/g, '，')
    .replace(/!/g, '！')
    .replace(/\?/g, '？')
    .replace(/:/g, '：')
    .replace(/;/g, '；');

  // 3. 恢复 HTML 标签
  result = result.replace(/\x00TAG(\d+)\x00/g, (_sub, idx) => {
    return tagPlaceholders[parseInt(idx)];
  });

  return result;
}

function replacePunctuationInContent(text: string): string {
  return text.replace(
    /(<content>\s*\n*)([\s\S]*?)(\n*\s*<\/content>)/g,
    (_full: string, prefix: string, body: string, suffix: string): string => {
      return prefix + replacePunctuationInBody(body) + suffix;
    },
  );
}

// ---------------------------------------------------------------------------
// 单条消息处理
// ---------------------------------------------------------------------------

function processMessageText(original: string): string | null {
  const replaced = replacePunctuationInContent(original);
  return replaced !== original ? replaced : null;
}

// ---------------------------------------------------------------------------
// 批量扫描所有历史楼层
// ---------------------------------------------------------------------------

async function scanAllMessages() {
  console.info('[内容标点替换] 开始扫描所有历史楼层...');

  const allMessages = getChatMessages('0-{{lastMessageId}}');
  if (!allMessages || allMessages.length === 0) {
    console.info('[内容标点替换] 聊天中无消息，跳过扫描');
    return;
  }

  const toUpdate: Array<{ message_id: number; message: string }> = [];

  for (const msg of allMessages) {
    if (msg.role !== 'assistant') continue;
    if (!msg.message) continue;

    const replaced = processMessageText(msg.message);
    if (replaced) {
      toUpdate.push({ message_id: msg.message_id, message: replaced });
    }
  }

  if (toUpdate.length === 0) {
    console.info('[内容标点替换] 扫描完成，所有楼层无需修改');
    return;
  }

  console.info('[内容标点替换] 扫描完成，需修改 %d 个楼层，正在写入...', toUpdate.length);

  // 逐批写入，最后一次性刷新显示
  for (const item of toUpdate) {
    await setChatMessages([item], { refresh: 'none' });
  }

  // 全部写完后刷新整个聊天显示
  await setChatMessages([{ message_id: toUpdate[0].message_id }], { refresh: 'all' });

  console.info('[内容标点替换] 历史楼层全部替换完成，共 %d 条', toUpdate.length);
}

// ---------------------------------------------------------------------------
// 实时监听新消息
// ---------------------------------------------------------------------------

let isProcessing = false;

async function processLatestMessage() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    await new Promise(r => setTimeout(r, 300));

    const messages = getChatMessages(-1);
    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    if (msg.role !== 'assistant') return;

    const original = msg.message;
    if (!original) return;

    const replaced = processMessageText(original);
    if (!replaced) return;

    await setChatMessages(
      [{ message_id: msg.message_id, message: replaced }],
      { refresh: 'affected' },
    );

    console.info('[内容标点替换] 已替换第 %d 楼', msg.message_id);
  } catch (error) {
    console.error('[内容标点替换] 处理消息时出错:', error);
  } finally {
    isProcessing = false;
  }
}

// ---------------------------------------------------------------------------
// 启动
// ---------------------------------------------------------------------------

if (typeof tavern_events !== 'undefined') {
  // 1. 初始化：扫描所有历史楼层
  // 延迟执行，等聊天数据完全加载
  setTimeout(() => {
    scanAllMessages();
  }, 500);

  // 2. 监听新消息
  if (tavern_events.GENERATION_ENDED) {
    eventOn(tavern_events.GENERATION_ENDED, () => {
      processLatestMessage();
    });
    console.info('[内容标点替换] 已注册 GENERATION_ENDED 监听器');
  } else if (tavern_events.MESSAGE_RECEIVED) {
    eventOn(tavern_events.MESSAGE_RECEIVED, () => {
      processLatestMessage();
    });
    console.info('[内容标点替换] 已注册 MESSAGE_RECEIVED 监听器（降级）');
  } else {
    console.warn('[内容标点替换] 无可用的消息事件');
  }
} else {
  console.warn('[内容标点替换] tavern_events 不可用');
}
