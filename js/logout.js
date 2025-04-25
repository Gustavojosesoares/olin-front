// js/logout.js
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      console.log('Botão de logout clicado.');

      // Limpar qualquer token de autenticação do localStorage (se estiver usando)
      localStorage.removeItem('authToken'); // Substitua 'authToken' pelo nome da sua chave

      // Redirecionar o usuário para a página de login
      window.location.href = '../login/login.html';

      alert('Você foi deslogado com sucesso!'); // Opcional: feedback ao usuário
    });
  }
});
