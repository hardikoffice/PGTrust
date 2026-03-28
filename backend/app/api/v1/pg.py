import uuid
from pathlib import Path
import base64
import httpx

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.config import settings
from app.core.database import get_db
from app.models.enums import GenderPreference, Role
from app.models.pg_listing import PGListing
from app.models.pg_review import PgReview
from app.models.user import User
from app.schemas.pg import (
    PGCreateRequest,
    PGCreateResponse,
    PGDetailResponse,
    PGImageUploadResponse,
    PGRemoveResponse,
    PGReviewCreate,
    PGReviewItem,
    PGReviewListResponse,
    PGSearchResponse,
    PGCard,
    PGResidentItem,
)

_ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5MB

router = APIRouter(prefix="/pg", tags=["pg"])


def _author_display_name(user: User) -> str:
    name = (user.full_name or "").strip()
    if not name:
        return "Member"
    return name.split()[0]


def _parse_pg_uuid(pg_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(pg_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PG id")


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
        rent_due_day=body.rent_due_day,
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
    # Upload to ImgBB
    if not settings.imgbb_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ImgBB is not configured. Please set IMGBB_API_KEY environment variable."
        )

    try:
        encoded = base64.b64encode(raw).decode("utf-8")
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.imgbb.com/1/upload",
                data={
                    "key": settings.imgbb_api_key,
                    "image": encoded,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return PGImageUploadResponse(url=data["data"]["url"])
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"ImgBB upload failed: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}"
        )


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
            rent_due_day=int(pg.rent_due_day) if pg.rent_due_day else None,
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


@router.get("/{pg_id}/reviews/me", response_model=PGReviewItem | None)
def get_my_pg_review(
    pg_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    """Current tenant’s review for this PG, if any."""
    uid = _parse_pg_uuid(pg_id)
    pg = db.get(PGListing, uid)
    if not pg or not pg.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PG not found")

    rev = db.execute(
        select(PgReview).where(PgReview.pg_id == uid, PgReview.author_id == user.id)
    ).scalar_one_or_none()
    if not rev:
        return None

    author = db.get(User, user.id)
    assert author is not None
    return PGReviewItem(
        id=str(rev.id),
        author_display_name=_author_display_name(author),
        rating=rev.rating,
        comment=rev.comment,
        created_at=rev.created_at,
    )


@router.get("/{pg_id}/reviews", response_model=PGReviewListResponse)
def list_pg_reviews(pg_id: str, db: Session = Depends(get_db)):
    """Public: reviews left by tenants for this PG."""
    uid = _parse_pg_uuid(pg_id)
    pg = db.get(PGListing, uid)
    if not pg or not pg.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PG not found")

    rows = db.execute(
        select(PgReview, User)
        .join(User, PgReview.author_id == User.id)
        .where(PgReview.pg_id == uid)
        .order_by(PgReview.created_at.desc())
    ).all()

    items: list[PGReviewItem] = []
    for rev, author in rows:
        items.append(
            PGReviewItem(
                id=str(rev.id),
                author_display_name=_author_display_name(author),
                rating=rev.rating,
                comment=rev.comment,
                created_at=rev.created_at,
            )
        )

    avg = db.execute(select(func.avg(PgReview.rating)).where(PgReview.pg_id == uid)).scalar_one()
    avg_f = float(avg) if avg is not None else None

    return PGReviewListResponse(
        reviews=items,
        average_rating=round(avg_f, 2) if avg_f is not None else None,
        total=len(items),
    )


@router.post("/{pg_id}/reviews", response_model=PGReviewItem)
def upsert_pg_review(
    pg_id: str,
    body: PGReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    """Tenants can post or update their review for a PG (one per user per listing)."""
    uid = _parse_pg_uuid(pg_id)
    pg = db.get(PGListing, uid)
    if not pg or not pg.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PG not found")
    if pg.owner_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot review your own listing",
        )

    existing = db.execute(
        select(PgReview).where(PgReview.pg_id == uid, PgReview.author_id == user.id)
    ).scalar_one_or_none()

    if existing:
        existing.rating = body.rating
        existing.comment = body.comment
        db.commit()
        db.refresh(existing)
        rev = existing
    else:
        rev = PgReview(
            pg_id=uid,
            author_id=user.id,
            rating=body.rating,
            comment=body.comment,
        )
        db.add(rev)
        db.commit()
        db.refresh(rev)

    author = db.get(User, user.id)
    assert author is not None
    return PGReviewItem(
        id=str(rev.id),
        author_display_name=_author_display_name(author),
        rating=rev.rating,
        comment=rev.comment,
        created_at=rev.created_at,
    )


@router.get("/{pg_id}", response_model=PGDetailResponse)
def get_pg(pg_id: str, db: Session = Depends(get_db)):
    uid = _parse_pg_uuid(pg_id)

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
        rent_due_day=int(pg.rent_due_day) if pg.rent_due_day else None,
    )


@router.delete("/{pg_id}", response_model=PGRemoveResponse)
def remove_pg(
    pg_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    """Soft-delete a listing (sets active=false). Hidden from search; owner still sees it in /mine."""
    try:
        uid = uuid.UUID(pg_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PG id")

    pg = db.get(PGListing, uid)
    if not pg or pg.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PG not found")

    if not pg.active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Listing is already removed")

    pg.active = False
    db.commit()
    return PGRemoveResponse(message="Listing removed. It no longer appears in search.")


@router.get("/{pg_id}/residents", response_model=list[PGResidentItem])
def list_pg_residents(
    pg_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    """List all active residents (ACCEPTED/COMPLETED requests) for a specific PG."""
    from app.models.request import Request
    from app.models.enums import RequestStatus
    
    uid = _parse_pg_uuid(pg_id)
    pg = db.get(PGListing, uid)
    if not pg or pg.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PG not found or not owned by you")

    rows = db.execute(
        select(Request, User)
        .join(User, Request.tenant_id == User.id)
        .where(
            and_(
                Request.pg_id == uid,
                Request.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED])
            )
        )
        .order_by(Request.updated_at.desc())
    ).all()

    results = []
    for req, tenant_user in rows:
        results.append(
            PGResidentItem(
                id=str(req.id),
                tenant_id=str(tenant_user.id),
                full_name=tenant_user.full_name or "Unknown",
                phone_number=tenant_user.phone_number,
                email=tenant_user.email,
                status=req.status.value,
                joined_at=req.updated_at
            )
        )
    return results

