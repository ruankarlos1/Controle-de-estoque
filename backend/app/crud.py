from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas, security


class ExclusaoBloqueada(Exception):
    """Levantado quando não dá pra excluir algo porque tem histórico vinculado."""

    def __init__(self, mensagem: str):
        self.mensagem = mensagem


# ---------- Usuário ----------

def obter_usuario_por_email(db: Session, email: str) -> models.Usuario | None:
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()


def criar_usuario(db: Session, usuario: schemas.UsuarioCreate) -> models.Usuario:
    db_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=security.hash_senha(usuario.senha),
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def autenticar_usuario(db: Session, email: str, senha: str) -> models.Usuario | None:
    usuario = obter_usuario_por_email(db, email)
    if not usuario or not security.verificar_senha(senha, usuario.senha_hash):
        return None
    return usuario


# ---------- Produto ----------
# IMPORTANTE: toda consulta é filtrada por usuario_id, pra garantir que cada
# conta só veja e mexa nos próprios dados (nunca nos de outra conta).

def criar_produto(db: Session, produto: schemas.ProdutoCreate, usuario_id: int) -> models.Produto:
    db_produto = models.Produto(**produto.dict(), usuario_id=usuario_id)
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto


def listar_produtos(db: Session, usuario_id: int):
    return db.query(models.Produto).filter(models.Produto.usuario_id == usuario_id).all()


def obter_produto(db: Session, produto_id: int, usuario_id: int):
    return (
        db.query(models.Produto)
        .filter(models.Produto.id == produto_id, models.Produto.usuario_id == usuario_id)
        .first()
    )


def deletar_produto(db: Session, produto_id: int, usuario_id: int) -> bool:
    produto = obter_produto(db, produto_id, usuario_id)
    if not produto:
        return False
    try:
        db.delete(produto)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ExclusaoBloqueada(
            "Esse produto já tem compras ou vendas registradas e não pode ser excluído. "
            "Se não usa mais, você pode manter ele cadastrado sem se preocupar."
        )
    return True


# ---------- Cliente ----------

def criar_cliente(db: Session, cliente: schemas.ClienteCreate, usuario_id: int) -> models.Cliente:
    db_cliente = models.Cliente(**cliente.dict(), usuario_id=usuario_id)
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


def listar_clientes(db: Session, usuario_id: int):
    return db.query(models.Cliente).filter(models.Cliente.usuario_id == usuario_id).all()


def obter_cliente(db: Session, cliente_id: int, usuario_id: int):
    return (
        db.query(models.Cliente)
        .filter(models.Cliente.id == cliente_id, models.Cliente.usuario_id == usuario_id)
        .first()
    )


def deletar_cliente(db: Session, cliente_id: int, usuario_id: int) -> bool:
    cliente = obter_cliente(db, cliente_id, usuario_id)
    if not cliente:
        return False
    try:
        db.delete(cliente)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ExclusaoBloqueada(
            "Esse cliente já tem compras registradas e não pode ser excluído. "
            "Se não é mais cliente ativo, você pode manter ele cadastrado sem se preocupar."
        )
    return True


# ---------- Movimentação ----------
# Movimentação não tem usuario_id próprio: ela pertence a um produto, e o
# produto já pertence a um usuário. Por isso, sempre filtramos/validamos
# através do produto (e do cliente, quando houver).

def criar_movimentacao(
    db: Session, mov: schemas.MovimentacaoCreate, usuario_id: int
) -> models.Movimentacao:
    dados = mov.dict()
    dados["pago"] = not (dados["tipo"] == models.TipoMovimentacao.SAIDA and dados["pendente"])
    db_mov = models.Movimentacao(**dados)
    db.add(db_mov)
    db.commit()
    db.refresh(db_mov)
    return db_mov


def listar_movimentacoes(db: Session, usuario_id: int, produto_id: int | None = None):
    query = (
        db.query(models.Movimentacao)
        .join(models.Produto)
        .filter(models.Produto.usuario_id == usuario_id)
    )
    if produto_id is not None:
        query = query.filter(models.Movimentacao.produto_id == produto_id)
    return query.order_by(models.Movimentacao.data.desc()).all()


def marcar_pendencia_como_paga(
    db: Session, movimentacao_id: int, usuario_id: int
) -> models.Movimentacao | None:
    mov = (
        db.query(models.Movimentacao)
        .join(models.Produto)
        .filter(
            models.Movimentacao.id == movimentacao_id,
            models.Produto.usuario_id == usuario_id,
        )
        .first()
    )
    if not mov or not mov.pendente:
        return None
    mov.pago = True
    db.commit()
    db.refresh(mov)
    return mov


def listar_pendencias(db: Session, usuario_id: int) -> list[schemas.Pendencia]:
    pendentes = (
        db.query(models.Movimentacao)
        .join(models.Produto)
        .filter(
            models.Movimentacao.pendente == True,  # noqa: E712
            models.Movimentacao.pago == False,  # noqa: E712
            models.Produto.usuario_id == usuario_id,
        )
        .order_by(models.Movimentacao.data.desc())
        .all()
    )
    resultado = []
    for mov in pendentes:
        if not mov.cliente:
            continue
        resultado.append(
            schemas.Pendencia(
                movimentacao_id=mov.id,
                cliente_id=mov.cliente.id,
                cliente_nome=mov.cliente.nome,
                produto_nome=mov.produto.nome,
                valor_total=round(mov.quantidade * mov.valor_unitario, 2),
                data=mov.data,
            )
        )
    return resultado


