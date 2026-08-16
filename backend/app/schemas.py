from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, validator

from .models import TipoMovimentacao, UnidadeProduto


# ---------- Usuário / Autenticação ----------

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


class Usuario(BaseModel):
    id: int
    nome: str
    email: EmailStr

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Produto ----------

class ProdutoBase(BaseModel):
    nome: str
    categoria: Optional[str] = None
    unidade: UnidadeProduto = UnidadeProduto.UNIDADE


class ProdutoCreate(ProdutoBase):
    pass


class Produto(ProdutoBase):
    id: int

    class Config:
        orm_mode = True


# ---------- Cliente ----------

class ClienteBase(BaseModel):
    nome: str
    telefone: str
    endereco: str


class ClienteCreate(ClienteBase):
    pass


class Cliente(ClienteBase):
    id: int

    class Config:
        orm_mode = True


# ---------- Movimentacao ----------

class MovimentacaoBase(BaseModel):
    produto_id: int
    tipo: TipoMovimentacao
    quantidade: float
    valor_unitario: float
    observacao: Optional[str] = None
    cliente_id: Optional[int] = None
    fiado: bool = False


class MovimentacaoCreate(MovimentacaoBase):
    @validator("cliente_id", always=True)
    def cliente_obrigatorio_em_vendas(cls, valor, values):
        # Toda venda (saida) precisa de um cliente vinculado. Compras (entrada)
        # não têm cliente, então essa regra só se aplica quando tipo == saida.
        # always=True garante que isso roda mesmo se cliente_id não for enviado.
        if values.get("tipo") == TipoMovimentacao.SAIDA and valor is None:
            raise ValueError("Escolha um cliente para registrar a venda.")
        return valor


class Movimentacao(MovimentacaoBase):
    id: int
    data: datetime
    pago: bool

    class Config:
        orm_mode = True


# ---------- Fiado ----------

class FiadoPendente(BaseModel):
    movimentacao_id: int
    cliente_id: int
    cliente_nome: str
    produto_nome: str
    valor_total: float
    data: datetime


class ResumoCliente(BaseModel):
    cliente_id: int
    cliente_nome: str
    total_devendo: float


class CompraCliente(BaseModel):
    movimentacao_id: int
    produto_nome: str
    quantidade: float
    valor_unitario: float
    valor_total: float
    fiado: bool
    pago: bool
    data: datetime


# ---------- Relatórios ----------

class ResumoProduto(BaseModel):
    produto_id: int
    nome: str
    unidade: UnidadeProduto
    estoque_atual: float
    custo_medio: float
    total_investido: float
    total_vendido_valor: float
    lucro: float


class ResumoGeral(BaseModel):
    produtos: list[ResumoProduto]
    total_investido: float
    total_vendido: float
    lucro_total: float
    total_a_receber: float  # soma de todos os fiados pendentes
