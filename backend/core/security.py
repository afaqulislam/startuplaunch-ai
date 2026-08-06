from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
import bcrypt
import os

# Config
# SECRET_KEY is REQUIRED in production/dev. Fail closed rather than ship a
# publicly-known signing key that would let anyone forge tokens.
SECRET_KEY = os.environ.get("SECRET_KEY", "")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is not set. Add it to the .env file "
        "(generate one with: python -c \"import secrets; print(secrets.token_urlsafe(48))\")."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week
MIN_PASSWORD_LENGTH = 8


def verify_password(plain_password, hashed_password):
    password_bytes = plain_password.encode('utf-8')[:72]
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)


def get_password_hash(password):
    # bcrypt requires bytes and limits to 72 bytes
    password_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
