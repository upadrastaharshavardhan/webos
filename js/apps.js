/**
 * AetherOS — Application Definitions
 */

const APPS = {
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: '🌐',
    color: 'from-sky-500 to-blue-600',
    defaultSize: { width: 900, height: 600 },
    content: createBrowser
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: 'from-red-500 to-rose-600',
    defaultSize: { width: 860, height: 540 },
    content: createYouTube
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    color: 'from-emerald-500 to-teal-600',
    defaultSize: { width: 680, height: 420 },
    content: createTerminal
  },
  files: {
    id: 'files',
    name: 'Files',
    icon: '📁',
    color: 'from-amber-500 to-orange-600',
    defaultSize: { width: 720, height: 480 },
    content: createFiles
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: '🔢',
    color: 'from-violet-500 to-purple-600',
    defaultSize: { width: 320, height: 460 },
    content: createCalculator
  },
  notepad: {
    id: 'notepad',
    name: 'Notes',
    icon: '📝',
    color: 'from-yellow-400 to-amber-500',
    defaultSize: { width: 520, height: 480 },
    content: createNotepad
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    color: 'from-slate-400 to-slate-600',
    defaultSize: { width: 560, height: 480 },
    content: createSettings
  },
  about: {
    id: 'about',
    name: 'About',
    icon: 'ℹ️',
    color: 'from-indigo-400 to-blue-500',
    defaultSize: { width: 480, height: 420 },
    content: createAbout
  },
  google: {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    color: 'from-blue-400 to-blue-600',
    defaultSize: { width: 900, height: 600 },
    content: (container) => createBrowser(container, 'https://www.google.com/webhp?igu=1')
  }
};

// Desktop icons order
const DESKTOP_ICONS = ['browser', 'youtube', 'terminal', 'files', 'calculator', 'notepad', 'settings', 'about'];

// Dock order
const DOCK_APPS = ['browser', 'youtube', 'terminal', 'files', 'calculator', 'notepad', 'settings'];

/* ========== APP CONTENT GENERATORS ========== */

