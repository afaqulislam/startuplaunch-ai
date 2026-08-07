from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from core.security import ALGORITHM, SECRET_KEY
import models, schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
        # Tokens issued before this field existed carry no "ver"; treat them as
        # version 0, matching the default token_version on new users.
        token_version: int = payload.get("ver", 0)
    except JWTError:
        raise credentials_exception

    # Emails are stored lowercased on registration, but tokens issued before
    # that normalization may carry mixed case; match case-insensitively.
    result = await db.execute(
        select(models.User).where(func.lower(models.User.email) == token_data.email.lower())
    )
    user = result.scalars().first()
    if user is None or not user.is_active:
        raise credentials_exception
    # A password change bumps token_version, invalidating every token issued
    # before it — this is the revocation mechanism.
    if token_version != user.token_version:
        raise credentials_exception
    return user
