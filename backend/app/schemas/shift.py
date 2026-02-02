from datetime import date, time
from typing import Optional
from pydantic import BaseModel


class ShiftBase(BaseModel):
    host_id: int
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[str] = "scheduled"


class ShiftCreate(ShiftBase):
    pass


class ShiftUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[str] = None


class ShiftOut(ShiftBase):
    id: int

    class Config:
        from_attributes = True
