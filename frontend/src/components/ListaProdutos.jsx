const UNIDADE_ROTULO = {
  unidade: "un.",
  caixa: "cx.",
};

export default function ListaProdutos({ produtos, aoExcluir, excluindoId }) {
  if (produtos.length === 0) {
    return (
      <p className="texto-vazio">
        Nenhum produto cadastrado ainda. Adicione o primeiro produto abaixo.
      </p>
    );
  }

  return (
    <ul className="lista-cartoes">
      {produtos.map((p) => (
        <li key={p.produto_id} className="cartao-item">
          <div>
            <span className="cartao-item-nome">{p.nome}</span>
            <div className="cartao-item-estoque-destaque">
              {p.estoque_atual} {UNIDADE_ROTULO[p.unidade] ?? ""}
              <span className="cartao-item-estoque-rotulo">em estoque</span>
            </div>
          </div>
          <button
            className="botao-perigo botao-pequeno"
            onClick={() => aoExcluir(p)}
            disabled={excluindoId === p.produto_id}
          >
            {excluindoId === p.produto_id ? "..." : "Excluir"}
          </button>
        </li>
      ))}
    </ul>
  );
}
