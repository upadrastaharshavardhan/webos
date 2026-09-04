/**
 * AetherOS — Main Bootstrap
 */

document.addEventListener('DOMContentLoaded', () => {
  initLockScreen();
  initClock();
  initDesktopIcons();
  initDock();
  initLauncher();
  initContextMenu();
  initPower();
  restoreWallpaper();
});

/* ========== LOCK SCREEN ========== */
function initLockScreen() {
  const lock = document.getElementById('lock-screen');
  const desktop = document.getElementById('desktop');
  const unlockBtn = document.getElementById('unlock-btn');

  function unlock() {
    lock.style.opacity = '0';
    setTimeout(() => {
      lock.classList.add('hidden');
      desktop.classList.remove('hidden');
      desktop.classList.add('flex');
      showToast('Welcome to AetherOS', 'success');
    }, 500);
  }

  unlockBtn.addEventListener('click', unlock);
  lock.addEventListener('click', (e) => {
    if (e.target === lock || e.target.closest('#unlock-btn') || e.target.closest('.relative')) {
      // allow unlock on most clicks
    }
  });

  // Any key or click unlocks
  const unlockHandler = (e) => {
    if (lock.classList.contains('hidden')) return;
    unlock();
    document.removeEventListener('keydown', unlockHandler);
    lock.removeEventListener('click', unlockHandler);
  };
  document.addEventListener('keydown', unlockHandler);
  lock.addEventListener('click', unlockHandler);
}

/* ========== CLOCK ========== */
function initClock() {
  function update() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    const lockTime = document.getElementById('lock-time');
    const lockDate = document.getElementById('lock-date');
    const panelClock = document.getElementById('panel-clock');

    if (lockTime) lockTime.textContent = timeStr;
    if (lockDate) lockDate.textContent = dateStr;
    if (panelClock) panelClock.textContent = timeStr;
  }
  update();
  setInterval(update, 1000);
}

/* ========== DESKTOP ICONS ========== */
function initDesktopIcons() {
  const container = document.getElementById('desktop-icons');
  DESKTOP_ICONS.forEach(appId => {
    const app = APPS[appId];
    if (!app) return;

    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.dataset.app = appId;
    icon.innerHTML = `
      <div class="icon-img">${app.icon}</div>
      <span>${app.name}</span>
    `;

    icon.addEventListener('click', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });

    icon.addEventListener('dblclick', () => {
      windowManager.openApp(appId);
    });

    container.appendChild(icon);
  });
}

/* ========== DOCK ========== */
function initDock() {
  const dockInner = document.querySelector('#dock > div');

  DOCK_APPS.forEach(appId => {
    const app = APPS[appId];
    if (!app) return;

    const item = document.createElement('div');
    item.className = 'dock-item';
    item.dataset.app = appId;
    item.innerHTML = `
      ${app.icon}
      <span class="tooltip">${app.name}</span>
    `;

    item.addEventListener('click', () => {
      // If minimized, restore; else open or focus
      let found = false;
      for (const [id, win] of windowManager.windows) {
        if (win.appId === appId) {
          if (win.minimized) windowManager.restoreWindow(id);
          else windowManager.focusWindow(id);
          found = true;
          break;
        }
      }
      if (!found) windowManager.openApp(appId);
    });

    dockInner.appendChild(item);
  });

  // Separator + Launcher button
  const sep = document.createElement('div');
  sep.className = 'w-px h-8 bg-white/15 mx-1 self-center';
  dockInner.appendChild(sep);

  const launcherBtn = document.createElement('div');
  launcherBtn.className = 'dock-item';
  launcherBtn.innerHTML = `
    <span style="font-size:22px">⋯</span>
    <span class="tooltip">All Apps</span>
  `;
  launcherBtn.addEventListener('click', () => {
    document.getElementById('app-launcher').classList.remove('hidden');
    document.getElementById('app-launcher').classList.add('flex');
  });
  dockInner.appendChild(launcherBtn);
}

