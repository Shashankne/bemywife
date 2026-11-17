async function loadComponent(targetSelector, path) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const res = await fetch(path);
  const html = await res.text();
  target.innerHTML = html;
}

async function loadData(path) {
  const res = await fetch(path);
  return res.json();
}

function makeNoButtonJuggle() {
  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');
  const choices = document.getElementById('choices') || (noBtn && noBtn.parentElement);
  if (!noBtn || !yesBtn || !choices) return;

  let tempActive = false;

  function keyHandler(ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      yesBtn.click();
    }
  }

  function activateTemp() {
    if (tempActive) return;
    tempActive = true;

    if (!noBtn.dataset.origText) noBtn.dataset.origText = noBtn.textContent;
    noBtn.classList.remove('no', 'initial');
    noBtn.classList.add('yes');
    noBtn.textContent = 'Be My Wife';

    noBtn._origOnclick = noBtn.onclick;
    noBtn.onclick = (e) => {
      e.preventDefault();
      yesBtn.click();
    };
    noBtn.addEventListener('keydown', keyHandler);

    if (noBtn.getAttribute('tabindex') === '-1') noBtn.removeAttribute('tabindex');
  }

  function deactivateTemp() {
    if (!tempActive) return;
    tempActive = false;

    noBtn.classList.remove('yes');
    noBtn.classList.add('no');
    noBtn.textContent = noBtn.dataset.origText || 'Maybe Later';
    noBtn.onclick = noBtn._origOnclick || null;
    noBtn.removeEventListener('keydown', keyHandler);

    if (!noBtn.hasAttribute('tabindex')) noBtn.setAttribute('tabindex', '-1');
  }

  choices.addEventListener('mousemove', (e) => {
    const bRect = noBtn.getBoundingClientRect();
    const dx = e.clientX - (bRect.left + bRect.width / 2);
    const dy = e.clientY - (bRect.top + bRect.height / 2);
    const dist = Math.hypot(dx, dy);

    if (dist < 120) activateTemp();
    else if (!noBtn.matches(':focus')) deactivateTemp();
  });

  noBtn.addEventListener('mouseenter', activateTemp);
  noBtn.addEventListener('mouseleave', () => {
    if (!noBtn.matches(':focus')) deactivateTemp();
  });

  noBtn.addEventListener('focus', activateTemp);
  noBtn.addEventListener('blur', deactivateTemp);

  noBtn.addEventListener('pointerdown', activateTemp);
  document.addEventListener('pointerup', () => {
    if (!noBtn.matches(':focus')) deactivateTemp();
  });

  deactivateTemp();
}

function initYesButton() {
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const container = document.querySelector('.romantic-card');
  if (!yesBtn || !container) return;

  const confirmEl = container.querySelector('.yes-confirm') || document.createElement('div');
  confirmEl.className = 'yes-confirm';
  confirmEl.innerHTML = '<strong>I love you ❤️</strong><br>Forever starts with us.';

  if (!container.querySelector('.yes-confirm')) {
    container.appendChild(confirmEl);
  }

  const reveal = document.querySelector('.hover-reveal');
  const showReveal = () => {
    if (reveal) reveal.classList.add('show');
  };

  [yesBtn, noBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', showReveal);
    btn.addEventListener('pointerdown', showReveal);
    btn.addEventListener('focus', showReveal);
    btn.addEventListener('mouseenter', showReveal);
  });

  yesBtn.addEventListener('click', () => {
    showReveal();
    confirmEl.classList.add('show');
    yesBtn.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
      { duration: 500 }
    );

    clearTimeout(confirmEl._hideTimeout);
    confirmEl._hideTimeout = setTimeout(() => {
      confirmEl.classList.remove('show');
    }, 6000);
  });
}

async function init() {
  await loadComponent('#proposal-card', 'components/wife-card.html');

  makeNoButtonJuggle();
  initYesButton();

  const data = await loadData('data/messages.json');
  const titleEl = document.getElementById('wife-title');
  const textEl = document.getElementById('wife-text');
  const promisesEl = document.getElementById('promises');

  if (titleEl) titleEl.textContent = data.title;
  if (textEl) textEl.textContent = data.message;
  if (promisesEl) {
    promisesEl.innerHTML = data.promises.map((p) => `<li>${p}</li>`).join('');
  }

  const copyEl = document.getElementById('copy-message');
  if (copyEl) {
    copyEl.addEventListener('click', async () => {
      const text = `${data.title}\n\n${data.message}\n\nPromises:\n- ${data.promises.join('\n- ')}`;
      try {
        await navigator.clipboard.writeText(text);
        const status = document.getElementById('status');
        if (status) status.textContent = 'Message copied to clipboard.';
      } catch {
        const status = document.getElementById('status');
        if (status) status.textContent = 'Could not copy — try selecting and copying manually.';
      }
    });
  }

  const showMoreEl = document.getElementById('show-more');
  if (showMoreEl) {
    showMoreEl.addEventListener('click', () => {
      alert('I love you, and I choose you every day.');
    });
  }
}

init();