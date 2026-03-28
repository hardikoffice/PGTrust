import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import GenderPreference


class PGListing(Base):
    __tablename__ = "pg_listings"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("owners.user_id"), index=True, nullable=False
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    rent: Mapped[float] = mapped_column(Numeric(10, 2), index=True, nullable=False)
    # Listing quality / owner PG rating (0–5), used for search filters on the homepage.
    rating: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False, default=4.0)
    amenities: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    images: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    gender_preference: Mapped[GenderPreference | None] = mapped_column(Enum(GenderPreference), nullable=True)
    rent_due_day: Mapped[int | None] = mapped_column(Integer, nullable=True) # 1-28

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    owner = relationship("Owner", back_populates="pg_listings")
    requests = relationship("Request", back_populates="pg")
    reviews = relationship("PgReview", back_populates="pg")