function createBrowser(container, startUrl = 'https://www.google.com/webhp?igu=1') {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col h-full';

  const toolbar = document.createElement('div');
  toolbar.className = 'browser-toolbar';

  const backBtn = document.createElement('button');
  backBtn.className = 'browser-nav-btn';
  backBtn.innerHTML = '<i data-lucide="arrow-left" class="w-4 h-4"></i>';
  backBtn.title = 'Back';

  const forwardBtn = document.createElement('button');
  forwardBtn.className = 'browser-nav-btn';
  forwardBtn.innerHTML = '<i data-lucide="arrow-right" class="w-4 h-4"></i>';
  forwardBtn.title = 'Forward';

  const reloadBtn = document.createElement('button');
  reloadBtn.className = 'browser-nav-btn';
  reloadBtn.innerHTML = '<i data-lucide="rotate-cw" class="w-4 h-4"></i>';
  reloadBtn.title = 'Reload';

  const homeBtn = document.createElement('button');
  homeBtn.className = 'browser-nav-btn';
  homeBtn.innerHTML = '<i data-lucide="home" class="w-4 h-4"></i>';
  homeBtn.title = 'Home';

  const urlInput = document.createElement('input');
  urlInput.className = 'browser-url';
  urlInput.type = 'text';
  urlInput.value = startUrl;
  urlInput.placeholder = 'Enter URL or search...';

  const goBtn = document.createElement('button');
  goBtn.className = 'browser-nav-btn px-3';
  goBtn.innerHTML = '<i data-lucide="search" class="w-4 h-4"></i>';

  toolbar.append(backBtn, forwardBtn, reloadBtn, homeBtn, urlInput, goBtn);

  const iframe = document.createElement('iframe');
  iframe.className = 'flex-1 w-full border-0 bg-white';
  iframe.src = startUrl;
  iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation';
  iframe.allow = 'fullscreen';

  // Note: Many sites block iframes. We handle that gracefully.
  const fallback = document.createElement('div');
  fallback.className = 'hidden flex-1 flex flex-col items-center justify-center gap-4 bg-slate-900 text-slate-300 p-8 text-center';
  fallback.innerHTML = `
    <div class="text-5xl mb-2">🔒</div>
    <h3 class="text-lg font-medium text-white">This site blocks embedding</h3>
    <p class="text-sm max-w-md">Many sites (Google, YouTube, etc.) prevent being shown in iframes for security reasons.</p>
    <a id="open-external" href="${startUrl}" target="_blank" rel="noopener"
       class="mt-2 px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-colors">
      Open in new tab →
    </a>
    <p class="text-xs text-slate-500 mt-4">Try: wikipedia.org, example.com, or any site that allows iframes</p>
  `;

  wrap.append(toolbar, iframe, fallback);
  container.appendChild(wrap);

  // After a short delay, check if iframe loaded or was blocked
  setTimeout(() => {
    try {
      // If we can access contentWindow location, good. Otherwise blocked.
      const loc = iframe.contentWindow.location.href;
    } catch (e) {
      // Cross-origin is expected, so we rely on load event + timeout
    }
  }, 1500);

  iframe.addEventListener('error', () => {
    iframe.classList.add('hidden');
    fallback.classList.remove('hidden');
    fallback.classList.add('flex');
  });

  function navigate(url) {
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Treat as search
      url = 'https://www.google.com/search?q=' + encodeURIComponent(url) + '&igu=1';
    }
    urlInput.value = url;
    fallback.classList.add('hidden');
    fallback.classList.remove('flex');
    iframe.classList.remove('hidden');
    iframe.src = url;
    const ext = fallback.querySelector('#open-external');
    if (ext) ext.href = url;
  }

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigate(urlInput.value.trim());
  });
  goBtn.addEventListener('click', () => navigate(urlInput.value.trim()));
  homeBtn.addEventListener('click', () => navigate('https://www.google.com/webhp?igu=1'));
  reloadBtn.addEventListener('click', () => { iframe.src = iframe.src; });
  backBtn.addEventListener('click', () => { try { iframe.contentWindow.history.back(); } catch(e){} });
  forwardBtn.addEventListener('click', () => { try { iframe.contentWindow.history.forward(); } catch(e){} });

  // Quick links
  const quick = document.createElement('div');
  quick.className = 'flex gap-2 px-3 py-2 bg-black/20 border-b border-white/5 text-xs';
  const sites = [
    { name: 'Google', url: 'https://www.google.com/webhp?igu=1' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
    { name: 'Example', url: 'https://example.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' }
  ];
  sites.forEach(s => {
    const b = document.createElement('button');
    b.className = 'px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300';
    b.textContent = s.name;
    b.onclick = () => navigate(s.url);
    quick.appendChild(b);
  });
  toolbar.after(quick);

  lucide.createIcons({ nodes: [toolbar] });
}

