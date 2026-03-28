import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import RentPaymentStatus


class RentPayment(Base):
    __tablename__ = "rent_payments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("requests.id"), index=True, nullable=False)
    
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[RentPaymentStatus] = mapped_column(Enum(RentPaymentStatus), nullable=False, default=RentPaymentStatus.PENDING)
    
    tenant_paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    owner_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    request = relationship("Request")
