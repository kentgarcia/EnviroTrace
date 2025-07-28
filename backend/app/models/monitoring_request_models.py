from sqlalchemy import Column, String, Date, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base

class MonitoringRequest(Base):
    __tablename__ = "monitoring_requests"
    __table_args__ = ( {"schema": "urban_greening"}, )
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    requester_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    location = Column(JSONB, nullable=False)  # {lat, lng}
    address = Column(String, nullable=False)
    description = Column(Text, nullable=True)
