from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("hosts.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String(20), default="present")
    note = Column(String(255), nullable=True)

    host = relationship("Host", back_populates="attendances")
