import { useState } from "react";
import { api } from "../api.js";

export default function FormCliente({ aoSalvar, aoFechar }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await api.criarCliente({ nome, telefone, endereco });
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
        <h2 className="modal-titulo">Novo cliente</h2>

        <form onSubmit={enviar} className="login-form">
          <label className="campo">
            <span>Nome do cliente</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Seu José"
              required
              autoFocus
            />
          </label>

          <label className="campo">
            <span>Telefone</span>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Ex: (85) 99999-8888"
              required
            />
          </label>

          <label className="campo">
            <span>Endereço</span>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Ex: Rua das Flores, 123"
              required
            />
          </label>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="modal-acoes">
            <button type="button" className="botao-secundario" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={carregando}>
              {carregando ? "Salvando..." : "Salvar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