function createYouTube(container) {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col h-full bg-black';

  const toolbar = document.createElement('div');
  toolbar.className = 'browser-toolbar';

  const urlInput = document.createElement('input');
  urlInput.className = 'browser-url';
  urlInput.placeholder = 'Paste YouTube video URL or search...';
  urlInput.value = '';

  const goBtn = document.createElement('button');
  goBtn.className = 'browser-nav-btn px-3 text-xs font-medium';
  goBtn.textContent = 'Load';

  toolbar.append(urlInput, goBtn);

  const playerArea = document.createElement('div');
  playerArea.className = 'flex-1 relative bg-black flex items-center justify-center';

  // Default: popular tech video embed (works in iframe)
  const defaultId = 'dQw4w9WgXcQ'; // classic
  let currentId = defaultId;

  function loadVideo(idOrUrl) {
    let id = idOrUrl;
    // Extract ID from various YouTube URL formats
    const match = idOrUrl.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match) id = match[1];
    else if (idOrUrl.length === 11) id = idOrUrl;
    else {
      // Search
      playerArea.innerHTML = `
        <div class="text-center p-8 text-slate-400">
          <p class="mb-4">Search is limited in embed mode.</p>
          <p class="text-sm">Paste a full YouTube video URL instead.</p>
          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(idOrUrl)}" target="_blank"
             class="inline-block mt-4 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm">
            Search on YouTube →
          </a>
        </div>`;
      return;
    }
    currentId = id;
    playerArea.innerHTML = `
      <iframe class="absolute inset-0 w-full h-full"
        src="https://www.youtube.com/embed/${id}?autoplay=0&rel=0"
        title="YouTube video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>`;
  }

  loadVideo(defaultId);

  // Popular picks
  const picks = document.createElement('div');
  picks.className = 'flex gap-2 px-3 py-2 bg-zinc-900 border-b border-white/5 overflow-x-auto text-xs';
  const videos = [
    { title: 'Never Gonna Give You Up', id: 'dQw4w9WgXcQ' },
    { title: 'Lo-fi Beats', id: 'jfKfPfyJRdk' },
    { title: 'Space Ambient', id: '1ZYbU82GVz4' }
  ];
  videos.forEach(v => {
    const b = document.createElement('button');
    b.className = 'px-2.5 py-1 rounded-md bg-white/5 hover:bg-red-600/30 text-slate-300 whitespace-nowrap';
    b.textContent = v.title;
    b.onclick = () => { urlInput.value = 'https://youtu.be/' + v.id; loadVideo(v.id); };
    picks.appendChild(b);
  });

  goBtn.onclick = () => loadVideo(urlInput.value.trim() || defaultId);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') goBtn.click(); });

  wrap.append(toolbar, picks, playerArea);
  container.appendChild(wrap);
}

