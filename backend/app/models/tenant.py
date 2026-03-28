import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Integer, Text, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import VerificationStatus


class Tenant(Base):
    __tablename__ = "tenants"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )

    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    id_proof_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), nullable=False, default=VerificationStatus.UNVERIFIED
    )
    trust_score: Mapped[int] = mapped_column(Integer, nullable=False, default=500)

    user = relationship("User", back_populates="tenant")
    requests = relationship("Request", back_populates="tenant")

