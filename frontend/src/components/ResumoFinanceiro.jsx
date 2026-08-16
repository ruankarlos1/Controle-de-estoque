function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ResumoFinanceiro({ resumo }) {
  const { total_investido, total_vendido, lucro_total, total_a_receber } = resumo;
  const lucroPositivo = lucro_total >= 0;

  return (
    <div className="recibo">
      <div className="recibo-topo">
        <span className="recibo-selo">RESUMO FINANCEIRO</span>
      </div>

      <div className="recibo-linha-secundaria">
        <span>Total investido em compras</span>
        <span className="recibo-linha-valor">{formatarMoeda(total_investido)}</span>
      </div>
      <div className="recibo-linha-secundaria">
        <span>Total vendido</span>
        <span className="recibo-linha-valor">{formatarMoeda(total_vendido)}</span>
      </div>
      {total_a_receber > 0 && (
        <div className="recibo-linha-secundaria">
          <span>A receber (pendentes)</span>
          <span className="recibo-linha-valor valor-prejuizo">
            {formatarMoeda(total_a_receber)}
          </span>
        </div>
      )}

      <div className="recibo-divisor" aria-hidden="true" />

      <div className="recibo-total">
        <span>{lucroPositivo ? "Lucro total" : "Prejuízo total"}</span>
        <span className={lucroPositivo ? "valor-lucro" : "valor-prejuizo"}>
          {formatarMoeda(lucro_total)}
        </span>
      </div>
    </div>
  );
}
