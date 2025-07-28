from sqlalchemy import Column, String, Integer, Date, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class AirQualityFee(Base):
    __tablename__ = "air_quality_fees"
    __table_args__ = {"schema": "emission"}

    fee_id = Column(String, primary_key=True, index=True)
    category = Column(String, nullable=False)
    rate = Column(Integer, nullable=False)  # stored as cents
    date_effective = Column(Date, nullable=False)
    level = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())