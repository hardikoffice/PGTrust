import uuid

from sqlalchemy import Boolean, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Owner(Base):
    __tablename__ = "owners"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    business_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    verified_owner: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="owner")
    pg_listings = relationship("PGListing", back_populates="owner")

