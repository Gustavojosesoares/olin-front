// login.js - Lógica para lidar com o formulário de login e chamar a API de login
// Importa a função de login do arquivo api.js
import { login as apiLogin } from '../js/api.js';

// Se você precisar usar getProtectedData ou outras funções da API nesta página, importe-as aqui:
// import { getProtectedData } from './api.js';

// Certifica-se de que o script só rode depois que a página for completamente carregada
document.addEventListener('DOMContentLoaded', () => {
  console.log('login.js carregado e DOM pronto.'); // Log para depuração

  // Obtém referências para os elementos do formulário no HTML
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginErrorDisplay = document.getElementById('loginError'); // Onde exibir mensagens de erro

  // Verifica se todos os elementos necessários foram encontrados
  if (!loginForm || !emailInput || !passwordInput || !loginErrorDisplay) {
    console.error(
      'Erro crítico: Um ou mais elementos do formulário de login (loginForm, email, password, loginError) não foram encontrados no HTML!'
    );
    // Exibir uma mensagem visível se os elementos essenciais não existirem
    const body = document.body;
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.style.color = 'red';
    errorMessageDiv.textContent =
      'Erro interno: A página não pode carregar corretamente o formulário de login.';
    body.insertBefore(errorMessageDiv, body.firstChild); // Insere a mensagem no início do body
    return; // Interrompe a execução do script
  }

  console.log('Elementos do formulário encontrados.'); // Log para depuração

  // Adiciona um "ouvinte" para o evento de SUBMIT do formulário
  loginForm.addEventListener('submit', async event => {
    event.preventDefault(); // Previne o comportamento padrão do formulário (envio síncrono)
    console.log('Evento de submit do formulário detectado.'); // Log para depuração

    // Limpa mensagens de erro anteriores
    loginErrorDisplay.textContent = '';

    // Obtém os valores atuais dos campos de email e senha
    const email = emailInput.value.trim(); // Use trim() para remover espaços em branco extras
    const password = passwordInput.value; // Senhas geralmente não devem ter trim()

    console.log(`Tentativa de login com Email: ${email}`); // Log para depuração (NÃO LOGUE SENHAS EM PRODUÇÃO!)

    // Validação básica dos campos no frontend
    if (!email || !password) {
      loginErrorDisplay.textContent = 'Por favor, preencha todos os campos.';
      console.warn('Campos de email ou senha vazios.'); // Log para depuração
      return; // Interrompe se algum campo estiver vazio
    }

    try {
      console.log('Pronto para chamar apiLogin.'); // Log para depuração

      // CHAMA A FUNÇÃO DE LOGIN APENAS UMA VEZ E DECLARA 'data' COM const
      const data = await apiLogin(email, password); // <-- CORRIGIDO: APENAS UMA DECLARAÇÃO AQUI

      // Se chegou aqui, a chamada para apiLogin() foi bem-sucedida (sem lançar erro)
      // data conterá a resposta do backend (geralmente { token: '...', user: {...} })

      console.log('Chamada apiLogin concluída com sucesso.'); // Log para depuração

      // Armazena o token no localStorage
      if (data && data.token) {
        console.log('Token recebido:', data.token ? 'Sim' : 'Não');
        localStorage.setItem('seuToken', data.token);
        console.log('Login bem-sucedido!', data);
        console.log('Token armazenado no localStorage.');

        // Redirecionar para a página inicial
        console.log('Redirecionando para a página inicial...');
        window.location.href = '../index.html';
      } else {
        console.error('Login bem-sucedido no fetch, mas nenhum token recebido na resposta da API.');
        loginErrorDisplay.textContent = 'Erro interno: Resposta da API incompleta ou inesperada.';
      }
    } catch (error) {
      // Captura erros lançados pela função apiLogin (erros de rede, erros do backend com status != 2xx, etc.)
      console.error('Erro capturado no handler do submit:', error); // Log no console do navegador
      // A mensagem de erro já foi definida dentro da função apiLogin,
      loginErrorDisplay.textContent = `Erro ao logar: ${error.message}`;

      // limpar campo de senha em caso de falha
      passwordInput.value = '';
    }
  });
});
