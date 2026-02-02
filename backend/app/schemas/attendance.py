from datetime import date
from typing import Optional
from pydantic import BaseModel


class AttendanceBase(BaseModel):
    host_id: int
    date: date
    status: Optional[str] = "present"
    note: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None


class AttendanceOut(AttendanceBase):
    id: int

    class Config:
        from_attributes = True
