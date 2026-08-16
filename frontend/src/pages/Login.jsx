import { useState } from "react";
import { api } from "../api.js";

export default function Login({ aoEntrar }) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      if (modoCadastro) {
        await api.registrar(nome, email, senha);
        await api.login(email, senha);
      } else {
        await api.login(email, senha);
      }
      aoEntrar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="tela-login">
      <div className="login-cartao">
        <h1 className="login-titulo">Controle de Estoque</h1>
        <p className="login-subtitulo">
          {modoCadastro ? "Crie sua conta para começar" : "Entre para continuar"}
        </p>

        <form onSubmit={enviar} className="login-form">
          {modoCadastro && (
            <label className="campo">
              <span>Seu nome</span>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João"
                required
              />
            </label>
          )}

          <label className="campo">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />
          </label>

          <label className="campo">
            <span>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              required
              minLength={4}
            />
          </label>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <button type="submit" className="botao-primario" disabled={carregando}>
            {carregando ? "Aguarde..." : modoCadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          className="botao-texto"
          onClick={() => {
            setModoCadastro(!modoCadastro);
            setErro("");
          }}
        >
          {modoCadastro ? "Já tenho uma conta" : "Criar uma conta nova"}
        </button>
      </div>
    </div>
  );
}
