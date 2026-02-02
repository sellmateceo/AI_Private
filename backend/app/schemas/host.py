from datetime import date
from typing import Optional
from pydantic import BaseModel


class HostBase(BaseModel):
    name: str
    nickname: Optional[str] = None
    join_date: Optional[date] = None
    status: Optional[str] = "active"


class HostCreate(HostBase):
    pass


class HostUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    join_date: Optional[date] = None
    status: Optional[str] = None


class HostOut(HostBase):
    id: int

    class Config:
        from_attributes = True
