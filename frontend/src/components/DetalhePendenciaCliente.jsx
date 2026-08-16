export default function DetalhePendenciaCliente({
  clienteNome,
  itens,
  aoMarcarPago,
  processandoId,
  aoFechar,
}) {
  const total = itens.reduce((soma, i) => soma + i.valor_total, 0);

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal-cartao" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-titulo">{clienteNome} deve</h2>

        <div className="faixa-total faixa-total-modal">
          <span>Total</span>
          <span className="valor-prejuizo">
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>

        <ul className="lista-cartoes">
          {itens.map((item) => (
            <li key={item.movimentacao_id} className="cartao-item cartao-item-coluna">
              <div className="cartao-item-linha">
                <span className="cartao-item-nome">{item.produto_nome}</span>
                <span className="valor-prejuizo">
                  {item.valor_total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <span className="cartao-item-detalhe">
                {new Date(item.data).toLocaleDateString("pt-BR")}
              </span>
              <button
                className="botao-primario botao-largura-total botao-pequeno"
                onClick={() => aoMarcarPago(item.movimentacao_id)}
                disabled={processandoId === item.movimentacao_id}
              >
                {processandoId === item.movimentacao_id ? "Salvando..." : "Marcar como pago"}
              </button>
            </li>
          ))}
        </ul>

        <button className="botao-secundario botao-largura-total" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </div>
  );
}
