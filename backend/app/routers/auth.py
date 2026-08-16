from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .. import crud, schemas, security
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["autenticacao"])

# HTTPBearer faz o Swagger mostrar um campo simples "Value" pra colar o token
# direto, em vez do formulário de usuário/senha/client_id do OAuth2PasswordBearer
# (que não combina com nosso login via JSON).
bearer_scheme = HTTPBearer()


@router.post("/registrar", response_model=schemas.Usuario)
def registrar(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    if crud.obter_usuario_por_email(db, usuario.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.criar_usuario(db, usuario)


@router.post("/login", response_model=schemas.Token)
def login(dados: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    usuario = crud.autenticar_usuario(db, dados.email, dados.senha)
    if not usuario:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    token = security.criar_token_acesso({"sub": usuario.email})
    return schemas.Token(access_token=token)


def obter_usuario_atual(
    credenciais: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> schemas.Usuario:
    """
    Dependency usada nas outras rotas pra exigir login. Qualquer endpoint que
    incluir `Depends(obter_usuario_atual)` só funciona com um token válido no header.
    """
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    email = security.decodificar_token(credenciais.credentials)
    if email is None:
        raise credenciais_invalidas
    usuario = crud.obter_usuario_por_email(db, email)
    if usuario is None:
        raise credenciais_invalidas
    return usuario
