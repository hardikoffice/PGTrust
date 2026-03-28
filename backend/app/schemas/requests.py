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


class MoveOutFeedbackBody(BaseModel):
    payment_rating: int = Field(ge=0, le=100)
    behavior_rating: int = Field(ge=0, le=100)
    property_rating: int = Field(ge=0, le=100)
    stability_rating: int = Field(ge=0, le=100)
    comments: str | None = Field(default=None, max_length=2000)


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
    is_moving_out: bool = False
    move_in_image: str | None = None
    move_out_image: str | None = None
    move_in_image_verified: bool = False
    move_out_image_verified: bool = False


class RequestListResponse(BaseModel):
    data: list[RequestListItem]

