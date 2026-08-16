import { useEffect, useState } from "react";
import { api } from "../api.js";
import ResumoFinanceiro from "../components/ResumoFinanceiro.jsx";

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Financeiro() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .resumoGeral()
      .then(setResumo)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="conteudo">
      <h2 className="secao-titulo">Financeiro</h2>
      <p className="secao-descricao">Quanto você gastou, vendeu e lucrou.</p>

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
