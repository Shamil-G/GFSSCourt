function showPopover(target, html) {
  const old = document.querySelector('.popover');
  if (old) old.remove();

  const pop = document.createElement('div');
  pop.className = 'popover';

  // Крестик
  const close = document.createElement('span');
  close.className = 'popover-close';
  close.textContent = '×';
  close.title = 'Закрыть справку';
  close.onclick = () => {
    pop.remove();
    document.removeEventListener('click', outsideClickHandler);
  };
  pop.appendChild(close);

  // Контент справки
  const content = document.createElement('div');
  content.className = 'popover-content';
  content.innerHTML = html;
  pop.appendChild(content);

  document.body.appendChild(pop);

  const rect = target.getBoundingClientRect();
  pop.style.top = `${rect.bottom + window.scrollY + 6}px`;
  pop.style.left = `${rect.left + window.scrollX}px`;

  // 🔹 Обработка клика вне popover
  function outsideClickHandler(e) {
    if (!pop.contains(e.target) && e.target !== target) {
      pop.remove();
      document.removeEventListener('click', outsideClickHandler);
    }
  }

  setTimeout(() => document.addEventListener('click', outsideClickHandler), 0);
}