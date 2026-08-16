import { useState } from "react";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import Estoque from "./pages/Estoque.jsx";
import Financeiro from "./pages/Financeiro.jsx";
import Clientes from "./pages/Clientes.jsx";
import Pendentes from "./pages/Pendentes.jsx";
import BarraAbas from "./components/BarraAbas.jsx";

const TITULOS_ABA = {
  estoque: "Meu Estoque",
  financeiro: "Financeiro",
  clientes: "Clientes",
  pendentes: "Pendentes",
};

export default function App() {
  const [logado, setLogado] = useState(api.estaLogado());
  const [abaAtiva, setAbaAtiva] = useState("estoque");

  function sair() {
    api.sair();
    setLogado(false);
  }

  if (!logado) {
    return <Login aoEntrar={() => setLogado(true)} />;
  }

  return (
    <div className="tela-principal">
      <header className="topo-app">
        <h1 className="topo-titulo">{TITULOS_ABA[abaAtiva]}</h1>
        <button className="botao-sair" onClick={sair}>
          Sair
        </button>
      </header>

      <main>
        {abaAtiva === "estoque" && <Estoque />}
        {abaAtiva === "financeiro" && <Financeiro />}
        {abaAtiva === "clientes" && <Clientes />}
        {abaAtiva === "pendentes" && <Pendentes />}
      </main>

      <BarraAbas abaAtiva={abaAtiva} aoTrocarAba={setAbaAtiva} />
    </div>
  );
}
