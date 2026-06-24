import { createApp } from 'vue';
import App from './App.vue';
import { createScriptIdIframe, teleportStyle } from '@util/script';

$(() => {
  appendInexistentScriptButtons([{ name: '异化体数据库', visible: true }]);

  let app: ReturnType<typeof createApp> | null = null;
  let $app: JQuery<HTMLIFrameElement> | null = null;

  eventOn(getButtonEvent('异化体数据库'), () => {
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
