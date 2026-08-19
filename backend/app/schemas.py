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
    pendente: bool = False


class MovimentacaoCreate(MovimentacaoBase):
    @validator("cliente_id", always=True)
    def cliente_obrigatorio_em_vendas(cls, valor, values):
        # Venda (saida) sem cliente não faz sentido pra gente, então exige.
        # Compra (entrada) não tem cliente, daí a regra só vale pra saida.
        # always=True aqui é pra rodar mesmo se cliente_id nem for enviado.
        if values.get("tipo") == TipoMovimentacao.SAIDA and valor is None:
            raise ValueError("Escolha um cliente para registrar a venda.")
        return valor


class Movimentacao(MovimentacaoBase):
    id: int
    data: datetime
    pago: bool

    class Config:
        orm_mode = True


# ---------- Pendentes ----------

class Pendencia(BaseModel):
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
    pendente: bool
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
    total_a_receber: float  # soma de tudo que ainda tá pendente de receber
