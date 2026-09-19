from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from core.security import ALGORITHM, SECRET_KEY, ACCESS_TOKEN_COOKIE_NAME
import models, schemas

# auto_error=False so a missing Authorization header falls through to the
# HttpOnly cookie instead of failing; 401 is raised below if neither is present.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # Authorization header wins; the HttpOnly cookie is the fallback for
    # browser sessions that never kept the token in JS-accessible storage.
    if token is None:
        token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if not token:
        raise credentials_exception
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


def require_role(*roles):
    """Dependency factory: allow only authenticated users whose role is in
    *roles. The role is read from the DB row (never trusted from the token
    claim alone), so a change in the users table takes effect immediately."""
    async def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return role_checker


# Reusable dependency for admin-only endpoints.
get_current_admin = require_role("admin")
