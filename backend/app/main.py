from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app import models
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import User

app = FastAPI(title="Host Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def ensure_admin_user():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == settings.admin_username).first()
        if not existing:
            admin_user = User(
                username=settings.admin_username,
                hashed_password=get_password_hash(settings.admin_password),
                role=settings.admin_role,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()

app.include_router(router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "ok"}
