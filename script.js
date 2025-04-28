// js/script.js

const API_URL = 'https://case-api-icfc.onrender.com/api/login';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');
  const togglePassword = document.getElementById('togglePassword');

  // Alternar visualização da senha
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.innerHTML =
      type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
  });

  // Evento de login
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginError.textContent = '';

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      loginError.textContent = 'Preencha todos os campos.';
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro no login' }));
        throw new Error(errorData.message || 'Erro ao tentar login.');
      }

      const data = await response.json();

      // ✅ Salva token, id e role no localStorage
      localStorage.setItem('token', data.token); // token correto
      localStorage.setItem('userId', data.user._id); // ID do usuário
      localStorage.setItem('userRole', data.user.role); // (se precisar de permissões)

      console.log('Login bem-sucedido!', data);

      // Redireciona para página principal (exemplo: inicio.html)
      window.location.href = '../inicio/inicio.html';
    } catch (error) {
      console.error('Erro no login:', error);
      loginError.textContent = error.message || 'Erro ao tentar login.';
    }
  });
});
