from sqlalchemy import Column, String, Integer, Date, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base


class AirQualityFee(Base):
    __tablename__ = "air_quality_fees"
    __table_args__ = {"schema": "emission"}

    fee_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String, nullable=False)
    rate = Column(Integer, nullable=False)
    date_effective = Column(Date, nullable=False)
    offense_level = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())