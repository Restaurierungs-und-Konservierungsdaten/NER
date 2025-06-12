# main.py
# A minimal, single-file FastAPI backend for NER annotation with security.

# --- Required dependencies ---
# pip install "fastapi[all]" sqlalchemy gliner torch "passlib[bcrypt]" "python-jose[cryptography]"

import json
import datetime
import os
from dotenv import load_dotenv
from typing import Optional, Any

from fastapi import FastAPI, Depends, Request, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

# --- Security & Auth Imports ---
from jose import JWTError, jwt
from passlib.context import CryptContext


# --- 1. GLiNER Model Setup ---
print("Loading GLiNER model...")
from gliner import GLiNER
model = GLiNER.from_pretrained("urchade/gliner_multi-v2.1")
entity_labels = ["Restaurierungsmaterial", "Objektmaterial", "Objektzustand", "Schadensphänomen", "Restaurierungswerkzeug", "Restaurierungsmethode"]
print("Model loaded successfully.")

# --- 2. Security Configuration ---
# Load the environment variables from .env file
load_dotenv()
# WARNING: This key should be a long, random string and ideally loaded from an environment variable.
#SECRET_KEY = "a_very_secret_key_that_you_must_change" 

# load secret key from .env file
try:
    SECRET_KEY: str = os.environ['SECRET_KEY']
except KeyError:
    raise ValueError("SECRET_KEY environment variable not set. Please set it in your .env file or environment.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# --- 3. Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./minimal_ner_app.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Models (Tables) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Annotation(Base):
    __tablename__ = "annotations"
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    model_annotations = Column(Text, nullable=False)
    curated_annotations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

# --- 4. Pydantic Models (for data validation) ---
class UserCreate(BaseModel):
    username: str
    password: str

class TokenData(BaseModel):
    username: Optional[str] = None


# --- 5. Auth Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# --- 6. FastAPI Application & Dependencies ---
app = FastAPI(title="Secure Minimal NER Backend")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # FIX: Pylance correctly warns that .get() can return None.
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # FIX: Check for username again before passing to get_user which expects a str.
    if token_data.username is None:
        raise credentials_exception
    
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# --- 7. API Endpoints ---

@app.post("/users/", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Endpoint to create a new user. Keep this maybe for admin use only later."""
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"username": new_user.username, "message": "User created successfully"}

@app.post("/token")
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint to get an access token."""
    user = get_user(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/annotate")
async def annotate_text(request: Request, current_user: User = Depends(get_current_user)):
    """SECURED: Receives text and returns entities. Requires authentication."""
    data = await request.json()
    text = data.get('text')
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    entities = model.predict_entities(text, entity_labels, threshold=0.5)
    return {"original_text": text, "model_annotations": entities}

@app.post("/annotations")
async def save_annotations(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """SECURED: Saves annotations to the database. Requires authentication."""
    data = await request.json()
    # Safely get curated_annotations, defaulting to None if not present
    curated = data.get('curated_annotations')
    new_annotation = Annotation(
        original_text=data['original_text'],
        model_annotations=json.dumps(data['model_annotations']),
        curated_annotations=json.dumps(curated) if curated is not None else None
    )
    db.add(new_annotation)
    db.commit()
    return {"message": "Annotation saved successfully."}

@app.get("/annotations")
async def get_all_annotations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """SECURED: Retrieves all annotations. Requires authentication."""
    all_annotations = db.query(Annotation).order_by(Annotation.created_at.desc()).all()
    results = []
    for ann in all_annotations:
        curated_obj: Optional[Any] = None
        # FIX: Be explicit. Check if the value is not None and is a string before loading.
        if ann.curated_annotations is not None and isinstance(ann.curated_annotations, str):
            curated_obj = json.loads(ann.curated_annotations)

        # Fix for model_annotations: Ensure it's treated as a string
        model_annotations_obj: Optional[Any] = None
        if ann.model_annotations is not None and isinstance(ann.model_annotations, str):
            model_annotations_obj = json.loads(ann.model_annotations)

        results.append({
            "id": ann.id,
            "original_text": ann.original_text,
            "model_annotations": model_annotations_obj, # Use the safely loaded object
            "curated_annotations": curated_obj,
            "created_at": ann.created_at
        })
    return results
