import { useEffect, useState } from "react";
import { api } from "../api.js";
import ResumoFinanceiro from "../components/ResumoFinanceiro.jsx";

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Nome do mês atual, tipo "agosto de 2026" - só pra dar contexto na tela.
const nomeMesAtual = new Date().toLocaleDateString("pt-BR", {
  month: "long",
  year: "numeric",
});

export default function Financeiro() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  // Por padrão mostra só o mês atual. O histórico completo continua
  // salvo no banco normalmente - isso aqui só decide o que aparece na
  // tela até o usuário clicar pra ver tudo.
  const [verHistoricoCompleto, setVerHistoricoCompleto] = useState(false);

  function carregar(mostrarTudo) {
    setCarregando(true);
    setErro("");
    api
      .resumoGeral(!mostrarTudo)
      .then(setResumo)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar(verHistoricoCompleto);
  }, [verHistoricoCompleto]);

  return (
    <div className="conteudo">
      <h2 className="secao-titulo">Financeiro</h2>
      <p className="secao-descricao">
        {verHistoricoCompleto
          ? "Todo o histórico de compras e vendas."
          : `Mostrando só ${nomeMesAtual}. O histórico completo continua salvo.`}
      </p>

      <button
        type="button"
        className="botao-secundario botao-largura-total"
        onClick={() => setVerHistoricoCompleto((atual) => !atual)}
      >
        {verHistoricoCompleto ? "Ver só este mês" : "Ver histórico completo"}
      </button>

      {carregando && <p className="texto-carregando">Carregando...</p>}
      {erro && <p className="mensagem-erro mensagem-erro-central">{erro}</p>}

      {!carregando && !erro && resumo && (
        <>
          <ResumoFinanceiro resumo={resumo} />

          <h3 className="secao-titulo secao-titulo-espacada">Por mercadoria</h3>

          {resumo.produtos.length === 0 ? (
            <p className="texto-vazio">Nenhum produto cadastrado ainda.</p>
          ) : (
            <ul className="lista-cartoes">
              {resumo.produtos.map((p) => (
                <li key={p.produto_id} className="cartao-item cartao-item-coluna">
                  <span className="cartao-item-nome">{p.nome}</span>

                  <div className="tabela-financeira">
                    <div className="tabela-financeira-linha">
                      <span>Gasto (comprado)</span>
                      <span className="recibo-linha-valor">
                        {formatarMoeda(p.total_investido)}
                      </span>
                    </div>
                    <div className="tabela-financeira-linha">
                      <span>Vendido</span>
                      <span className="recibo-linha-valor">
                        {formatarMoeda(p.total_vendido_valor)}
                      </span>
                    </div>
                    <div className="tabela-financeira-linha">
                      <span>Custo médio (por un.)</span>
                      <span className="recibo-linha-valor">
                        {formatarMoeda(p.custo_medio)}
                      </span>
                    </div>
                    <div className="tabela-financeira-linha tabela-financeira-destaque">
                      <span>{p.lucro >= 0 ? "Lucro" : "Prejuízo"}</span>
                      <span className={p.lucro >= 0 ? "valor-lucro" : "valor-prejuizo"}>
                        {formatarMoeda(p.lucro)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
