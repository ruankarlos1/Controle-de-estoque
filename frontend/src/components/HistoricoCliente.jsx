import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function HistoricoCliente({ cliente, aoFechar }) {
  const [compras, setCompras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .comprasDoCliente(cliente.id)
      .then(setCompras)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, [cliente.id]);

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal-cartao" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">Compras de {cliente.nome}</h2>

        {carregando && <p className="texto-carregando">Carregando...</p>}
        {erro && <p className="mensagem-erro">{erro}</p>}

        {!carregando && !erro && (
          <>
            {compras.length === 0 ? (
              <p className="texto-vazio">Esse cliente ainda não comprou nada.</p>
            ) : (
              <ul className="lista-cartoes">
                {compras.map((c) => (
                  <li key={c.movimentacao_id} className="cartao-item cartao-item-coluna">
                    <div className="cartao-item-linha">
                      <span className="cartao-item-nome">{c.produto_nome}</span>
                      <span>
                        {c.valor_total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                    <span className="cartao-item-detalhe">
                      {c.quantidade} un. •{" "}
                      {new Date(c.data).toLocaleDateString("pt-BR")}
                      {c.fiado && (c.pago ? " • pendente paga" : " • ainda pendente")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <button className="botao-secundario botao-largura-total" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </div>
  );
}
