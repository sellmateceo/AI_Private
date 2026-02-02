from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("hosts.id"), nullable=False)
    date = Column(Date, nullable=False)
    amount = Column(Numeric(12, 2), default=0)
    category = Column(String(50), default="table")
    note = Column(String(255), nullable=True)

    host = relationship("Host", back_populates="sales")
