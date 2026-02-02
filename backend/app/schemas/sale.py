from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class SaleBase(BaseModel):
    host_id: int
    date: date
    amount: Decimal
    category: Optional[str] = "table"
    note: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    note: Optional[str] = None


class SaleOut(SaleBase):
    id: int

    class Config:
        from_attributes = True
