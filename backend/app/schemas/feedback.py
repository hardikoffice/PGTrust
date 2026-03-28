from pydantic import BaseModel, Field


class FeedbackSubmitBody(BaseModel):
    request_id: str
    payment_rating: int = Field(ge=0, le=100)
    behavior_rating: int = Field(ge=0, le=100)
    property_rating: int = Field(ge=0, le=100)
    stability_rating: int = Field(ge=0, le=100)
    comments: str | None = None


class FeedbackSubmitResponse(BaseModel):
    message: str
    new_trust_score: int

