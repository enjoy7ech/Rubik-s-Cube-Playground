import {toast} from './common.js';

// Keep ordinary local development free from service-worker caching.
const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const enabled = !local || new URLSearchParams(location.search).has('pwa');
if (enabled && window.isSecureContext && 'serviceWorker' in navigator && window === window.top) {
  const install = document.createElement('button');
  install.className = 'outline pwa-install';
  install.textContent = '＋ 安装';
  install.setAttribute('aria-label', '安装方寸魔方');
  install.hidden = true;
  document.querySelector('.header-right')?.prepend(install);
  let promptEvent;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (appleMobile && !standalone) { install.textContent = '＋ 添加到桌面'; install.hidden = false; }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); promptEvent = event; install.hidden = false;
  });
  install.onclick = async () => {
    if (appleMobile && !promptEvent) {
      if (document.querySelector('.pwa-install-help')) return;
      const notice = document.createElement('div'); notice.className = 'pwa-update pwa-install-help';
      const message = document.createElement('span'); message.textContent = '在 Safari 中点“分享”，再选“添加到主屏幕”。';
      const close = document.createElement('button'); close.className = 'outline'; close.textContent = '知道了'; close.onclick = () => notice.remove();
      notice.append(message, close); document.body.append(notice); return;
    }
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    promptEvent = null; install.hidden = true;
  };
  window.addEventListener('appinstalled', () => { install.hidden = true; toast('方寸已加入你的桌面 ♡'); });
  let requestedUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (requestedUpdate) location.reload();
  });
  navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'}).then(registration => {
    const showUpdate = () => {
      if (!registration.waiting || document.querySelector('.pwa-update')) return;
      const notice = document.createElement('div'); notice.className = 'pwa-update';
      const message = document.createElement('span'); message.textContent = '新版本准备好了 ♡';
      const button = document.createElement('button'); button.className = 'primary'; button.textContent = '更新并刷新';
      button.onclick = () => { requestedUpdate = true; registration.waiting?.postMessage({type: 'ACTIVATE_UPDATE'}); };
      const later = document.createElement('button'); later.className = 'outline'; later.textContent = '稍后'; later.onclick = () => notice.remove();
      notice.append(message, button, later); document.body.append(notice);
    };
    showUpdate();
    registration.addEventListener('updatefound', () => {
      registration.installing?.addEventListener('statechange', event => {
        if (event.target.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
      });
    });
  }).catch(() => { console.warn('离线缓存暂时不可用，网站仍可在线使用。'); });
}