function createTerminal(container) {
  const body = document.createElement('div');
  body.className = 'terminal-body flex flex-col h-full';

  const output = document.createElement('div');
  output.className = 'flex-1 overflow-y-auto whitespace-pre-wrap';
  output.innerHTML = `<span class="text-sky-400">AetherOS Terminal v1.0</span>
Type <span class="text-emerald-400">help</span> for available commands.

`;

  const inputLine = document.createElement('div');
  inputLine.className = 'terminal-input-line mt-1';

  const prompt = document.createElement('span');
  prompt.className = 'terminal-prompt';
  prompt.textContent = 'user@aether:~$';

  const input = document.createElement('input');
  input.className = 'terminal-input';
  input.spellcheck = false;
  input.autocomplete = 'off';

  inputLine.append(prompt, input);
  body.append(output, inputLine);
  container.appendChild(body);

  const history = [];
  let histIdx = -1;

  const commands = {
    help: () => `Available commands:
  help          Show this help
  clear         Clear the terminal
  date          Show current date/time
  echo [text]   Print text
  whoami        Display current user
  uname         System information
  neofetch      System info (fancy)
  ls            List files
  pwd           Print working directory
  cat [file]    Show file content
  open [app]    Launch an application
  fortune       Random quote
  cowsay [msg]  ASCII cow
  matrix        Enter the matrix...
  exit          Close terminal`,
    clear: () => { output.innerHTML = ''; return null; },
    date: () => new Date().toString(),
    whoami: () => 'user',
    uname: () => 'AetherOS 1.0.0 x86_64 Web',
    pwd: () => '/home/user',
    ls: () => `Desktop  Documents  Downloads  Music  Pictures  Videos
browser  terminal  files  calculator  notes  settings`,
    neofetch: () => `
<span class="text-sky-400">           .-/+oossssoo+/-.</span>             <span class="text-sky-300">user</span>@<span class="text-sky-300">aether</span>
<span class="text-sky-400">        \`:+ssssssssssssssssss+:\`</span>         ------------
<span class="text-sky-400">      -+ssssssssssssssssssyyssss+-</span>       <span class="text-sky-300">OS</span>: AetherOS 1.0
<span class="text-sky-400">    .ossssssssssssssssssdMMMNysssso.</span>     <span class="text-sky-300">Host</span>: Browser
<span class="text-sky-400">   /ssssssssssshdmmNNmmyNMMMMhssssss/</span>    <span class="text-sky-300">Kernel</span>: WebKit/Gecko
<span class="text-sky-400">  +ssssssssshmydMMMMMMMNddddyssssssss+</span>   <span class="text-sky-300">Uptime</span>: ${Math.floor(performance.now()/1000)}s
<span class="text-sky-400"> /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/</span>  <span class="text-sky-300">Shell</span>: aether-sh
<span class="text-sky-400">.ssssssssdMMMNhsssssssssshNMMMdssssssss.</span> <span class="text-sky-300">Resolution</span>: ${window.innerWidth}x${window.innerHeight}
<span class="text-sky-400">+sssshhhyNMMNyssssssssssssyNMMMysssssss+</span> <span class="text-sky-300">Theme</span>: Dark Glass
<span class="text-sky-400">ossyNMMMNyMMhsssssssssssssshmmmhssssssso</span> <span class="text-sky-300">CPU</span>: JavaScript V8/SpiderMonkey
<span class="text-sky-400">ossyNMMMNyMMhsssssssssssssshmmmhssssssso</span> <span class="text-sky-300">Memory</span>: Plenty
<span class="text-sky-400">+sssshhhyNMMNyssssssssssssyNMMMysssssss+</span>
<span class="text-sky-400">.ssssssssdMMMNhsssssssssshNMMMdssssssss.</span>
<span class="text-sky-400"> /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/</span>
<span class="text-sky-400">  +sssssssssdmydMMMMMMMMddddyssssssss+</span>
<span class="text-sky-400">   /ssssssssssshdmNNNNmyNMMMMhssssss/</span>
<span class="text-sky-400">    .ossssssssssssssssssdMMMNysssso.</span>
<span class="text-sky-400">      -+sssssssssssssssssyyyssss+-</span>
<span class="text-sky-400">        \`:+ssssssssssssssssss+:\`</span>
<span class="text-sky-400">           .-/+oossssoo+/-.</span>`,
    fortune: () => {
      const quotes = [
        '"The only way to do great work is to love what you do." — Steve Jobs',
        '"Code is like humor. When you have to explain it, it’s bad." — Cory House',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"Experience is the name everyone gives to their mistakes." — Oscar Wilde',
        '"Simplicity is the soul of efficiency." — Austin Freeman',
        '"Talk is cheap. Show me the code." — Linus Torvalds',
        '"Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke'
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    },
    cowsay: (args) => {
      const msg = args.join(' ') || 'Moo!';
      const len = Math.min(msg.length, 40);
      const top = ' ' + '_'.repeat(len + 2);
      const bot = ' ' + '-'.repeat(len + 2);
      return `${top}\n< ${msg.slice(0,40)} >\n${bot}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
    },
    matrix: () => {
      output.innerHTML += '<span class="text-emerald-400">Entering the Matrix...</span>\n';
      setTimeout(() => {
        showToast('Wake up, Neo...', 'info');
      }, 800);
      return 'Follow the white rabbit. 🐇';
    },
    open: (args) => {
      const app = args[0];
      if (APPS[app]) {
        windowManager.openApp(app);
        return `Launching ${APPS[app].name}...`;
      }
      return `App not found: ${app}. Try: ${Object.keys(APPS).join(', ')}`;
    },
    cat: (args) => {
      if (!args[0]) return 'Usage: cat [file]';
      if (args[0] === 'readme.txt') return 'Welcome to AetherOS!\nA modern web-based desktop simulation.\nBuilt to work on GitHub Pages.';
      return `cat: ${args[0]}: No such file or directory`;
    },
    exit: () => {
      const win = container.closest('.window');
      if (win) windowManager.closeWindow(win.dataset.id);
      return null;
    }
  };

  function runCommand(cmdLine) {
    const parts = cmdLine.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!cmd) return;

    history.push(cmdLine);
    histIdx = history.length;

    let result;
    if (cmd === 'echo') {
      result = args.join(' ');
    } else if (commands[cmd]) {
      result = commands[cmd](args);
    } else {
      result = `Command not found: ${cmd}. Type 'help' for list of commands.`;
    }

    output.innerHTML += `<span class="text-sky-400">user@aether:~$</span> ${cmdLine}\n`;
    if (result !== null && result !== undefined) {
      output.innerHTML += result + '\n\n';
    }
    output.scrollTop = output.scrollHeight;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      runCommand(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx] || '';
      } else {
        histIdx = history.length;
        input.value = '';
      }
    }
  });

  // Focus input when terminal is clicked
  body.addEventListener('click', () => input.focus());
  setTimeout(() => input.focus(), 100);
}

function createFiles(container) {
  const wrap = document.createElement('div');
  wrap.className = 'flex h-full';

  const sidebar = document.createElement('div');
  sidebar.className = 'fm-sidebar';
  sidebar.innerHTML = `
    <div class="fm-item active" data-loc="home"><span>🏠</span> Home</div>
    <div class="fm-item" data-loc="desktop"><span>🖥️</span> Desktop</div>
    <div class="fm-item" data-loc="docs"><span>📄</span> Documents</div>
    <div class="fm-item" data-loc="downloads"><span>⬇️</span> Downloads</div>
    <div class="fm-item" data-loc="pictures"><span>🖼️</span> Pictures</div>
    <div class="fm-item" data-loc="music"><span>🎵</span> Music</div>
  `;

  const main = document.createElement('div');
  main.className = 'flex-1 overflow-auto';

  const locations = {
    home: [
      { name: 'Desktop', icon: '🖥️', type: 'folder' },
      { name: 'Documents', icon: '📄', type: 'folder' },
      { name: 'Downloads', icon: '⬇️', type: 'folder' },
      { name: 'Pictures', icon: '🖼️', type: 'folder' },
      { name: 'Music', icon: '🎵', type: 'folder' },
      { name: 'readme.txt', icon: '📝', type: 'file' }
    ],
    desktop: [
      { name: 'Browser', icon: '🌐', type: 'app', app: 'browser' },
      { name: 'Terminal', icon: '💻', type: 'app', app: 'terminal' },
      { name: 'Notes', icon: '📝', type: 'app', app: 'notepad' }
    ],
    docs: [
      { name: 'Project Ideas.md', icon: '📝', type: 'file' },
      { name: 'Resume.pdf', icon: '📕', type: 'file' },
      { name: 'Notes.txt', icon: '📄', type: 'file' }
    ],
    downloads: [
      { name: 'aether-os.zip', icon: '📦', type: 'file' },
      { name: 'wallpaper.jpg', icon: '🖼️', type: 'file' }
    ],
    pictures: [
      { name: 'space.jpg', icon: '🌌', type: 'file' },
      { name: 'mountains.png', icon: '🏔️', type: 'file' }
    ],
    music: [
      { name: 'lofi-beats.mp3', icon: '🎵', type: 'file' },
      { name: 'ambient.mp3', icon: '🎵', type: 'file' }
    ]
  };

  function render(loc) {
    const items = locations[loc] || [];
    main.innerHTML = `<div class="fm-grid">${items.map(i => `
      <div class="fm-file" data-type="${i.type}" data-app="${i.app || ''}" data-name="${i.name}">
        <div class="file-icon">${i.icon}</div>
        <span>${i.name}</span>
      </div>
    `).join('')}</div>`;

    main.querySelectorAll('.fm-file').forEach(el => {
      el.addEventListener('dblclick', () => {
        const type = el.dataset.type;
        if (type === 'app' && el.dataset.app) {
          windowManager.openApp(el.dataset.app);
        } else if (type === 'file') {
          showToast(`Opened ${el.dataset.name}`, 'info');
        } else {
          // folder navigation could be expanded
          showToast(`${el.dataset.name} folder`, 'info');
        }
      });
    });
  }

  sidebar.querySelectorAll('.fm-item').forEach(item => {
    item.addEventListener('click', () => {
      sidebar.querySelectorAll('.fm-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      render(item.dataset.loc);
    });
  });

  wrap.append(sidebar, main);
  container.appendChild(wrap);
  render('home');
}

function createCalculator(container) {
  const wrap = document.createElement('div');
  wrap.className = 'p-4 h-full flex flex-col';

  const display = document.createElement('div');
  display.className = 'calc-display';
  display.textContent = '0';

  const grid = document.createElement('div');
  grid.className = 'calc-grid flex-1';

  const buttons = [
    { t: 'C', c: 'clear' }, { t: '±', c: 'op' }, { t: '%', c: 'op' }, { t: '÷', c: 'op' },
    { t: '7' }, { t: '8' }, { t: '9' }, { t: '×', c: 'op' },
    { t: '4' }, { t: '5' }, { t: '6' }, { t: '−', c: 'op' },
    { t: '1' }, { t: '2' }, { t: '3' }, { t: '+', c: 'op' },
    { t: '0' }, { t: '.' }, { t: '⌫' }, { t: '=', c: 'eq' }
  ];

  let current = '0';
  let previous = null;
  let operator = null;
  let resetNext = false;

  function update() {
    display.textContent = current.length > 12 ? parseFloat(current).toExponential(6) : current;
  }

  function calculate() {
    const a = parseFloat(previous);
    const b = parseFloat(current);
    switch (operator) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 'Error' : a / b;
      default: return b;
    }
  }

  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = `calc-btn ${b.c || ''}`;
    btn.textContent = b.t;
    btn.onclick = () => {
      const t = b.t;
      if (t >= '0' && t <= '9' || t === '.') {
        if (resetNext) { current = '0'; resetNext = false; }
        if (t === '.' && current.includes('.')) return;
        current = current === '0' && t !== '.' ? t : current + t;
      } else if (t === 'C') {
        current = '0'; previous = null; operator = null;
      } else if (t === '⌫') {
        current = current.length > 1 ? current.slice(0, -1) : '0';
      } else if (t === '±') {
        current = String(parseFloat(current) * -1);
      } else if (t === '%') {
        current = String(parseFloat(current) / 100);
      } else if (['+', '−', '×', '÷'].includes(t)) {
        if (previous !== null && operator && !resetNext) {
          current = String(calculate());
        }
        previous = current;
        operator = t;
        resetNext = true;
      } else if (t === '=') {
        if (previous !== null && operator) {
          current = String(calculate());
          previous = null;
          operator = null;
          resetNext = true;
        }
      }
      update();
    };
    grid.appendChild(btn);
  });

  wrap.append(display, grid);
  container.appendChild(wrap);
}

function createNotepad(container) {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col h-full';

  const toolbar = document.createElement('div');
  toolbar.className = 'flex items-center gap-2 px-3 py-2 bg-black/20 border-b border-white/5 text-xs';
  toolbar.innerHTML = `
    <button class="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10" id="np-new">New</button>
    <button class="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10" id="np-save">Save</button>
    <span class="text-slate-500 ml-auto" id="np-status">Unsaved</span>
  `;

  const textarea = document.createElement('textarea');
  textarea.className = 'notepad-textarea';
  textarea.placeholder = 'Start typing...';
  textarea.value = localStorage.getItem('aether-notes') || 'Welcome to AetherOS Notes!\n\nYour notes are saved automatically in the browser.';

  wrap.append(toolbar, textarea);
  container.appendChild(wrap);

  let saved = true;
  textarea.addEventListener('input', () => {
    saved = false;
    toolbar.querySelector('#np-status').textContent = 'Unsaved';
  });

  toolbar.querySelector('#np-save').onclick = () => {
    localStorage.setItem('aether-notes', textarea.value);
    saved = true;
    toolbar.querySelector('#np-status').textContent = 'Saved ✓';
    showToast('Notes saved', 'success');
  };

  toolbar.querySelector('#np-new').onclick = () => {
    if (!saved && !confirm('Discard unsaved changes?')) return;
    textarea.value = '';
    saved = true;
    toolbar.querySelector('#np-status').textContent = 'New file';
  };
}

function createSettings(container) {
  const wrap = document.createElement('div');
  wrap.className = 'h-full overflow-y-auto';

  const wallpapers = [
    { id: 'space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80', name: 'Deep Space' },
    { id: 'aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', name: 'Aurora' },
    { id: 'mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', name: 'Mountains' },
    { id: 'ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80', name: 'Ocean' },
    { id: 'city', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80', name: 'City Night' },
    { id: 'forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', name: 'Forest' }
  ];

  wrap.innerHTML = `
    <div class="settings-section">
      <h3>Appearance</h3>
      <p class="text-sm text-slate-400 mb-3">Choose a wallpaper</p>
      <div class="flex flex-wrap gap-3" id="wallpaper-grid"></div>
    </div>
    <div class="settings-section">
      <h3>System</h3>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-center">
          <span>Version</span>
          <span class="text-slate-400">AetherOS 1.0.0</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Platform</span>
          <span class="text-slate-400">Web / GitHub Pages</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Theme</span>
          <span class="text-slate-400">Dark Glass</span>
        </div>
      </div>
    </div>
    <div class="settings-section">
      <h3>About</h3>
      <p class="text-sm text-slate-400 leading-relaxed">
        AetherOS is a modern desktop simulation built with pure HTML, CSS & JavaScript.
        Designed to run perfectly on GitHub Pages with no build step required.
      </p>
    </div>
  `;

  const grid = wrap.querySelector('#wallpaper-grid');
  const current = localStorage.getItem('aether-wallpaper') || wallpapers[0].url;

  wallpapers.forEach(w => {
    const el = document.createElement('div');
    el.className = `wallpaper-option ${w.url === current ? 'active' : ''}`;
    el.style.backgroundImage = `url('${w.url}')`;
    el.title = w.name;
    el.onclick = () => {
      document.getElementById('wallpaper').style.backgroundImage = `url('${w.url}')`;
      localStorage.setItem('aether-wallpaper', w.url);
      grid.querySelectorAll('.wallpaper-option').forEach(o => o.classList.remove('active'));
      el.classList.add('active');
      showToast(`Wallpaper: ${w.name}`, 'success');
    };
    grid.appendChild(el);
  });

  container.appendChild(wrap);
}

function createAbout(container) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full p-8 text-center">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-4xl mb-5 shadow-lg shadow-sky-500/20">
        🌌
      </div>
      <h2 class="text-2xl font-semibold mb-1">AetherOS</h2>
      <p class="text-sky-400 text-sm mb-6">Version 1.0.0</p>
      <p class="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
        A beautiful, fully interactive web-based operating system simulation.
        Built with modern web technologies and designed to work seamlessly on GitHub Pages.
      </p>
      <div class="flex flex-wrap justify-center gap-2 text-xs">
        <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10">HTML5</span>
        <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10">Tailwind CSS</span>
        <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10">Vanilla JS</span>
        <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10">GitHub Pages Ready</span>
      </div>
      <p class="text-slate-500 text-xs mt-8">Inspired by modern desktop environments</p>
    </div>
  `;
}
