# models.py
from pydantic import BaseModel
from typing import List, Optional, Any
import datetime

# --- Text-Modelle ---
class TextForAnnotation(BaseModel):
    text: str

class AnnotationResult(BaseModel):
    text: str
    entities: List[dict]

class AnnotationForSaving(BaseModel):
    original_text: str
    model_annotations: Any # Kann ein JSON-Objekt sein
    curated_annotations: Optional[Any] = None # Optional

# NEU: Modell für die Rückgabe von Annotationen aus der DB
class AnnotationInDB(BaseModel):
    id: int
    original_text: str
    model_annotations: Any
    curated_annotations: Optional[Any]
    created_at: datetime.datetime
    owner_id: int

    class Config:
        orm_mode = True # Ermöglicht das Laden aus dem SQLAlchemy-Modell

# --- User- und Token-Modelle ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None