def resumo_por_cliente(db: Session, usuario_id: int) -> list[schemas.ResumoCliente]:
    pendentes = listar_pendencias(db, usuario_id)
    totais: dict[int, schemas.ResumoCliente] = {}
    for f in pendentes:
        if f.cliente_id not in totais:
            totais[f.cliente_id] = schemas.ResumoCliente(
                cliente_id=f.cliente_id, cliente_nome=f.cliente_nome, total_devendo=0.0
            )
        totais[f.cliente_id].total_devendo = round(
            totais[f.cliente_id].total_devendo + f.valor_total, 2
        )
    return list(totais.values())


def listar_compras_cliente(
    db: Session, cliente_id: int, usuario_id: int
) -> list[schemas.CompraCliente]:
    compras = (
        db.query(models.Movimentacao)
        .join(models.Produto)
        .filter(
            models.Movimentacao.cliente_id == cliente_id,
            models.Movimentacao.tipo == models.TipoMovimentacao.SAIDA,
            models.Produto.usuario_id == usuario_id,
        )
        .order_by(models.Movimentacao.data.desc())
        .all()
    )
    return [
        schemas.CompraCliente(
            movimentacao_id=c.id,
            produto_nome=c.produto.nome,
            quantidade=c.quantidade,
            valor_unitario=c.valor_unitario,
            valor_total=round(c.quantidade * c.valor_unitario, 2),
            pendente=c.pendente,
            pago=c.pago,
            data=c.data,
        )
        for c in compras
    ]


# ---------- Cálculos de estoque e lucro ----------
# Usa CUSTO MÉDIO: se o produto foi comprado por preços diferentes, o custo
# considerado pra calcular lucro é a média ponderada de todas as compras.


def _e_do_mes_atual(data: datetime) -> bool:
    agora = datetime.utcnow()
    return data.year == agora.year and data.month == agora.month


def calcular_resumo_produto(
    db: Session,
    produto_id: int,
    usuario_id: int,
    apenas_mes_atual: bool = False,
) -> schemas.ResumoProduto | None:
    produto = obter_produto(db, produto_id, usuario_id)
    if not produto:
        return None

    movimentacoes = listar_movimentacoes(db, usuario_id, produto_id)

    # Estoque e custo médio sempre olham pro histórico inteiro - não faria
    # sentido "esquecer" uma compra de mês passado só porque a tela tá
    # mostrando só o mês atual, senão o estoque e o custo ficariam errados.
    total_comprado = 0.0
    valor_total_compra = 0.0
    total_vendido_historico = 0.0

    for mov in movimentacoes:
        if mov.tipo == models.TipoMovimentacao.ENTRADA:
            total_comprado += mov.quantidade
            valor_total_compra += mov.quantidade * mov.valor_unitario
        else:
            total_vendido_historico += mov.quantidade

    custo_medio = valor_total_compra / total_comprado if total_comprado > 0 else 0.0
    estoque_atual = total_comprado - total_vendido_historico

    # Já pra mostrar "quanto entrou/saiu" no resumo, aí sim filtra pelo
    # período escolhido - é só isso que o botão "ver mês atual" controla.
    movimentacoes_do_periodo = (
        [m for m in movimentacoes if _e_do_mes_atual(m.data)]
        if apenas_mes_atual
        else movimentacoes
    )

    valor_investido_periodo = 0.0
    total_vendido_periodo = 0.0
    valor_vendido_periodo = 0.0
    for mov in movimentacoes_do_periodo:
        if mov.tipo == models.TipoMovimentacao.ENTRADA:
            valor_investido_periodo += mov.quantidade * mov.valor_unitario
        else:
            total_vendido_periodo += mov.quantidade
            valor_vendido_periodo += mov.quantidade * mov.valor_unitario

    custo_do_vendido = total_vendido_periodo * custo_medio
    lucro = valor_vendido_periodo - custo_do_vendido

    return schemas.ResumoProduto(
        produto_id=produto.id,
        nome=produto.nome,
        unidade=produto.unidade,
        estoque_atual=estoque_atual,
        custo_medio=round(custo_medio, 2),
        total_investido=round(valor_investido_periodo, 2),
        total_vendido_valor=round(valor_vendido_periodo, 2),
        lucro=round(lucro, 2),
    )


def calcular_resumo_geral(
    db: Session, usuario_id: int, apenas_mes_atual: bool = False
) -> schemas.ResumoGeral:
    produtos = listar_produtos(db, usuario_id)
    resumos = []
    for produto in produtos:
        resumo = calcular_resumo_produto(db, produto.id, usuario_id, apenas_mes_atual)
        if resumo:
            resumos.append(resumo)

    total_investido = round(sum(r.total_investido for r in resumos), 2)
    total_vendido = round(sum(r.total_vendido_valor for r in resumos), 2)
    lucro_total = round(sum(r.lucro for r in resumos), 2)
    # dívida pendente é sempre o total real, não importa o período escolhido
    # na tela - não faz sentido esconder que alguém deve só por ser de mês
    # passado
    total_a_receber = round(sum(p.valor_total for p in listar_pendencias(db, usuario_id)), 2)

    return schemas.ResumoGeral(
        produtos=resumos,
        total_investido=total_investido,
        total_vendido=total_vendido,
        lucro_total=lucro_total,
        total_a_receber=total_a_receber,
    )
