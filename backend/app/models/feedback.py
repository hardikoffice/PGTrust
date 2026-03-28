import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    __table_args__ = (
        CheckConstraint("payment_rating >= 0 AND payment_rating <= 100", name="chk_payment_rating"),
        CheckConstraint("behavior_rating >= 0 AND behavior_rating <= 100", name="chk_behavior_rating"),
        CheckConstraint("property_rating >= 0 AND property_rating <= 100", name="chk_property_rating"),
        CheckConstraint("stability_rating >= 0 AND stability_rating <= 100", name="chk_stability_rating"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("requests.id"), unique=True, nullable=False
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("owners.user_id"), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("tenants.user_id"), nullable=False)

    payment_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    behavior_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    property_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    stability_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    request = relationship("Request", back_populates="feedback")

