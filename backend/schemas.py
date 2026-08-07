from pydantic import BaseModel, EmailStr, Field, ConfigDict, StringConstraints
from typing import Annotated, Optional, Any
from datetime import datetime

from core.security import MIN_PASSWORD_LENGTH

# Reusable constraints: reject blank/whitespace-only input and cap payload size
# so a single project can't bloat the LLM prompt or the database.
TitleStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
DescriptionStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]
OptionalShortStr = Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)]

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=MIN_PASSWORD_LENGTH,
        max_length=72,  # bcrypt silently truncates at 72 bytes
        description=f"Minimum {MIN_PASSWORD_LENGTH} characters, max 72 (bcrypt limit)",
    )

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


class ChangePassword(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=72)
    new_password: str = Field(
        ...,
        min_length=MIN_PASSWORD_LENGTH,
        max_length=72,  # bcrypt silently truncates at 72 bytes
    )

# Project Schemas
class ProjectBase(BaseModel):
    title: TitleStr
    description: DescriptionStr
    target_audience: Optional[OptionalShortStr] = None
    industry: Optional[OptionalShortStr] = None

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
    # Keep content permissive: a legacy or truncated report may not be a clean
    # object, and a strict Dict[str, Any] here would turn into a 500 on the
    # project detail endpoint instead of rendering the report.
    content: Any
    executive_summary: Optional[str]
    pdf_url: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Project with Report
class ProjectDetailResponse(ProjectResponse):
    report: Optional[ReportResponse] = None
