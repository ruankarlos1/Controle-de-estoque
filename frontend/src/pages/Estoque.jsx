import { useEffect, useState } from "react";
import { api } from "../api.js";
import ListaProdutos from "../components/ListaProdutos.jsx";
import FormMovimentacao from "../components/FormMovimentacao.jsx";
import FormProduto from "../components/FormProduto.jsx";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [resumoProdutos, setResumoProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [modalAberto, setModalAberto] = useState(null); // "produto" | "movimentacao" | null
  const [excluindoId, setExcluindoId] = useState(null);

  async function carregarTudo() {
    setErroCarregamento("");
    try {
      const [listaProdutosBrutos, listaClientes, resumoGeral] = await Promise.all([
        api.listarProdutos(),
        api.listarClientes(),
        api.resumoGeral(),
      ]);
      setProdutos(listaProdutosBrutos);
      setClientes(listaClientes);
      setResumoProdutos(resumoGeral.produtos);
    } catch (err) {
      setErroCarregamento(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  function fecharModalESalvar() {
    setModalAberto(null);
    carregarTudo();
  }

  async function excluirProduto(produtoResumo) {
    const confirmou = window.confirm(
      `Tem certeza que quer excluir "${produtoResumo.nome}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    setExcluindoId(produtoResumo.produto_id);
    setErroAcao("");
    try {
      await api.excluirProduto(produtoResumo.produto_id);
      await carregarTudo();
    } catch (err) {
      setErroAcao(err.message);
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="conteudo conteudo-com-flutuante">
      {carregando && <p className="texto-carregando">Carregando...</p>}

      {erroCarregamento && (
        <p className="mensagem-erro mensagem-erro-central">{erroCarregamento}</p>
      )}

      {!carregando && !erroCarregamento && (
        <>
          <h2 className="secao-titulo">Meus produtos</h2>

          {erroAcao && <p className="mensagem-erro mensagem-erro-acao">{erroAcao}</p>}

          <ListaProdutos
            produtos={resumoProdutos}
            aoExcluir={excluirProduto}
            excluindoId={excluindoId}
          />

          <button
            className="botao-secundario botao-largura-total"
            onClick={() => setModalAberto("produto")}
          >
            + Cadastrar novo produto
          </button>
        </>
      )}

      {/* Botão flutuante grande - a ação mais comum do dia a dia */}
      {produtos.length > 0 && (
        <button
          className="botao-flutuante"
          onClick={() => setModalAberto("movimentacao")}
          aria-label="Registrar compra ou venda"
        >
          + Registrar compra/venda
        </button>
      )}

      {modalAberto === "produto" && (
        <FormProduto aoSalvar={fecharModalESalvar} aoFechar={() => setModalAberto(null)} />
      )}

      {modalAberto === "movimentacao" && (
        <FormMovimentacao
          produtos={produtos}
          resumoProdutos={resumoProdutos}
          clientes={clientes}
          aoSalvar={fecharModalESalvar}
          aoFechar={() => setModalAberto(null)}
        />
      )}
    </div>
  );
}
