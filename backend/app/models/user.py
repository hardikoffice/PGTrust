import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Role


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False, default=Role.UNASSIGNED)

    # Bio-data added for trust score and profile completion
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    marital_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    income_range: Mapped[str | None] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    tenant = relationship("Tenant", back_populates="user", uselist=False)
    owner = relationship("Owner", back_populates="user", uselist=False)
    pg_reviews = relationship("PgReview", back_populates="author")

