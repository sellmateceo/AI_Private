from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("hosts.id"), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    total_sales = Column(Numeric(12, 2), default=0)
    total_payout = Column(Numeric(12, 2), default=0)
    status = Column(String(20), default="pending")

    host = relationship("Host", back_populates="settlements")
