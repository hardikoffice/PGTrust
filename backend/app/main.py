from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import api_router
from app.core.config import settings
from sqlalchemy import text

from app.core.database import Base, engine
import app.models  # noqa: F401


def _run_db_migrations() -> None:
    """Safely add new columns to existing DBs created before these columns existed."""
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            if engine.dialect.name == "sqlite":
                # pg_listings
                rows = conn.execute(text("PRAGMA table_info(pg_listings);")).fetchall()
                col_names = {r[1] for r in rows}
                if "rating" not in col_names:
                    conn.execute(text("ALTER TABLE pg_listings ADD COLUMN rating NUMERIC(3,2) NOT NULL DEFAULT 4.0"))
                if "rent_due_day" not in col_names:
                    conn.execute(text("ALTER TABLE pg_listings ADD COLUMN rent_due_day INTEGER"))
                
                # requests
                rows_req = conn.execute(text("PRAGMA table_info(requests);")).fetchall()
                col_req = {r[1] for r in rows_req}
                if "is_moving_out" not in col_req:
                    conn.execute(text("ALTER TABLE requests ADD COLUMN is_moving_out BOOLEAN NOT NULL DEFAULT 0"))

                # users
                rows_usr = conn.execute(text("PRAGMA table_info(users);")).fetchall()
                col_usr = {r[1] for r in rows_usr}
                if "date_of_birth" not in col_usr:
                    conn.execute(text("ALTER TABLE users ADD COLUMN date_of_birth DATE"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR(20)"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN marital_status VARCHAR(20)"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN income_range VARCHAR(50)"))

            elif engine.dialect.name in ("postgresql", "postgres"):
                # Helper for Postgres schema info
                def has_col(table: str, col: str) -> bool:
                    res = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND column_name = '{col}'")).scalar()
                    return res is not None

                if not has_col("pg_listings", "rent_due_day"):
                    conn.execute(text("ALTER TABLE pg_listings ADD COLUMN rent_due_day INTEGER"))
                
                if not has_col("requests", "is_moving_out"):
                    conn.execute(text("ALTER TABLE requests ADD COLUMN is_moving_out BOOLEAN NOT NULL DEFAULT FALSE"))

                if not has_col("users", "date_of_birth"):
                    conn.execute(text("ALTER TABLE users ADD COLUMN date_of_birth DATE"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN gender VARCHAR(20)"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN marital_status VARCHAR(20)"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN income_range VARCHAR(50)"))
    except Exception as e:
        print(f"Skipped auto-migration: {e}")



def create_app() -> FastAPI:
    app = FastAPI(title="PG Trust API", version="0.1.0")

    origins = [o.strip().rstrip('/') for o in settings.cors_origins.split(",") if o.strip()]
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
    _run_db_migrations()

