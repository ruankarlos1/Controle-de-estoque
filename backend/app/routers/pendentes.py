from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from .auth import obter_usuario_atual

router = APIRouter(prefix="/pendentes", tags=["pendentes"])


@router.get("/", response_model=list[schemas.Pendencia])
def listar_pendentes(
    db: Session = Depends(get_db), usuario: schemas.Usuario = Depends(obter_usuario_atual)
):
    return crud.listar_pendencias(db, usuario.id)


@router.get("/por-cliente", response_model=list[schemas.ResumoCliente])
def resumo_por_cliente(
    db: Session = Depends(get_db), usuario: schemas.Usuario = Depends(obter_usuario_atual)
):
    return crud.resumo_por_cliente(db, usuario.id)


@router.post("/{movimentacao_id}/pagar", response_model=schemas.Movimentacao)
def marcar_como_pago(
    movimentacao_id: int,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    mov = crud.marcar_pendencia_como_paga(db, movimentacao_id, usuario.id)
    if not mov:
        raise HTTPException(
            status_code=404,
            detail="Pendência não encontrada, ou ela já tinha sido paga",
        )
    return mov
