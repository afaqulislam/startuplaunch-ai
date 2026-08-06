from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file before anything else reads env vars

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, projects, reports
from database import engine, Base

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # In a real production app, use Alembic migrations instead of create_all.
    # For initial dev setup, we'll auto-create tables.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="StartupLaunch AI API", lifespan=lifespan)

# Configure CORS for the Next.js frontend (comma-separated origins via env).
cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/")
def read_root():
    return {"message": "Welcome to StartupLaunch AI API"}
