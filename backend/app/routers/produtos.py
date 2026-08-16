from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from .auth import obter_usuario_atual

router = APIRouter(prefix="/produtos", tags=["produtos"])


@router.post("/", response_model=schemas.Produto)
def criar_produto(
    produto: schemas.ProdutoCreate,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    return crud.criar_produto(db, produto, usuario.id)


@router.get("/", response_model=list[schemas.Produto])
def listar_produtos(
    db: Session = Depends(get_db), usuario: schemas.Usuario = Depends(obter_usuario_atual)
):
    return crud.listar_produtos(db, usuario.id)


@router.get("/{produto_id}", response_model=schemas.Produto)
def obter_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    produto = crud.obter_produto(db, produto_id, usuario.id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto


@router.delete("/{produto_id}")
def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    try:
        sucesso = crud.deletar_produto(db, produto_id, usuario.id)
    except crud.ExclusaoBloqueada as e:
        raise HTTPException(status_code=400, detail=e.mensagem)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"ok": True}
