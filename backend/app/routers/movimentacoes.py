from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from .auth import obter_usuario_atual

router = APIRouter(prefix="/movimentacoes", tags=["movimentacoes"])


@router.post("/", response_model=schemas.Movimentacao)
def criar_movimentacao(
    mov: schemas.MovimentacaoCreate,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    produto = crud.obter_produto(db, mov.produto_id, usuario.id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if mov.cliente_id is not None:
        cliente = crud.obter_cliente(db, mov.cliente_id, usuario.id)
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

    return crud.criar_movimentacao(db, mov, usuario.id)


@router.get("/", response_model=list[schemas.Movimentacao])
def listar_movimentacoes(
    produto_id: int | None = None,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    return crud.listar_movimentacoes(db, usuario.id, produto_id)
