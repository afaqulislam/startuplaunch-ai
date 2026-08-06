from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import models, schemas
from api import deps
from core import security
from core.ratelimit import (
    login_ip_limiter,
    login_email_limiter,
    register_limiter,
    rate_limit,
    client_ip,
)

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse)
async def register(
    user: schemas.UserCreate,
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
):
    rate_limit(register_limiter, client_ip(request))

    result = await db.execute(select(models.User).where(models.User.email == user.email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(deps.get_db),
):
    ip = client_ip(request)
    rate_limit(login_ip_limiter, f"ip:{ip}")
    rate_limit(login_email_limiter, f"email:{form_data.username}")

    result = await db.execute(select(models.User).where(models.User.email == form_data.username))
    user = result.scalars().first()
    if (
        not user
        or not user.is_active
        or not security.verify_password(form_data.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
