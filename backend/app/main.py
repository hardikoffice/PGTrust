from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import api_router
from app.core.config import settings
from sqlalchemy import text

from app.core.database import Base, engine
import app.models  # noqa: F401


def _ensure_sqlite_pg_rating_column() -> None:
    """Add pg_listings.rating for existing SQLite DBs created before this column existed."""
    if not str(engine.url).startswith("sqlite"):
        return
    with engine.connect() as conn:
        rows = conn.execute(text("PRAGMA table_info(pg_listings);")).fetchall()
        col_names = {r[1] for r in rows}
        if "rating" not in col_names:
            conn.execute(text("ALTER TABLE pg_listings ADD COLUMN rating NUMERIC(3,2) NOT NULL DEFAULT 4.0"))
            conn.commit()
        if "rent_due_day" not in col_names:
            conn.execute(text("ALTER TABLE pg_listings ADD COLUMN rent_due_day INTEGER"))
            conn.commit()


def create_app() -> FastAPI:
    app = FastAPI(title="PG Trust API", version="0.1.0")

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    # In development, your Next.js dev server might be opened via `localhost` or your LAN IP.
    # Using "*" prevents CORS preflight failures during local testing.
    if settings.environment == "development":
        origins = ["*"]

    allow_credentials = False if origins == ["*"] else True
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

    @app.get("/debug/cors")
    def debug_cors():
        return {
            "environment": settings.environment,
            "cors_origins_raw": settings.cors_origins,
            "computed_origins": origins,
            "allow_credentials": allow_credentials,
        }

    @app.get("/health")
    def health():
        return {"ok": True}

    return app


app = create_app()


@app.on_event("startup")
def _startup_create_tables():
    # MVP convenience: auto-create tables for local dev.
    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_pg_rating_column()

