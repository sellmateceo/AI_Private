from pydantic import BaseModel
from typing import Optional


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "staff"
