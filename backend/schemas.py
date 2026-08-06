from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

from core.security import MIN_PASSWORD_LENGTH

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=MIN_PASSWORD_LENGTH, description=f"Minimum {MIN_PASSWORD_LENGTH} characters")

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: str
    target_audience: Optional[str] = None
    industry: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Report Schemas
class ReportResponse(BaseModel):
    id: int
    project_id: int
    content: Dict[str, Any]
    executive_summary: Optional[str]
    pdf_url: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Project with Report
class ProjectDetailResponse(ProjectResponse):
    report: Optional[ReportResponse] = None
