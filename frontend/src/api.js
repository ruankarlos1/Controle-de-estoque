// Endereço do backend. Em produção (depois do deploy), isso deve virar
// uma variável de ambiente (import.meta.env.VITE_API_URL) em vez de fixo.
const API_URL = "http://localhost:8000";

function pegarToken() {
  return localStorage.getItem("token");
}

function salvarToken(token) {
  localStorage.setItem("token", token);
}

function removerToken() {
  localStorage.removeItem("token");
}

/**
 * Faz uma requisição à API e já traduz os erros mais comuns para mensagens
 * simples em português - o pai do usuário nunca deve ver "401" ou "fetch failed".
 */
async function requisitar(caminho, opcoes = {}) {
  const token = pegarToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.headers,
  };

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers });
  } catch (erro) {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente de novo."
    );
  }

  if (resposta.status === 401) {
    removerToken();
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  if (!resposta.ok) {
    let detalhe = "Algo deu errado. Tente novamente.";
    try {
      const corpo = await resposta.json();
      if (typeof corpo.detail === "string") detalhe = corpo.detail;
    } catch {
      // resposta sem corpo JSON - mantém a mensagem genérica
    }
    throw new Error(detalhe);
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

export const api = {
  async login(email, senha) {
    const dados = await requisitar("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    salvarToken(dados.access_token);
    return dados;
  },

  async registrar(nome, email, senha) {
    return requisitar("/auth/registrar", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha }),
    });
  },

  sair() {
    removerToken();
  },

  estaLogado() {
    return !!pegarToken();
  },

  listarProdutos() {
    return requisitar("/produtos/");
  },

  criarProduto(produto) {
    return requisitar("/produtos/", {
      method: "POST",
      body: JSON.stringify(produto),
    });
  },

  excluirProduto(id) {
    return requisitar(`/produtos/${id}`, { method: "DELETE" });
  },

  criarMovimentacao(mov) {
    return requisitar("/movimentacoes/", {
      method: "POST",
      body: JSON.stringify(mov),
    });
  },

  resumoGeral() {
    return requisitar("/relatorios/geral");
  },

  listarClientes() {
    return requisitar("/clientes/");
  },

  criarCliente(cliente) {
    return requisitar("/clientes/", {
      method: "POST",
      body: JSON.stringify(cliente),
    });
  },

  excluirCliente(id) {
    return requisitar(`/clientes/${id}`, { method: "DELETE" });
  },

  comprasDoCliente(id) {
    return requisitar(`/clientes/${id}/compras`);
  },

  fiadosPendentes() {
    return requisitar("/fiado/pendentes");
  },

  fiadoPorCliente() {
    return requisitar("/fiado/por-cliente");
  },

  marcarFiadoPago(movimentacaoId) {
    return requisitar(`/fiado/${movimentacaoId}/pagar`, { method: "POST" });
  },
};
