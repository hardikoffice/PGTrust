from datetime import date

from pydantic import BaseModel, Field


class CreateRequestBody(BaseModel):
    pg_id: str
    move_in_date: date


class CreateRequestResponse(BaseModel):
    message: str
    request_id: str
    status: str


class UpdateRequestStatusBody(BaseModel):
    status: str = Field(pattern="^(ACCEPTED|REJECTED|COMPLETED)$")


class SimpleMessageResponse(BaseModel):
    message: str


class RequestListItem(BaseModel):
    id: str
    pg_id: str
    pg_name: str
    tenant_id: str | None = None
    tenant_name: str | None = None
    tenant_trust_score: int | None = None
    status: str
    move_in_date: date


class RequestListResponse(BaseModel):
    data: list[RequestListItem]

