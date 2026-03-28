import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, UniqueConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PgReview(Base):
    """Tenant-written reviews of a PG listing (separate from owner→tenant feedback)."""

    __tablename__ = "pg_reviews"
    __table_args__ = (
        UniqueConstraint("pg_id", "author_id", name="uq_pg_reviews_pg_author"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="chk_pg_review_rating"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pg_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("pg_listings.id"), index=True, nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    pg = relationship("PGListing", back_populates="reviews")
    author = relationship("User", back_populates="pg_reviews")
