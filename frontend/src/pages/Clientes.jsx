import { useEffect, useState } from "react";
import { api } from "../api.js";
import FormCliente from "../components/FormCliente.jsx";
import HistoricoCliente from "../components/HistoricoCliente.jsx";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [devedores, setDevedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteHistorico, setClienteHistorico] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);

  async function carregar() {
    setErro("");
    try {
      const [listaClientes, resumoDevedores] = await Promise.all([
        api.listarClientes(),
        api.pendentesPorCliente(),
      ]);
      setClientes(listaClientes);
      setDevedores(resumoDevedores);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function devendoDoCliente(clienteId) {
    const registro = devedores.find((d) => d.cliente_id === clienteId);
    return registro ? registro.total_devendo : 0;
  }

  async function excluir(cliente) {
    const confirmou = window.confirm(
      `Tem certeza que quer excluir o cliente "${cliente.nome}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    setExcluindoId(cliente.id);
    setErro("");
    try {
      await api.excluirCliente(cliente.id);
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="conteudo">
      <h2 className="secao-titulo">Clientes</h2>

      {carregando && <p className="texto-carregando">Carregando...</p>}
      {erro && <p className="mensagem-erro mensagem-erro-central">{erro}</p>}

      {!carregando && (
        <>
          {clientes.length === 0 ? (
            <p className="texto-vazio">
              Nenhum cliente cadastrado ainda. Cadastre o primeiro abaixo.
            </p>
          ) : (
            <ul className="lista-cartoes">
              {clientes.map((c) => {
                const devendo = devendoDoCliente(c.id);
                return (
                  <li key={c.id} className="cartao-item cartao-item-coluna">
                    <div className="cartao-item-linha">
                      <span className="cartao-item-nome">{c.nome}</span>
                      {devendo > 0 ? (
                        <span className="etiqueta etiqueta-alerta">
                          Deve{" "}
                          {devendo.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      ) : (
                        <span className="etiqueta etiqueta-ok">Em dia</span>
                      )}
                    </div>
                    <span className="cartao-item-detalhe">
                      {c.telefone} • {c.endereco}
                    </span>
                    <div className="cartao-item-acoes">
                      <button
                        className="botao-secundario botao-pequeno botao-largura-total"
                        onClick={() => setClienteHistorico(c)}
                      >
                        Ver o que comprou
                      </button>
                      <button
                        className="botao-perigo botao-pequeno"
                        onClick={() => excluir(c)}
                        disabled={excluindoId === c.id}
                      >
                        {excluindoId === c.id ? "..." : "Excluir"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            className="botao-secundario botao-largura-total"
            onClick={() => setModalAberto(true)}
          >
            + Cadastrar novo cliente
          </button>
        </>
      )}

      {modalAberto && (
        <FormCliente
          aoSalvar={() => {
            setModalAberto(false);
            carregar();
          }}
          aoFechar={() => setModalAberto(false)}
        />
      )}

      {clienteHistorico && (
        <HistoricoCliente
          cliente={clienteHistorico}
          aoFechar={() => setClienteHistorico(null)}
        />
      )}
    </div>
  );
}
