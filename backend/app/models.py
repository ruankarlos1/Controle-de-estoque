import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship

from .database import Base


class TipoMovimentacao(str, enum.Enum):
    ENTRADA = "entrada"  # compra (o pai comprando mercadoria pra revender)
    SAIDA = "saida"      # venda (o pai vendendo pro cliente)


class UnidadeProduto(str, enum.Enum):
    UNIDADE = "unidade"
    CAIXA = "caixa"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nome = Column(String, nullable=False, index=True)
    categoria = Column(String, nullable=True)
    unidade = Column(Enum(UnidadeProduto), default=UnidadeProduto.UNIDADE)

    movimentacoes = relationship("Movimentacao", back_populates="produto")


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nome = Column(String, nullable=False, index=True)
    telefone = Column(String, nullable=False)
    endereco = Column(String, nullable=False)

    movimentacoes = relationship("Movimentacao", back_populates="cliente")


class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    tipo = Column(Enum(TipoMovimentacao), nullable=False)
    quantidade = Column(Float, nullable=False)
    valor_unitario = Column(Float, nullable=False)  # preço de compra OU de venda
    data = Column(DateTime, default=datetime.utcnow)
    observacao = Column(String, nullable=True)

    # cliente_id é opcional: uma venda pode ser avulsa, sem cliente identificado.
    # pendente/pago só fazem sentido em vendas (tipo=saida): pendente=True
    # quer dizer que o cliente vai pagar depois, e pago controla se essa
    # dívida já foi quitada.
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=True)
    pendente = Column(Boolean, default=False)
    pago = Column(Boolean, default=True)

    produto = relationship("Produto", back_populates="movimentacoes")
    cliente = relationship("Cliente", back_populates="movimentacoes")
