import { useState } from "react";
import { api } from "../api.js";

const UNIDADE_ROTULO = {
  unidade: "un.",
  caixa: "cx.",
};

export default function FormMovimentacao({ produtos, resumoProdutos, clientes, aoSalvar, aoFechar }) {
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [tipo, setTipo] = useState("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [fiado, setFiado] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const resumoSelecionado = resumoProdutos?.find((p) => p.produto_id === Number(produtoId));
  const estoqueDisponivel = resumoSelecionado?.estoque_atual ?? null;
  const unidadeRotulo = resumoSelecionado ? UNIDADE_ROTULO[resumoSelecionado.unidade] ?? "" : "";
  const quantidadeNumero = Number(quantidade) || 0;
  const excedeEstoque =
    tipo === "saida" &&
    estoqueDisponivel !== null &&
    quantidadeNumero > estoqueDisponivel;

  async function enviar(e) {
    e.preventDefault();
    setErro("");

    if (tipo === "saida" && !clienteId) {
      setErro("Escolha o cliente para registrar a venda.");
      return;
    }

    setCarregando(true);
    try {
      await api.criarMovimentacao({
        produto_id: Number(produtoId),
        tipo,
        quantidade: quantidadeNumero,
        valor_unitario: Number(valor),
        fiado: tipo === "saida" ? fiado : false,
        cliente_id: tipo === "saida" ? Number(clienteId) : null,
      });
      aoSalvar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal-cartao" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">Registrar movimento</h2>

        <div className="alternador">
          <button
            type="button"
            className={`alternador-opcao ${tipo === "entrada" ? "ativo" : ""}`}
            onClick={() => setTipo("entrada")}
          >
            Comprei (entrada)
          </button>
          <button
            type="button"
            className={`alternador-opcao ${tipo === "saida" ? "ativo" : ""}`}
            onClick={() => setTipo("saida")}
          >
            Vendi (saída)
          </button>
        </div>

        <form onSubmit={enviar} className="login-form">
          <label className="campo">
            <span>Produto</span>
            <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            {tipo === "saida" && estoqueDisponivel !== null && (
              <span className="campo-dica">
                Tem {estoqueDisponivel} {unidadeRotulo} em estoque
              </span>
            )}
          </label>

          <label className="campo">
            <span>Quantidade</span>
            <input
              type="number"
              step="any"
              min="0"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Ex: 10"
              required
            />
            {excedeEstoque && (
              <span className="campo-dica campo-dica-alerta">
                Atenção: você só tem {estoqueDisponivel} {unidadeRotulo} em estoque. Vai ficar
                negativo se continuar.
              </span>
            )}
          </label>

          <label className="campo">
            <span>{tipo === "entrada" ? "Preço pago (por unidade)" : "Preço vendido (por unidade)"}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 4.50"
              required
            />
          </label>

          {tipo === "saida" && (
            <>
              <label className="campo">
                <span>Cliente</span>
                {clientes.length === 0 ? (
                  <span className="campo-dica campo-dica-alerta">
                    Você ainda não cadastrou nenhum cliente. Vá na aba Clientes e cadastre um
                    antes de registrar a venda.
                  </span>
                ) : (
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label className="campo-checkbox">
                <input
                  type="checkbox"
                  checked={fiado}
                  onChange={(e) => setFiado(e.target.checked)}
                />
                <span>É venda pendente (cliente vai pagar depois)</span>
              </label>
            </>
          )}

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="modal-acoes">
            <button type="button" className="botao-secundario" onClick={aoFechar}>
              Cancelar
            </button>
            <button
              type="submit"
              className="botao-primario"
              disabled={carregando || (tipo === "saida" && clientes.length === 0)}
            >
              {carregando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
