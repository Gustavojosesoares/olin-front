// api.js - Arquivo para centralizar as chamadas à API do backend

// Base URL da sua API hospedada no Render
const API_BASE_URL = 'https://case-api-icfc.onrender.com/api';

/**
 * Envia as credenciais de login para o backend para obter um token.
 * @param {string} email - O email do usuário.
 * @param {string} password - A senha do usuário.
 * @returns {Promise<object>} - Uma Promise que resolve com os dados da resposta do login (incluindo o token) em caso de sucesso.
 * @throws {Error} - Lança um erro se a requisição falhar (rede, status HTTP != 2xx).
 */
export async function login(email, password) {
  const loginUrl = `${API_BASE_URL}/login`; // Endpoint de login

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Indica que o corpo da requisição é JSON
      },
      body: JSON.stringify({ email, password }) // Converte o objeto JS para string JSON
    });

    // Verifica se a resposta HTTP indica sucesso (status 2xx)
    if (!response.ok) {
      // Tenta ler o corpo da resposta para obter detalhes do erro do backend
      // Usamos .catch() para garantir que não falhemos se o backend não retornar JSON em caso de erro
      const errorData = await response
        .json()
        .catch(() => ({ message: `Erro no servidor com status: ${response.status}` }));
      const errorMessage = errorData.message || `Falha na requisição de login: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status; // Adiciona o status HTTP ao objeto Error
      throw error; // Lança o erro para ser capturado no código que chama esta função
    }

    // Se a resposta for OK, lê o corpo da resposta como JSON
    const data = await response.json();
    return data; // Retorna os dados recebidos (geralmente inclui o token e info do usuário)
  } catch (error) {
    // Captura erros de rede ou erros lançados no bloco try
    console.error('Erro ao realizar a chamada da API de login:', error);
    throw error; // Re-lança o erro para que o código de UI possa tratá-lo (ex: exibir mensagem para o usuário)
  }
}

/**
 * Faz uma requisição para uma rota protegida que requer autenticação.
 * @param {string} token - O token JWT usado no cabeçalho Authorization.
 * @param {string} endpoint - O caminho do endpoint protegido (ex: '/protegido', '/usuarios').
 * @returns {Promise<object>} - Uma Promise que resolve com os dados da rota protegida em caso de sucesso.
 * @throws {Error} - Lança um erro se a requisição falhar (rede, status HTTP != 2xx, token inválido/expirado).
 */
export async function getProtectedData(token, endpoint) {
  const protectedUrl = `${API_BASE_URL}${endpoint}`; // Monta a URL completa

  if (!token) {
    const error = new Error('Token de autenticação não fornecido.');
    error.status = 401; // Não autorizado
    throw error;
  }

  try {
    const response = await fetch(protectedUrl, {
      method: 'GET', // Ou outro método (POST, PUT, DELETE) conforme o endpoint
      headers: {
        Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho Authorization
        // 'Content-Type': 'application/json' // Geralmente não necessário para GET sem body
      }
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Erro no servidor com status: ${response.status}` }));
      const errorMessage =
        errorData.message || `Falha na requisição para ${endpoint}: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      // Se for 401 ou 403, pode significar token inválido/expirado
      if (response.status === 401 || response.status === 403) {
        console.warn(`Acesso negado ou token inválido para ${endpoint}.`);
        // Você pode querer lançar um erro mais específico ou lidar com isso na UI
      }
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao acessar ${endpoint}:`, error);
    throw error; // Re-lança o erro
  }
}
