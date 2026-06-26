import { createApp } from 'vue';
import App from './App.vue';
import { createScriptIdIframe, teleportStyle } from '@util/script';

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

  eventOn(getButtonEvent('◈ 启动幽灵协议 ◈'), () => {
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
  });

  $(window).on('pagehide', () => {
    if (app) app.unmount();
    if ($app) $app.remove();
  });
});
