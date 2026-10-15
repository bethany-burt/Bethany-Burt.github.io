/* No packages or build step. Works when index.html is opened directly. */
(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('bethany-theme'); } catch (_) {}
  function setTheme(theme) {
    root.dataset.theme = theme;
    if (themeButton) {
      themeButton.textContent = theme === 'day' ? 'Evening ◐' : 'Daylight ◑';
      themeButton.setAttribute('aria-label', `Switch to ${theme === 'day' ? 'evening' : 'daylight'} colours`);
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'day' ? '#f4f0e6' : '#1d2b32';
  }
  setTheme(savedTheme === 'day' ? 'day' : 'evening');
  themeButton?.removeAttribute('hidden');
  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'day' ? 'evening' : 'day';
    setTheme(next);
    try { localStorage.setItem('bethany-theme', next); } catch (_) {}
  });

  // Drop assets/portrait.jpg into the folder to replace the illustration.
  const photo = document.querySelector('[data-portrait]');
  if (photo) {
    const reveal = () => {
      if (!photo.naturalWidth) return;
      photo.hidden = false;
      const placeholder = document.querySelector('.portrait-placeholder');
      if (placeholder) placeholder.hidden = true;
    };
    photo.addEventListener('load', reveal);
    if (photo.complete) reveal();
  }

  const explorer = document.querySelector('.scale-explorer');
  if (!explorer) return;
  explorer.hidden = false;
  const states = ['stars', 'planets', 'molecules'];
  const labels = ['Stellar scale', 'Planetary scale', 'Molecular scale'];
  const figure = document.querySelector('.science-figure');
  const nextButton = document.querySelector('[data-next]');
  const previousButton = document.querySelector('[data-previous]');
  const hotspot = document.querySelector('[data-hotspot]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 'stars';
  let timer;
  function show(state) {
    current = states.includes(state) ? state : 'stars';
    clearTimeout(timer);
    figure.classList.remove('zooming');
    document.querySelectorAll('.research-panel').forEach(panel => { panel.hidden = panel.id !== current; });
    document.querySelectorAll('.scene').forEach(scene => {
      const active = scene.dataset.scene === current;
      scene.classList.toggle('is-visible', active);
      scene.setAttribute('aria-hidden', String(!active));
    });
    document.querySelectorAll('.research-nav a').forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const i = states.indexOf(current);
    document.querySelector('[data-scale-label]').textContent = `${String(i + 1).padStart(2, '0')} / ${labels[i]}`;
    previousButton.textContent = `← ${['Molecules', 'Stars', 'Planets'][i]}`;
    nextButton.textContent = ['Zoom into a planet →', 'Zoom into molecules →', 'Through the atom → stars'][i];
    hotspot.textContent = ['Explore the planet ↗', 'Explore molecules ↗', 'Back through the atom ↗'][i];
    [nextButton, previousButton, hotspot].forEach(button => { button.disabled = false; });
  }
  function navigate(direction) {
    const i = states.indexOf(current);
    const next = states[(i + direction + states.length) % states.length];
    const commit = () => { history.pushState(null, '', `#${next}`); show(next); };
    if (reduced.matches) { commit(); return; }
    [nextButton, previousButton, hotspot].forEach(button => { button.disabled = true; });
    figure.classList.add('zooming');
    if (current === 'molecules' && direction === 1) {
      timer = setTimeout(() => {
        figure.classList.remove('zooming');
        document.querySelectorAll('.scene').forEach(scene => {
          const active = scene.dataset.scene === 'atom';
          scene.classList.toggle('is-visible', active);
          scene.setAttribute('aria-hidden', String(!active));
        });
        document.querySelector('[data-scale-label]').textContent = 'An orbital echo';
        timer = setTimeout(commit, 900);
      }, 300);
    } else {
      timer = setTimeout(commit, 350);
    }
  }
  nextButton.addEventListener('click', () => navigate(1));
  hotspot.addEventListener('click', () => navigate(1));
  previousButton.addEventListener('click', () => navigate(-1));
  document.querySelectorAll('.research-nav a').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    history.pushState(null, '', link.hash);
    show(link.hash.slice(1));
  }));
  window.addEventListener('popstate', () => show(window.location.hash.slice(1)));
  window.addEventListener('hashchange', () => show(window.location.hash.slice(1)));
  show(window.location.hash.slice(1));
})();