/* ========== APP LAUNCHER ========== */
function initLauncher() {
  const grid = document.getElementById('launcher-grid');
  const launcher = document.getElementById('app-launcher');
  const closeBtn = document.getElementById('close-launcher');

  Object.values(APPS).forEach(app => {
    const card = document.createElement('div');
    card.className = 'launcher-app';
    card.innerHTML = `
      <div class="app-icon">${app.icon}</div>
      <span>${app.name}</span>
    `;
    card.addEventListener('click', () => {
      windowManager.openApp(app.id);
      launcher.classList.add('hidden');
      launcher.classList.remove('flex');
    });
    grid.appendChild(card);
  });

  closeBtn.addEventListener('click', () => {
    launcher.classList.add('hidden');
    launcher.classList.remove('flex');
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !launcher.classList.contains('hidden')) {
      launcher.classList.add('hidden');
      launcher.classList.remove('flex');
    }
  });

  // Activities button
  document.getElementById('activities-btn').addEventListener('click', () => {
    launcher.classList.remove('hidden');
    launcher.classList.add('flex');
  });
}

/* ========== CONTEXT MENU ========== */
function initContextMenu() {
  const menu = document.getElementById('context-menu');
  const desktopArea = document.getElementById('desktop-area');

  const items = [
    { label: 'New Folder', icon: '📁', action: () => showToast('New Folder created (demo)', 'info') },
    { label: 'Change Wallpaper', icon: '🖼️', action: () => windowManager.openApp('settings') },
    { separator: true },
    { label: 'Open Terminal', icon: '💻', action: () => windowManager.openApp('terminal') },
    { label: 'Open Files', icon: '📂', action: () => windowManager.openApp('files') },
    { separator: true },
    { label: 'Display Settings', icon: '⚙️', action: () => windowManager.openApp('settings') },
    { label: 'About AetherOS', icon: 'ℹ️', action: () => windowManager.openApp('about') }
  ];

  function showMenu(x, y) {
    menu.innerHTML = items.map(item => {
      if (item.separator) return '<div class="ctx-separator"></div>';
      return `<div class="ctx-item" data-action="${item.label}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
      </div>`;
    }).join('');

    menu.classList.remove('hidden');

    // Position
    const rect = menu.getBoundingClientRect();
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 300;
    menu.style.left = Math.min(x, maxX) + 'px';
    menu.style.top = Math.min(y, maxY) + 'px';

    menu.querySelectorAll('.ctx-item').forEach((el, idx) => {
      const item = items.filter(i => !i.separator)[idx];
      // Better mapping
    });

    // Re-bind properly
    let actionIdx = 0;
    menu.querySelectorAll('.ctx-item').forEach(el => {
      const item = items.filter(i => !i.separator)[actionIdx++];
      el.addEventListener('click', () => {
        item.action();
        hideMenu();
      });
    });
  }

  function hideMenu() {
    menu.classList.add('hidden');
  }

  desktopArea.addEventListener('contextmenu', (e) => {
    // Only on empty desktop area, not on windows or icons
    if (e.target.closest('.window') || e.target.closest('.desktop-icon')) return;
    e.preventDefault();
    showMenu(e.clientX, e.clientY);
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) hideMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMenu();
  });
}

/* ========== POWER ========== */
function initPower() {
  document.getElementById('power-btn').addEventListener('click', () => {
    if (confirm('Lock screen and return to login?')) {
      windowManager.closeAll();
      const lock = document.getElementById('lock-screen');
      const desktop = document.getElementById('desktop');
      desktop.classList.add('hidden');
      desktop.classList.remove('flex');
      lock.classList.remove('hidden');
      lock.style.opacity = '1';
    }
  });
}

/* ========== WALLPAPER ========== */
function restoreWallpaper() {
  const saved = localStorage.getItem('aether-wallpaper');
  if (saved) {
    document.getElementById('wallpaper').style.backgroundImage = `url('${saved}')`;
  }
}

/* ========== TOAST ========== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';

  const colors = {
    success: 'border-emerald-500/40',
    info: 'border-sky-500/40',
    error: 'border-rose-500/40'
  };
  toast.classList.add(colors[type] || colors.info);
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* ========== KEYBOARD SHORTCUTS ========== */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Space → App launcher
  if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
    e.preventDefault();
    const launcher = document.getElementById('app-launcher');
    if (launcher.classList.contains('hidden')) {
      launcher.classList.remove('hidden');
      launcher.classList.add('flex');
    } else {
      launcher.classList.add('hidden');
      launcher.classList.remove('flex');
    }
  }
});
