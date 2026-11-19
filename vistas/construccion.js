(() => {
  const $ = (s) => document.querySelector(s);
  const slug = document.body.dataset.slug || '';
  const origin = location.origin;
  const urls = { tab: `${origin}/vista/${slug}`, office: `${origin}/` };
  const icon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4"/></svg>';
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
    say('Enlace copiado');
  };

  const targets = [
    ['WhatsApp', (u, t) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}`],
    ['Telegram', (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`],
    ['X', (u, t) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`],
    ['Facebook', (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`],
    ['LinkedIn', (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`],
    ['Correo', (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}`]
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
      a.innerHTML = icon + `<span>${name}</span>`;
      share.appendChild(a);
    }
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Copiar enlace');
    copyBtn.innerHTML = icon + '<span>Copiar</span>';
    copyBtn.addEventListener('click', () => copy(url));
    share.appendChild(copyBtn);
    const native = document.createElement('button');
    native.type = 'button';
    native.setAttribute('aria-label', 'Compartir');
    native.innerHTML = icon + '<span>Compartir</span>';
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
