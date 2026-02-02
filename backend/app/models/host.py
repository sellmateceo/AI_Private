from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Host(Base):
    __tablename__ = "hosts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    nickname = Column(String(100), nullable=True)
    join_date = Column(Date, nullable=True)
    status = Column(String(20), default="active")

    attendances = relationship("Attendance", back_populates="host")
    shifts = relationship("Shift", back_populates="host")
    sales = relationship("Sale", back_populates="host")
    settlements = relationship("Settlement", back_populates="host")
