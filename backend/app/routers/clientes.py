from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from .auth import obter_usuario_atual

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.post("/", response_model=schemas.Cliente)
def criar_cliente(
    cliente: schemas.ClienteCreate,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    return crud.criar_cliente(db, cliente, usuario.id)


@router.get("/", response_model=list[schemas.Cliente])
def listar_clientes(
    db: Session = Depends(get_db), usuario: schemas.Usuario = Depends(obter_usuario_atual)
):
    return crud.listar_clientes(db, usuario.id)


@router.delete("/{cliente_id}")
def deletar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    try:
        sucesso = crud.deletar_cliente(db, cliente_id, usuario.id)
    except crud.ExclusaoBloqueada as e:
        raise HTTPException(status_code=400, detail=e.mensagem)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return {"ok": True}


@router.get("/{cliente_id}/compras", response_model=list[schemas.CompraCliente])
def compras_do_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    if not crud.obter_cliente(db, cliente_id, usuario.id):
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return crud.listar_compras_cliente(db, cliente_id, usuario.id)
