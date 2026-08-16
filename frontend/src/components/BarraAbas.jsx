const ABAS = [
  { chave: "estoque", rotulo: "Estoque", icone: "📦" },
  { chave: "financeiro", rotulo: "Financeiro", icone: "💰" },
  { chave: "clientes", rotulo: "Clientes", icone: "👥" },
  { chave: "pendentes", rotulo: "Pendentes", icone: "🧾" },
];

export default function BarraAbas({ abaAtiva, aoTrocarAba }) {
  return (
    <nav className="barra-abas">
      {ABAS.map((aba) => (
        <button
          key={aba.chave}
          className={`barra-abas-item ${abaAtiva === aba.chave ? "ativo" : ""}`}
          onClick={() => aoTrocarAba(aba.chave)}
        >
          <span className="barra-abas-icone" aria-hidden="true">
            {aba.icone}
          </span>
          <span>{aba.rotulo}</span>
        </button>
      ))}
    </nav>
  );
}
