import { useEffect, useState } from "react";
import { api } from "../api.js";
import DetalhePendenciaCliente from "../components/DetalhePendenciaCliente.jsx";

export default function Pendentes() {
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [processandoId, setProcessandoId] = useState(null);
  const [clienteAberto, setClienteAberto] = useState(null); // nome do cliente selecionado

  async function carregar() {
    setErro("");
    try {
      const lista = await api.listarPendentes();
      setPendentes(lista);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function marcarPago(id) {
    setProcessandoId(id);
    try {
      await api.marcarPendenteComoPago(id);
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessandoId(null);
    }
  }

  // Agrupa os itens pendentes por cliente, somando o total de cada um.
  const porCliente = pendentes.reduce((grupos, item) => {
    if (!grupos[item.cliente_nome]) {
      grupos[item.cliente_nome] = { nome: item.cliente_nome, itens: [], total: 0 };
    }
    grupos[item.cliente_nome].itens.push(item);
    grupos[item.cliente_nome].total += item.valor_total;
    return grupos;
  }, {});
  const clientesComPendencia = Object.values(porCliente);

  const totalGeral = pendentes.reduce((soma, f) => soma + f.valor_total, 0);
  const itensDoModal = clienteAberto ? porCliente[clienteAberto]?.itens ?? [] : [];

  return (
    <div className="conteudo">
      <h2 className="secao-titulo">Pendentes</h2>
      <p className="secao-descricao">Clique no nome para ver o que cada um deve.</p>

      {carregando && <p className="texto-carregando">Carregando...</p>}
      {erro && <p className="mensagem-erro mensagem-erro-central">{erro}</p>}

      {!carregando && !erro && (
        <>
          {clientesComPendencia.length === 0 ? (
            <p className="texto-vazio">Nenhuma pendência no momento. Tudo pago! 🎉</p>
          ) : (
            <>
              <div className="faixa-total">
                <span>Total a receber</span>
                <span className="valor-prejuizo">
                  {totalGeral.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

              <ul className="lista-cartoes">
                {clientesComPendencia.map((cliente) => (
                  <li key={cliente.nome}>
                    <button
                      className="cartao-item cartao-item-clicavel"
                      onClick={() => setClienteAberto(cliente.nome)}
                    >
                      <span className="cartao-item-nome">{cliente.nome}</span>
                      <span className="valor-prejuizo">
                        {cliente.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {clienteAberto && itensDoModal.length > 0 && (
        <DetalhePendenciaCliente
          clienteNome={clienteAberto}
          itens={itensDoModal}
          aoMarcarPago={marcarPago}
          processandoId={processandoId}
          aoFechar={() => setClienteAberto(null)}
        />
      )}
    </div>
  );
}
