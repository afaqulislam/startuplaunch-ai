from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError

import models, schemas
from api import deps
from core import security
from core.ratelimit import (
    login_ip_limiter,
    login_email_limiter,
    register_limiter,
    register_email_limiter,
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
    # Store emails lowercased so "User@X.com" and "user@x.com" are one account.
    email = user.email.lower()
    await rate_limit(register_limiter, client_ip(request))
    await rate_limit(register_email_limiter, f"email:{email}")

    result = await db.execute(select(models.User).where(func.lower(models.User.email) == email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(email=email, hashed_password=hashed_password)
    db.add(new_user)
    try:
        await db.commit()
    except IntegrityError:
        # The email check above is not atomic — two concurrent registrations
        # for the same address can both pass it. Surface the unique-constraint
        # race as a clean 400 instead of a 500.
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(deps.get_db),
):
    ip = client_ip(request)
    email = form_data.username.lower()
    await rate_limit(login_ip_limiter, f"ip:{ip}")
    await rate_limit(login_email_limiter, f"email:{email}")

    result = await db.execute(select(models.User).where(func.lower(models.User.email) == email))
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
        data={"sub": user.email, "ver": user.token_version, "role": user.role},
        expires_delta=access_token_expires,
    )
    # Keep the JSON token (Authorization-header clients rely on it) and also
    # set an HttpOnly cookie so browser sessions survive reloads without ever
    # touching localStorage.
    response = JSONResponse({"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key=security.ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        max_age=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=security.COOKIE_SECURE,
        samesite=security.COOKIE_SAMESITE,
        path="/",
    )
    return response


@router.post("/logout")
async def logout():
    # Clears the HttpOnly session cookie. Requires no authentication so a
    # left-over client-side token can always be revoked that way; the JWT
    # itself expires on its own and is additionally revocable via password
    # change (token_version).
    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie(
        key=security.ACCESS_TOKEN_COOKIE_NAME,
        httponly=True,
        secure=security.COOKIE_SECURE,
        samesite=security.COOKIE_SAMESITE,
        path="/",
    )
    return response


@router.post("/change-password")
async def change_password(
    payload: schemas.ChangePassword,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    if not security.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="New password must be different")

    current_user.hashed_password = security.get_password_hash(payload.new_password)
    # Bump the token version so every outstanding session is revoked at once.
    current_user.token_version += 1
    await db.commit()

    return {"message": "Password changed successfully. Please log in again."}
