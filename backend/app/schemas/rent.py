from datetime import datetime
from pydantic import BaseModel, Field
from app.models.enums import RentPaymentStatus

class RentStatusResponse(BaseModel):
    month: int
    year: int
    due_day: int | None
    status: RentPaymentStatus
    tenant_paid_at: datetime | None = None
    owner_verified_at: datetime | None = None

class RentPaymentItem(BaseModel):
    id: str
    tenant_name: str
    month: int
    year: int
    status: RentPaymentStatus
    tenant_paid_at: datetime | None

class RentPaymentListResponse(BaseModel):
    payments: list[RentPaymentItem]
