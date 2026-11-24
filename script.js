document.addEventListener('DOMContentLoaded', () => {
  // Preferência de aparência compartilhada entre as páginas.
  const themeButton = document.querySelector('.theme-toggle');
  const storageKey = 'cosmos-theme';
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (!themeButton) return;
    const light = theme === 'light';
    themeButton.querySelector('.theme-icon').textContent = light ? '🌙' : '☀️';
    themeButton.querySelector('.theme-label').textContent = light ? 'Modo escuro' : 'Modo claro';
    themeButton.setAttribute('aria-label', light ? 'Ativar modo escuro' : 'Ativar modo claro');
    themeButton.title = light ? 'Alternar para modo escuro' : 'Alternar para modo claro';
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem(storageKey); } catch (_) { /* armazenamento indisponível */ }
  applyTheme(savedTheme || systemTheme);

  themeButton?.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(storageKey, nextTheme); } catch (_) { /* tema funciona mesmo sem persistência */ }
    applyTheme(nextTheme);
  });

  const form = document.getElementById('leadForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const origem = params.get('origem') || 'acesso_direto';
  document.getElementById('origemLead').value = origem;

  const whatsInput = document.getElementById('whatsapp');
  whatsInput.addEventListener('input', (event) => {
    let digits = event.target.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length > 7) digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    else if (digits.length > 2) digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    else if (digits.length > 0) digits = `(${digits}`;
    event.target.value = digits;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const whatsapp = whatsInput.value.trim();
    const errors = {
      nome: document.getElementById('erroNome'),
      email: document.getElementById('erroEmail'),
      whats: document.getElementById('erroWhats')
    };
    Object.values(errors).forEach((el) => { el.textContent = ''; });

    let valid = true;
    if (nome.length < 3) { errors.nome.textContent = 'Digite um nome com pelo menos 3 caracteres.'; valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errors.email.textContent = 'Digite um e-mail válido.'; valid = false; }
    if (whatsapp.replace(/\D/g, '').length < 10) { errors.whats.textContent = 'Digite um número com DDD.'; valid = false; }
    if (!valid) return;

    const lead = { nome, email, whatsapp, origem, dataCadastro: new Date().toLocaleString('pt-BR') };
    try {
      const leads = JSON.parse(localStorage.getItem('cosmos_interessados') || '[]');
      leads.push(lead);
      localStorage.setItem('cosmos_interessados', JSON.stringify(leads));
    } catch (error) {
      console.warn('Não foi possível salvar os dados neste navegador.', error);
    }

    form.classList.add('hidden');
    document.querySelector('.form-panel h2')?.classList.add('hidden');
    document.querySelector('.form-intro')?.classList.add('hidden');
    document.getElementById('userNameSuccess').textContent = nome.split(/\s+/)[0];
    document.getElementById('successBox').classList.remove('hidden');
  });
});
