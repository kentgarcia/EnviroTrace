# app/schemas/token_schemas.py
from pydantic import BaseModel
from typing import Optional
import uuid

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[uuid.UUID] = None # Subject (user_id)