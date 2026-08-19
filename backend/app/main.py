from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth, produtos, movimentacoes, relatorios, clientes, pendentes

# Cria as tabelas no banco (se ainda não existirem)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Controle de Estoque",
    description="API para controle de mercadorias, compras, vendas e lucro",
    version="0.1.0",
)

# CORS liberado pra facilitar a conexão com o front-end React em desenvolvimento.
# Em produção, restrinja allow_origins pro domínio real do front.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(produtos.router)
app.include_router(movimentacoes.router)
app.include_router(relatorios.router)
app.include_router(pendentes.router)


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}
