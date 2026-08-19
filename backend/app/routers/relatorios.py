from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from .auth import obter_usuario_atual

router = APIRouter(prefix="/relatorios", tags=["relatorios"])


@router.get("/produto/{produto_id}", response_model=schemas.ResumoProduto)
def resumo_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    resumo = crud.calcular_resumo_produto(db, produto_id, usuario.id)
    if not resumo:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return resumo


@router.get("/geral", response_model=schemas.ResumoGeral)
def resumo_geral(
    apenas_mes_atual: bool = False,
    db: Session = Depends(get_db),
    usuario: schemas.Usuario = Depends(obter_usuario_atual),
):
    # apenas_mes_atual=true é o que alimenta o botão "ver só este mês" no
    # front. O histórico continua intacto no banco, isso só filtra a
    # resposta - nada é apagado nem sobrescrito aqui.
    return crud.calcular_resumo_geral(db, usuario.id, apenas_mes_atual)
