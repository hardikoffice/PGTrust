import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import RequestStatus


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("tenants.user_id"), nullable=False)
    pg_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("pg_listings.id"), nullable=False)

    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), nullable=False, default=RequestStatus.PENDING)
    request_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    decision_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    move_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    move_out_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_moving_out: Mapped[bool] = mapped_column(default=False)

    tenant = relationship("Tenant", back_populates="requests")
    pg = relationship("PGListing", back_populates="requests")
    feedback = relationship("Feedback", back_populates="request", uselist=False)
