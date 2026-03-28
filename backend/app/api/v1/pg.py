import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.enums import GenderPreference, Role
from app.models.pg_listing import PGListing
from app.models.user import User
from app.schemas.pg import (
    PGCreateRequest,
    PGCreateResponse,
    PGDetailResponse,
    PGImageUploadResponse,
    PGSearchResponse,
    PGCard,
)

# backend/uploads/pg_images — served at /uploads/pg_images/<file>
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent.parent
_UPLOAD_ROOT = _BACKEND_ROOT / "uploads" / "pg_images"
_ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024

router = APIRouter(prefix="/pg", tags=["pg"])


@router.post("/create", response_model=PGCreateResponse, status_code=status.HTTP_201_CREATED)
def create_pg(
    body: PGCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    pg = PGListing(
        owner_id=user.id,
        name=body.name,
        location=body.location,
        rent=body.rent,
        rating=body.rating if body.rating is not None else 4.0,
        amenities=body.amenities,
        images=body.images,
        description=body.description,
        gender_preference=GenderPreference(body.gender_preference) if body.gender_preference else None,
        active=True,
    )
    db.add(pg)
    db.commit()
    db.refresh(pg)
    return PGCreateResponse(message="PG listed successfully.", pg_id=str(pg.id))


@router.post("/upload-image", response_model=PGImageUploadResponse)
async def upload_pg_image(
    file: UploadFile = File(...),
    _: User = Depends(require_role(Role.OWNER)),
):
    """Store one image and return a URL path usable in pg create/update image lists."""
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image type. Use JPEG, PNG, WebP, or GIF.",
        )
    raw = await file.read()
    if len(raw) > _MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image too large (max 5MB).",
        )
    ext = _ALLOWED_IMAGE_TYPES[content_type]
    name = f"{uuid.uuid4().hex}{ext}"
    _UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    dest = _UPLOAD_ROOT / name
    dest.write_bytes(raw)
    return PGImageUploadResponse(url=f"/uploads/pg_images/{name}")


@router.get("/mine", response_model=list[PGDetailResponse])
def my_pgs(db: Session = Depends(get_db), user: User = Depends(require_role(Role.OWNER))):
    rows = (
        db.execute(select(PGListing).where(PGListing.owner_id == user.id).order_by(PGListing.created_at.desc()))
        .scalars()
        .all()
    )
    return [
        PGDetailResponse(
            id=str(pg.id),
            owner_id=str(pg.owner_id),
            name=pg.name,
            location=pg.location,
            rent=float(pg.rent),
            rating=float(pg.rating),
            amenities=pg.amenities or [],
            images=pg.images or [],
            description=pg.description,
            gender_preference=pg.gender_preference.value if pg.gender_preference else None,
            active=pg.active,
        )
        for pg in rows
    ]


@router.get("/search", response_model=PGSearchResponse)
def search_pgs(
    db: Session = Depends(get_db),
    location: str | None = None,
    min_rent: float | None = None,
    max_rent: float | None = None,
    min_rating: float | None = Query(default=None, ge=0, le=5),
    gender: str | None = None,
    page: int = Query(default=1, ge=1),
):
    filters = [PGListing.active.is_(True)]
    if location:
        filters.append(PGListing.location.ilike(f"%{location}%"))
    if min_rent is not None:
        filters.append(PGListing.rent >= min_rent)
    if max_rent is not None:
        filters.append(PGListing.rent <= max_rent)
    if min_rating is not None:
        filters.append(PGListing.rating >= min_rating)
    if gender:
        try:
            g = GenderPreference(gender)
            filters.append(and_(PGListing.gender_preference.in_([g, GenderPreference.ANY])))
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid gender filter")

    page_size = 10
    offset = (page - 1) * page_size

    total = db.execute(select(func.count()).select_from(PGListing).where(and_(*filters))).scalar_one()
    rows = (
        db.execute(
            select(PGListing).where(and_(*filters)).order_by(PGListing.created_at.desc()).offset(offset).limit(page_size)
        )
        .scalars()
        .all()
    )

    cards: list[PGCard] = []
    for r in rows:
        cards.append(
            PGCard(
                id=str(r.id),
                name=r.name,
                location=r.location,
                rent=float(r.rent),
                rating=float(r.rating),
                amenities=r.amenities or [],
                image=(r.images[0] if r.images else None),
            )
        )
    return PGSearchResponse(page=page, total_results=int(total), data=cards)


@router.get("/{pg_id}", response_model=PGDetailResponse)
def get_pg(pg_id: str, db: Session = Depends(get_db)):
    try:
        import uuid

        uid = uuid.UUID(pg_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PG id")

    pg = db.get(PGListing, uid)
    if not pg or not pg.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PG not found")

    return PGDetailResponse(
        id=str(pg.id),
        owner_id=str(pg.owner_id),
        name=pg.name,
        location=pg.location,
        rent=float(pg.rent),
        rating=float(pg.rating),
        amenities=pg.amenities or [],
        images=pg.images or [],
        description=pg.description,
        gender_preference=pg.gender_preference.value if pg.gender_preference else None,
        active=pg.active,
    )

