/**
 * AetherOS — Window Manager
 */

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.zIndex = 10;
    this.activeId = null;
    this.container = document.getElementById('windows-container');
  }

  openApp(appId) {
    const app = APPS[appId];
    if (!app) return;

    // If already open, focus it
    for (const [id, win] of this.windows) {
      if (win.appId === appId && !win.minimized) {
        this.focusWindow(id);
        return;
      }
      if (win.appId === appId && win.minimized) {
        this.restoreWindow(id);
        return;
      }
    }

    this.createWindow(app);
  }

  createWindow(app) {
    const id = 'win-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const size = app.defaultSize || { width: 600, height: 400 };

    // Center with slight offset for cascading
    const offset = this.windows.size * 24;
    const left = Math.max(40, (window.innerWidth - size.width) / 2 + offset);
    const top = Math.max(40, (window.innerHeight - size.height - 80) / 2 + offset);

    const winEl = document.createElement('div');
    winEl.className = 'window';
    winEl.dataset.id = id;
    winEl.style.width = size.width + 'px';
    winEl.style.height = size.height + 'px';
    winEl.style.left = left + 'px';
    winEl.style.top = top + 'px';
    winEl.style.zIndex = ++this.zIndex;

    // Title bar
    const titlebar = document.createElement('div');
    titlebar.className = 'window-titlebar';

    const controls = document.createElement('div');
    controls.className = 'window-controls';
    controls.innerHTML = `
      <button class="window-btn close" title="Close"></button>
      <button class="window-btn minimize" title="Minimize"></button>
      <button class="window-btn maximize" title="Maximize"></button>
    `;

    const title = document.createElement('div');
    title.className = 'window-title';
    title.textContent = app.name;

    titlebar.append(controls, title);

    // Content
    const content = document.createElement('div');
    content.className = 'window-content flex-1 overflow-hidden';

    // Resize handles
    const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
      .map(dir => `<div class="resize-handle resize-${dir}" data-dir="${dir}"></div>`)
      .join('');

    winEl.append(titlebar, content);
    winEl.insertAdjacentHTML('beforeend', handles);
    this.container.appendChild(winEl);

    // Create app content
    if (typeof app.content === 'function') {
      app.content(content);
    }

    // Store state
    const state = {
      id,
      appId: app.id,
      el: winEl,
      minimized: false,
      maximized: false,
      prevRect: null
    };
    this.windows.set(id, state);

    // Events
    controls.querySelector('.close').onclick = (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    };
    controls.querySelector('.minimize').onclick = (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    };
    controls.querySelector('.maximize').onclick = (e) => {
      e.stopPropagation();
      this.toggleMaximize(id);
    };

    // Focus on click
    winEl.addEventListener('mousedown', () => this.focusWindow(id));

    // Dragging
    this.makeDraggable(winEl, titlebar, state);

    // Resizing
    this.makeResizable(winEl, state);

    // Double-click titlebar to maximize
    titlebar.addEventListener('dblclick', () => this.toggleMaximize(id));

    this.focusWindow(id);
    this.updateDock();
    return id;
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win || win.minimized) return;

    this.zIndex++;
    win.el.style.zIndex = this.zIndex;
    this.activeId = id;

    // Update focused class
    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
    win.el.classList.add('focused');

    // Update panel
    const app = APPS[win.appId];
    const panelName = document.getElementById('panel-app-name');
    if (panelName) panelName.textContent = app ? app.name : 'Desktop';

    this.updateDock();
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.el.style.transition = 'opacity 0.15s, transform 0.15s';
    win.el.style.opacity = '0';
    win.el.style.transform = 'scale(0.95)';

    setTimeout(() => {
      win.el.remove();
      this.windows.delete(id);
      if (this.activeId === id) {
        this.activeId = null;
        const panelName = document.getElementById('panel-app-name');
        if (panelName) panelName.textContent = 'Desktop';
      }
      this.updateDock();
    }, 150);
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.minimized = true;
    win.el.classList.add('minimized');
    if (this.activeId === id) {
      this.activeId = null;
      const panelName = document.getElementById('panel-app-name');
      if (panelName) panelName.textContent = 'Desktop';
    }
    this.updateDock();
  }

  restoreWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.minimized = false;
    win.el.classList.remove('minimized');
    this.focusWindow(id);
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.maximized) {
      // Restore
      win.maximized = false;
      win.el.classList.remove('maximized');
      if (win.prevRect) {
        win.el.style.left = win.prevRect.left;
        win.el.style.top = win.prevRect.top;
        win.el.style.width = win.prevRect.width;
        win.el.style.height = win.prevRect.height;
      }
    } else {
      // Maximize
      win.prevRect = {
        left: win.el.style.left,
        top: win.el.style.top,
        width: win.el.style.width,
        height: win.el.style.height
      };
      win.maximized = true;
      win.el.classList.add('maximized');
    }
    this.focusWindow(id);
  }

  makeDraggable(winEl, handle, state) {
    let startX, startY, startLeft, startTop;

    const onMouseDown = (e) => {
      if (state.maximized) return;
      if (e.target.closest('.window-btn')) return;

      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(winEl.style.left) || 0;
      startTop = parseInt(winEl.style.top) || 0;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      winEl.style.left = Math.max(0, startLeft + dx) + 'px';
      winEl.style.top = Math.max(0, startTop + dy) + 'px';
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
  }

  makeResizable(winEl, state) {
    const handles = winEl.querySelectorAll('.resize-handle');

    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        if (state.maximized) return;
        e.preventDefault();
        e.stopPropagation();

        const dir = handle.dataset.dir;
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = winEl.offsetWidth;
        const startH = winEl.offsetHeight;
        const startL = parseInt(winEl.style.left) || 0;
        const startT = parseInt(winEl.style.top) || 0;

        const onMouseMove = (e) => {
          let newW = startW;
          let newH = startH;
          let newL = startL;
          let newT = startT;

          if (dir.includes('e')) newW = Math.max(320, startW + (e.clientX - startX));
          if (dir.includes('w')) {
            const dx = e.clientX - startX;
            newW = Math.max(320, startW - dx);
            newL = startL + (startW - newW);
          }
          if (dir.includes('s')) newH = Math.max(200, startH + (e.clientY - startY));
          if (dir.includes('n')) {
            const dy = e.clientY - startY;
            newH = Math.max(200, startH - dy);
            newT = startT + (startH - newH);
          }

          winEl.style.width = newW + 'px';
          winEl.style.height = newH + 'px';
          winEl.style.left = newL + 'px';
          winEl.style.top = newT + 'px';
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  updateDock() {
    document.querySelectorAll('.dock-item').forEach(item => {
      const appId = item.dataset.app;
      let isOpen = false;
      for (const win of this.windows.values()) {
        if (win.appId === appId) {
          isOpen = true;
          break;
        }
      }
      item.classList.toggle('active', isOpen);
    });
  }

  closeAll() {
    for (const id of [...this.windows.keys()]) {
      this.closeWindow(id);
    }
  }
}

// Global instance
const windowManager = new WindowManager();
