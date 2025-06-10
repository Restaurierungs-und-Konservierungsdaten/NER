# database.py
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime

# Die URL für unsere SQLite-Datenbank. Die Datei wird im selben Verzeichnis erstellt.
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Die SQLAlchemy-Engine erstellen
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Eine SessionLocal-Klasse, die als "Fabrik" für neue Datenbank-Sessions dient
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base-Klasse, von der unsere ORM-Modelle erben werden
Base = declarative_base()

# --- ORM-Modelle (Tabellenstruktur) ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Beziehung zu den Annotationen: Ein User kann viele Annotationen haben
    annotations = relationship("Annotation", back_populates="owner")

class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    # Wir speichern die Annotationen als JSON-Strings im Text-Format.
    # Das ist für SQLite am einfachsten.
    model_annotations = Column(Text, nullable=False)
    curated_annotations = Column(Text, nullable=True) # Kann leer sein
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Beziehung zum User
    owner = relationship("User", back_populates="annotations")

# Funktion, um die Datenbank zu initialisieren (Tabellen erstellen)
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)
