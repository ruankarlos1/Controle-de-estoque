import os
from datetime import datetime, timedelta

import bcrypt
from dotenv import load_dotenv
from jose import JWTError, jwt

load_dotenv()  # lê o arquivo .env, se existir, e carrega as variáveis

# A SECRET_KEY protege os tokens de login. Em produção, isso DEVE vir de uma
# variável de ambiente (nunca deixe fixo no código de verdade). Aqui geramos
# uma automaticamente se não houver uma configurada, só pra não travar o
# desenvolvimento local.
SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(32).hex())
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # token válido por 7 dias


def hash_senha(senha: str) -> str:
    """Transforma a senha em um hash - nunca guardamos a senha em texto puro."""
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha_texto: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha_texto.encode("utf-8"), senha_hash.encode("utf-8"))


def criar_token_acesso(dados: dict) -> str:
    dados_token = dados.copy()
    expira_em = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    dados_token.update({"exp": expira_em})
    return jwt.encode(dados_token, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token(token: str) -> str | None:
    """Retorna o email do usuário do token, ou None se o token for inválido/expirado."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
