import { createApp } from 'vue';
import App from './App.vue';
import { createScriptIdIframe, teleportStyle, createScriptIdDiv } from '@util/script';

$(() => {
  if (!$('#ghost-protocol-toast-style').length) {
    $('<style id="ghost-protocol-toast-style">').text(`
      #toast-container > .toast {
        background: linear-gradient(135deg, #06090e 0%, #0a111a 100%) !important;
        border: 1px solid rgba(0, 200, 255, 0.25) !important;
        border-left: 3px solid #5ec4e6 !important;
        border-radius: 4px !important;
        box-shadow: 0 0 20px rgba(0, 150, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.5) !important;
        font-family: 'Consolas', 'Courier New', monospace !important;
        opacity: 1 !important;
      }
      #toast-container > .toast:hover {
        box-shadow: 0 0 25px rgba(0, 150, 255, 0.3), 0 4px 16px rgba(0, 0, 0, 0.6) !important;
        border-color: rgba(0, 200, 255, 0.4) !important;
      }
      #toast-container > .toast .toast-title {
        color: #5ec4e6 !important;
        font-weight: 700 !important;
        letter-spacing: 2px !important;
        text-shadow: 0 0 6px rgba(94, 196, 230, 0.4) !important;
        font-size: 13px !important;
      }
      #toast-container > .toast .toast-message {
        color: #7cb3c7 !important;
        font-size: 12px !important;
        letter-spacing: 0.5px !important;
        line-height: 1.6 !important;
      }
      #toast-container > .toast .toast-close-button {
        color: #4a8ea8 !important;
        text-shadow: none !important;
        opacity: 0.8 !important;
      }
      #toast-container > .toast .toast-close-button:hover {
        color: #5ec4e6 !important;
      }
      #toast-container > .toast .toast-progress {
        background: linear-gradient(90deg, rgba(94, 196, 230, 0.4), rgba(0, 200, 255, 0.15)) !important;
      }
    `).appendTo('head');
  }

  toastr.success(
    '> 神经链路同步完成...异化体数据库已上线。操作者可随时调取档案。',
    '幽灵协议◈ 系统提示',
    { timeOut: 5000, progressBar: true }
  );

  appendInexistentScriptButtons([{ name: '◈ 启动幽灵协议 ◈', visible: true }]);

  let app: ReturnType<typeof createApp> | null = null;
  let $app: JQuery<HTMLIFrameElement> | null = null;

  const togglePanel = () => {
    if ($app) {
      if ($app.is(':visible')) {
        $app.hide();
      } else {
        $app.show();
      }
      return;
    }

    $app = createScriptIdIframe()
      .css({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        zIndex: 9999,
        border: 'none',
        background: 'transparent',
      })
      .appendTo('body')
      .on('load', () => {
        teleportStyle($app![0].contentDocument!.head);
        app = createApp(App, {
          onClose: () => {
            if ($app) $app.hide();
          }
        });
        app.mount($app![0].contentDocument!.body);
      });
  };

  // 兼容旧脚本按钮入口
  eventOn(getButtonEvent('◈ 启动幽灵协议 ◈'), togglePanel);

  // 创建可拖动悬浮球
  const getStoredFabPos = () => {
    try {
      const stored = window.parent.localStorage.getItem('ghost_db_fab_pos');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const setStoredFabPos = (pos: { left: number; top: number }) => {
    try {
      window.parent.localStorage.setItem('ghost_db_fab_pos', JSON.stringify(pos));
    } catch (e) {
      // ignore
    }
  };

  const storedPos = getStoredFabPos();
  const $fab = createScriptIdDiv().css({
    position: 'fixed',
    right: storedPos ? 'auto' : '20px',
    bottom: storedPos ? 'auto' : '20px',
    left: storedPos ? `${storedPos.left}px` : 'auto',
    top: storedPos ? `${storedPos.top}px` : 'auto',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0a111a, #06090e)',
    border: '2px solid #5ec4e6',
    boxShadow: '0 0 20px rgba(94, 196, 230, 0.4), 0 4px 12px rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '10000',
    transition: 'all 0.2s',
    userSelect: 'none',
  }).appendTo('body');

  $fab.html('<i class="fas fa-satellite-dish" style="color: #5ec4e6; font-size: 24px; text-shadow: 0 0 8px rgba(94, 196, 230, 0.6);"></i>');

  $fab.on('mouseenter', () => {
    $fab.css({ boxShadow: '0 0 30px rgba(94, 196, 230, 0.6), 0 6px 16px rgba(0, 0, 0, 0.8)', transform: 'scale(1.05)' });
  }).on('mouseleave', () => {
    $fab.css({ boxShadow: '0 0 20px rgba(94, 196, 230, 0.4), 0 4px 12px rgba(0, 0, 0, 0.6)', transform: 'scale(1)' });
  });

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let fabStartLeft = 0;
  let fabStartTop = 0;
  let totalMoved = 0;

  const onMouseDown = (e: JQuery.MouseDownEvent | JQuery.TouchStartEvent) => {
    isDragging = true;
    totalMoved = 0;
    const evt = e.originalEvent as MouseEvent | TouchEvent;
    const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
    const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;
    dragStartX = clientX;
    dragStartY = clientY;
    const offset = $fab.offset()!;
    fabStartLeft = offset.left;
    fabStartTop = offset.top;
    $fab.css({ transition: 'none' });
    // 不要阻止默认行为，否则可能影响事件冒泡
    // e.preventDefault();
  };

  const onMouseMove = (e: JQuery.MouseMoveEvent | JQuery.TouchMoveEvent) => {
    if (!isDragging) return;
    const evt = e.originalEvent as MouseEvent | TouchEvent;
    const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
    const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    totalMoved = Math.abs(dx) + Math.abs(dy);
    const newLeft = fabStartLeft + dx;
    const newTop = fabStartTop + dy;
    $fab.css({ left: `${newLeft}px`, top: `${newTop}px`, right: 'auto', bottom: 'auto' });
    e.preventDefault();
  };

  const onMouseUp = (e: JQuery.MouseUpEvent | JQuery.TouchEndEvent) => {
    if (!isDragging) return;
    isDragging = false;
    $fab.css({ transition: 'all 0.2s' });

    if (totalMoved < 5) {
      // 点击
      togglePanel();
    } else {
      // 拖动结束，保存位置
      const offset = $fab.offset()!;
      setStoredFabPos({ left: offset.left, top: offset.top });
    }
  };

  $fab.on('mousedown', onMouseDown);
  $fab.on('touchstart', onMouseDown);
  // 注意：悬浮球添加到父页面，事件监听也需要在父页面的 document 上
  $(window.parent.document).on('mousemove', onMouseMove);
  $(window.parent.document).on('touchmove', onMouseMove);
  $(window.parent.document).on('mouseup', onMouseUp);
  $(window.parent.document).on('touchend', onMouseUp);

  $(window).on('pagehide', () => {
    if (app) app.unmount();
    if ($app) $app.remove();
    $fab.remove();
    $(window.parent.document).off('mousemove', onMouseMove);
    $(window.parent.document).off('touchmove', onMouseMove);
    $(window.parent.document).off('mouseup', onMouseUp);
    $(window.parent.document).off('touchend', onMouseUp);
  });
});
