from sqlalchemy import Column, String, Date, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base

class MonitoringRequest(Base):
    __tablename__ = "monitoring_requests"
    __table_args__ = ( {"schema": "urban_greening"}, )
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=True)
    requester_name = Column(String, nullable=True)
    status = Column(String, nullable=False)
    date = Column(Date, nullable=True)
    location = Column(JSONB, nullable=False)  # {lat, lng}
    address = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    source_type = Column(String, nullable=True)  # 'urban_greening' or 'tree_management'
