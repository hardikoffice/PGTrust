import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.enums import RequestStatus, Role
from app.models.feedback import Feedback
from app.models.pg_listing import PGListing
from app.models.request import Request
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.feedback import FeedbackSubmitBody, FeedbackSubmitResponse
from app.services.trust_engine import compute_trust_score_from_history


router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/submit", response_model=FeedbackSubmitResponse)
def submit_feedback(
    body: FeedbackSubmitBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    try:
        req_id = uuid.UUID(body.request_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request_id")

    req = db.get(Request, req_id)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    pg = db.get(PGListing, req.pg_id)
    if not pg or pg.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if req.status != RequestStatus.COMPLETED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request must be COMPLETED to submit feedback")

    existing = db.query(Feedback).filter(Feedback.request_id == req.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Feedback already submitted")

    fb = Feedback(
        request_id=req.id,
        owner_id=user.id,
        tenant_id=req.tenant_id,
        payment_rating=body.payment_rating,
        behavior_rating=body.behavior_rating,
        property_rating=body.property_rating,
        stability_rating=body.stability_rating,
        comments=body.comments,
    )
    db.add(fb)
    db.commit()

    tenant = db.get(Tenant, req.tenant_id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant profile missing")

    new_score = compute_trust_score_from_history(db, tenant_id=tenant.user_id)
    tenant.trust_score = new_score
    db.add(tenant)
    db.commit()

    return FeedbackSubmitResponse(message="Feedback submitted successfully. Trust Score updated.", new_trust_score=new_score)

