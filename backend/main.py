# main.py
import torch
import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

# Eigene Module importieren
from . import auth, database, models

# GLiNER importieren
from gliner import GLiNER

# --- Initialisierung ---

# Datenbanktabellen erstellen, falls sie nicht existieren
database.create_db_and_tables()

# FastAPI-App-Instanz
app = FastAPI(title="NER Annotation Backend")

# GLiNER-Modell laden (nur einmal beim Start der App)
print("Lade GLiNER-Modell...")
gliner_model = GLiNER.from_pretrained("urchade/gliner_multi")
print("Modell geladen.")

# Entitäten, die wir erkennen wollen
entity_labels = ["Person", "Ort", "Organisation", "Datum", "Produkt"]

# --- Hilfsfunktion für die Datenbank-Session ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpunkte ---

@app.post("/token", response_model=models.Token)
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.get_user(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/users/", response_model=models.User, status_code=status.HTTP_201_CREATED)
def create_user(user: models.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(database.User).filter(database.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = database.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/annotate/", response_model=models.AnnotationResult)
async def annotate_text(
    data: models.TextForAnnotation,
    current_user: models.User = Depends(auth.get_current_user)
):
    text = data.text
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    entities = gliner_model.predict_entities(text, entity_labels, threshold=0.5)
    return {"text": text, "entities": entities}


@app.post("/annotations/", status_code=status.HTTP_201_CREATED)
async def save_annotations(
    data: models.AnnotationForSaving,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_annotation = database.Annotation(
        original_text=data.original_text,
        model_annotations=json.dumps(data.model_annotations),
        curated_annotations=json.dumps(data.curated_annotations) if data.curated_annotations else None,
        owner_id=current_user.id
    )
    db.add(new_annotation)
    db.commit()
    return {"message": "Annotation saved successfully"}


@app.get("/annotations/", response_model=List[models.AnnotationInDB])
async def get_all_annotations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user) # Authentifizierung weiterhin erforderlich
):
    """
    Ruft ALLE in der Datenbank gespeicherten Annotationen ab.
    Diese Aktion ist nur für authentifizierte Benutzer zulässig.
    """
    annotations_from_db = db.query(database.Annotation).all()
    
    # Die JSON-Strings vor der Rückgabe wieder in Objekte umwandeln
    for ann in annotations_from_db:
        if isinstance(ann.model_annotations, str):
            ann.model_annotations = json.loads(ann.model_annotations)
        # KORRIGIERT: Explizite Prüfung auf None, um den Pylance-Fehler zu beheben
        if ann.curated_annotations is not None and isinstance(ann.curated_annotations, str):
            ann.curated_annotations = json.loads(ann.curated_annotations)
            
    return annotations_from_db


@app.get("/users/me", response_model=models.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
