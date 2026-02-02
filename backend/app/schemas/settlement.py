from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class SettlementBase(BaseModel):
    host_id: int
    period_start: date
    period_end: date
    total_sales: Optional[Decimal] = 0
    total_payout: Optional[Decimal] = 0
    status: Optional[str] = "pending"


class SettlementCreate(SettlementBase):
    pass


class SettlementUpdate(BaseModel):
    total_sales: Optional[Decimal] = None
    total_payout: Optional[Decimal] = None
    status: Optional[str] = None


class SettlementOut(SettlementBase):
    id: int

    class Config:
        from_attributes = True
