(() => {
  const $ = (s) => document.querySelector(s);
  try{const t=window.parent.document.documentElement.dataset.theme||localStorage.getItem('erbolamm-panel-theme');if(t)document.documentElement.dataset.theme=t;}catch{}
  const slug = document.body.dataset.slug || '';
  const origin = location.origin;
  const urls = { tab: `${origin}/vista/${slug}`, office: `${origin}/` };
  const ic=(d)=>'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>'; const icons={WhatsApp:ic('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z"/>'),Telegram:ic('<path d="M22 2 11 13M22 2 15 22l-4-9-9-4z"/>'),X:ic('<path d="M4 4l16 16M20 4 4 20"/>'),Facebook:ic('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'),LinkedIn:ic('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'),Correo:ic('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'),Copiar:ic('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),Compartir:ic('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4"/>')};
  const share = $('#share');
  const status = $('#status');
  const back = $('.back');
  let scope = 'tab';

  if (!share) return;
  if (window.self !== window.top && back) back.hidden = true;

  const say = (text) => {
    if (!status) return;
    status.textContent = text;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => { status.textContent = ''; }, 2200);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } finally { ta.remove(); }
    }
    say('Texto y enlace copiados');
  };

  const hashtags = '#ApliArte #ErBolamm #OficinaApliArte';
  const msg = (u, t) => `${t} ${hashtags} ${u}`;

  const targets = [
    ['WhatsApp', (u, t) => `https://wa.me/?text=${encodeURIComponent(msg(u, t))}`],
    ['Telegram', (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(msg(u, t))}`],
    ['X', (u, t) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(msg(u, t))}`],
    ['Facebook', (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`],
    ['LinkedIn', (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`],
    ['Correo', (u, t) => `mailto:?subject=${encodeURIComponent(msg(u, t))}&body=${encodeURIComponent(u)}`]
  ];

  const render = () => {
    const url = urls[scope];
    const title = document.title;
    share.textContent = '';
    for (const [name, build] of targets) {
      const a = document.createElement('a');
      a.href = build(url, title);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', `Compartir en ${name}`);
      a.innerHTML = icons[name] + `<span>${name}</span>`;
      if (name === 'Facebook' || name === 'LinkedIn') {
        const cb = document.createElement('button');
        cb.type = 'button';
        cb.setAttribute('aria-label', `Copiar texto para ${name}`);
        cb.innerHTML = icons.Copiar + `<span>Copiar para ${name}</span>`;
        cb.addEventListener('click', () => copy(msg(url, title)));
        share.appendChild(cb);
      }
      share.appendChild(a);
    }
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Copiar enlace');
    copyBtn.innerHTML = icons.Copiar + '<span>Copiar</span>';
    copyBtn.addEventListener('click', () => copy(url));
    share.appendChild(copyBtn);
    const native = document.createElement('button');
    native.type = 'button';
    native.setAttribute('aria-label', 'Compartir');
    native.innerHTML = icons.Compartir + '<span>Compartir</span>';
    native.addEventListener('click', async () => {
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch {}
      } else {
        await copy(url);
      }
    });
    share.appendChild(native);
  };

  document.querySelectorAll('.seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      scope = btn.dataset.scope === 'office' ? 'office' : 'tab';
      document.querySelectorAll('.seg button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      render();
    });
  });

  render();
})();
