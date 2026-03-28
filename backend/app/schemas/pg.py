from datetime import datetime

from pydantic import BaseModel, Field


class PGCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    location: str = Field(min_length=2, max_length=255)
    rent: float = Field(gt=0)
    rating: float | None = Field(default=None, ge=0, le=5, description="PG listing rating 0–5")
    amenities: list[str] | None = None
    gender_preference: str | None = Field(default=None, pattern="^(MALE|FEMALE|ANY)$")
    description: str | None = None
    images: list[str] | None = Field(default=None, max_length=8)


class PGCreateResponse(BaseModel):
    message: str
    pg_id: str


class PGImageUploadResponse(BaseModel):
    """Relative URL path served from GET /uploads/..."""

    url: str


class PGCard(BaseModel):
    id: str
    name: str
    location: str
    rent: float
    rating: float
    amenities: list[str] | None = None
    image: str | None = None


class PGSearchResponse(BaseModel):
    page: int
    total_results: int
    data: list[PGCard]


class PGDetailResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    location: str
    rent: float
    rating: float
    amenities: list[str] | None = None
    images: list[str] | None = None
    description: str | None = None
    gender_preference: str | None = None
    active: bool


class PGRemoveResponse(BaseModel):
    message: str


class PGReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class PGReviewItem(BaseModel):
    id: str
    author_display_name: str
    rating: int
    comment: str | None
    created_at: datetime


class PGReviewListResponse(BaseModel):
    reviews: list[PGReviewItem]
    average_rating: float | None
    total: int

