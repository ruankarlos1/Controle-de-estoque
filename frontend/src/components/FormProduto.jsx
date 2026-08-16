import { useState } from "react";
import { api } from "../api.js";

export default function FormProduto({ aoSalvar, aoFechar }) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidade, setUnidade] = useState("unidade");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await api.criarProduto({ nome, categoria, unidade });
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
        <h2 className="modal-titulo">Novo produto</h2>

        <form onSubmit={enviar} className="login-form">
          <label className="campo">
            <span>Nome do produto</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Arroz"
              required
              autoFocus
            />
          </label>

          <label className="campo">
            <span>Categoria (opcional)</span>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex: Alimentos"
            />
          </label>

          <label className="campo">
            <span>Como você vende esse produto?</span>
            <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
              <option value="unidade">Por unidade</option>
              <option value="caixa">Por caixa</option>
            </select>
          </label>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="modal-acoes">
            <button type="button" className="botao-secundario" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={carregando}>
              {carregando ? "Salvando..." : "Salvar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
