import base64
import json
import uuid
from datetime import datetime, timezone

import google.generativeai as genai
import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.config import settings
from app.core.database import get_db
from app.models.damage_report import DamageReport
from app.models.enums import RequestStatus, Role, VerificationStatus
from app.models.pg_listing import PGListing
from app.models.request import Request
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.requests import (
    CreateRequestBody,
    CreateRequestResponse,
    RequestListItem,
    RequestListResponse,
    SimpleMessageResponse,
    UpdateRequestStatusBody,
    MoveOutFeedbackBody,
)


router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("/create", response_model=CreateRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    body: CreateRequestBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    tenant = db.get(Tenant, user.id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant profile missing")
    if tenant.verification_status != VerificationStatus.VERIFIED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant must be verified to request a PG")

    try:
        pg_uuid = uuid.UUID(body.pg_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid pg_id")

    pg = db.get(PGListing, pg_uuid)
    if not pg or not pg.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PG not found")

    req = Request(tenant_id=user.id, pg_id=pg_uuid, status=RequestStatus.PENDING, move_in_date=body.move_in_date)
    db.add(req)
    db.commit()
    db.refresh(req)
    return CreateRequestResponse(message="Request sent successfully.", request_id=str(req.id), status=req.status.value)


@router.get("/my", response_model=RequestListResponse)
def my_requests(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    rows = (
        db.execute(
            select(Request, PGListing)
            .join(PGListing, PGListing.id == Request.pg_id)
            .where(Request.tenant_id == user.id)
            .order_by(Request.request_date.desc())
        )
        .all()
    )

    items: list[RequestListItem] = []
    for r, pg in rows:
        items.append(
            RequestListItem(
                id=str(r.id),
                pg_id=str(pg.id),
                pg_name=pg.name,
                status=r.status.value,
                move_in_date=r.move_in_date,
                is_moving_out=r.is_moving_out,
                move_in_image=r.move_in_image,
                move_out_image=r.move_out_image,
                move_in_image_verified=r.move_in_image_verified,
                move_out_image_verified=r.move_out_image_verified,
            )
        )
    return RequestListResponse(data=items)


@router.get("/incoming", response_model=RequestListResponse)
def incoming_requests(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    rows = (
        db.execute(
            select(Request, PGListing, User, Tenant)
            .join(PGListing, PGListing.id == Request.pg_id)
            .join(User, User.id == Request.tenant_id)
            .join(Tenant, Tenant.user_id == Request.tenant_id)
            .where(PGListing.owner_id == user.id)
            .order_by(Request.request_date.desc())
        )
        .all()
    )

    items: list[RequestListItem] = []
    for r, pg, u, t in rows:
        items.append(
            RequestListItem(
                id=str(r.id),
                pg_id=str(pg.id),
                pg_name=pg.name,
                tenant_id=str(u.id),
                tenant_name=u.full_name,
                tenant_trust_score=t.trust_score,
                status=r.status.value,
                move_in_date=r.move_in_date,
                is_moving_out=r.is_moving_out,
                move_in_image=r.move_in_image,
                move_out_image=r.move_out_image,
                move_in_image_verified=r.move_in_image_verified,
                move_out_image_verified=r.move_out_image_verified,
            )
        )
    return RequestListResponse(data=items)


@router.patch("/{request_id}/status", response_model=SimpleMessageResponse)
def update_status(
    request_id: str,
    body: UpdateRequestStatusBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    try:
        req_uuid = uuid.UUID(request_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request id")

    req = db.get(Request, req_uuid)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    pg = db.get(PGListing, req.pg_id)
    if not pg or pg.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    new_status = RequestStatus(body.status)
    if new_status in (RequestStatus.ACCEPTED, RequestStatus.REJECTED) and req.status != RequestStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be accepted/rejected")
    if new_status == RequestStatus.COMPLETED and req.status != RequestStatus.ACCEPTED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only accepted requests can be completed")

    req.status = new_status
    req.decision_date = datetime.now(timezone.utc)
    db.add(req)
    db.commit()
    return SimpleMessageResponse(message="Request status updated successfully.")


@router.post("/{request_id}/move-out", response_model=SimpleMessageResponse)
def request_move_out(
    request_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    try:
        req_uuid = uuid.UUID(request_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request id")

    req = db.get(Request, req_uuid)
    if not req or req.tenant_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if req.status != RequestStatus.ACCEPTED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only move out of an accepted, active stay")

    if req.is_moving_out:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Move-out already requested")

    req.is_moving_out = True
    db.add(req)
    db.commit()
    return SimpleMessageResponse(message="Move-out request sent to owner.")


@router.get("/owner/move-outs", response_model=RequestListResponse)
def incoming_move_outs(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    rows = (
        db.execute(
            select(Request, PGListing, User, Tenant)
            .join(PGListing, PGListing.id == Request.pg_id)
            .join(User, User.id == Request.tenant_id)
            .join(Tenant, Tenant.user_id == Request.tenant_id)
            .where(
                and_(
                    PGListing.owner_id == user.id,
                    Request.status == RequestStatus.ACCEPTED,
                    Request.is_moving_out == True
                )
            )
            .order_by(Request.request_date.desc())
        )
        .all()
    )

    items: list[RequestListItem] = []
    for r, pg, u, t in rows:
        items.append(
            RequestListItem(
                id=str(r.id),
                pg_id=str(pg.id),
                pg_name=pg.name,
                tenant_id=str(u.id),
                tenant_name=u.full_name,
                tenant_trust_score=t.trust_score,
                status=r.status.value,
                move_in_date=r.move_in_date,
                is_moving_out=r.is_moving_out,
                move_in_image=r.move_in_image,
                move_out_image=r.move_out_image,
                move_in_image_verified=r.move_in_image_verified,
                move_out_image_verified=r.move_out_image_verified,
            )
        )
    return RequestListResponse(data=items)


@router.post("/{request_id}/complete-move-out", response_model=SimpleMessageResponse)
def complete_move_out(
    request_id: str,
    body: MoveOutFeedbackBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    from app.models.feedback import Feedback

    try:
        req_uuid = uuid.UUID(request_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request id")

    req = db.get(Request, req_uuid)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    pg = db.get(PGListing, req.pg_id)
    if not pg or pg.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if req.status != RequestStatus.ACCEPTED or not req.is_moving_out:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request is not pending a move-out")

    # Mark request as completed
    req.status = RequestStatus.COMPLETED
    req.is_moving_out = False
    req.move_out_date = datetime.now(timezone.utc).date()
    db.add(req)

    # Create Feedback
    feedback = Feedback(
        request_id=req.id,
        owner_id=user.id,
        tenant_id=req.tenant_id,
        payment_rating=body.payment_rating,
        behavior_rating=body.behavior_rating,
        property_rating=body.property_rating,
        stability_rating=body.stability_rating,
        comments=body.comments,
    )
    db.add(feedback)

    # Adjust Trust Score
    tenant = db.get(Tenant, req.tenant_id)
    if tenant:
        # Weighted criteria
        # Payment: 40%, Property: 30%, Behavior: 20%, Stability: 10%
        weighted_score = (
            body.payment_rating * 0.40 +
            body.property_rating * 0.30 +
            body.behavior_rating * 0.20 +
            body.stability_rating * 0.10
        )
        
        points = 0
        if weighted_score >= 95:
            points = 40
        elif weighted_score >= 90:
            points = 30
        elif weighted_score >= 80:
            points = 20
        elif weighted_score >= 70:
            points = 10
        elif weighted_score >= 60:
            points = 5
        elif weighted_score >= 50:
            points = 0
        elif weighted_score >= 40:
            points = -10
        elif weighted_score >= 30:
            points = -20
        elif weighted_score >= 20:
            points = -30
        else:
            points = -50
            
        tenant.trust_score = max(0, tenant.trust_score + points)
        db.add(tenant)

    db.commit()
    return SimpleMessageResponse(message="Move-out completed and feedback saved. Request is now COMPLETED.")


async def _upload_to_imgbb(file_bytes: bytes) -> str:
    """Upload image bytes to ImgBB and return the URL."""
    if not settings.imgbb_api_key:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="ImgBB API key not configured")
    b64 = base64.b64encode(file_bytes).decode("utf-8")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.imgbb.com/1/upload",
            data={"key": settings.imgbb_api_key, "image": b64},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Image upload failed")
        return resp.json()["data"]["url"]


@router.post("/{request_id}/upload-move-in-image", response_model=SimpleMessageResponse)
async def upload_move_in_image(
    request_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    """Tenant uploads a move-in property photo."""
    try:
        req_uuid = uuid.UUID(request_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request id")

    req = db.get(Request, req_uuid)
    if not req or req.tenant_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.status != RequestStatus.ACCEPTED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only upload for accepted stays")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image too large (max 10MB)")

    url = await _upload_to_imgbb(file_bytes)
    req.move_in_image = url
    req.move_in_image_verified = False
    db.add(req)
    db.commit()
    return SimpleMessageResponse(message="Move-in image uploaded successfully.")


@router.post("/{request_id}/upload-move-out-image", response_model=SimpleMessageResponse)
async def upload_move_out_image(
    request_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    """Tenant uploads a move-out property photo."""
    try:
        req_uuid = uuid.UUID(request_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request id")

    req = db.get(Request, req_uuid)
    if not req or req.tenant_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.status != RequestStatus.ACCEPTED or not req.is_moving_out:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only upload during an active move-out")

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image too large (max 10MB)")

    url = await _upload_to_imgbb(file_bytes)
    req.move_out_image = url
    req.move_out_image_verified = False
    db.add(req)
    db.commit()
    return SimpleMessageResponse(message="Move-out image uploaded successfully.")


_DAMAGE_PROMPT = (
    "You are an expert property inspector. "
    "Image 1 is the Move-In condition. Image 2 is the Move-Out condition. "
    "Compare them and identify new damages, ignoring normal wear and tear. "
    "Provide a score from 0 to 100 (100 = perfect condition). "
    'Respond strictly in JSON format with keys: "score" (number), '
    '"damages" (array of strings), and "reasoning" (string).'
)


@router.post("/{request_id}/verify-image", response_model=SimpleMessageResponse)
def verify_image(
    request_id: str,
    image_type: str = Form(...),  # "move_in" or "move_out"
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    """Owner verifies a move-in or move-out image. Auto-runs damage assessment when both verified."""
    if image_type not in ("move_in", "move_out"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="image_type must be 'move_in' or 'move_out'")

    try:
        req_uuid = uuid.UUID(request_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request id")

    req = db.get(Request, req_uuid)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    pg = db.get(PGListing, req.pg_id)
    if not pg or pg.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if image_type == "move_in":
        if not req.move_in_image:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No move-in image uploaded")
        req.move_in_image_verified = True
    else:
        if not req.move_out_image:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No move-out image uploaded")
        req.move_out_image_verified = True

    db.add(req)
    db.commit()
    db.refresh(req)

    # Auto-trigger AI damage assessment when BOTH images verified
    if req.move_in_image_verified and req.move_out_image_verified and settings.gemini_api_key:
        try:
            _run_damage_assessment(req, user, db)
        except Exception as e:
            # Don't fail the verify — just log
            print(f"Auto damage assessment failed: {e}")
            return SimpleMessageResponse(message=f"Image verified. AI assessment failed: {str(e)}")
        return SimpleMessageResponse(message="Image verified. AI damage assessment completed automatically!")

    return SimpleMessageResponse(message="Image verified successfully.")


def _run_damage_assessment(req: Request, owner: User, db: Session) -> None:
    """Run Gemini AI damage assessment on the two verified images."""
    import requests as http_requests

    # Download images
    move_in_resp = http_requests.get(req.move_in_image, timeout=15)
    move_out_resp = http_requests.get(req.move_out_image, timeout=15)

    if move_in_resp.status_code != 200 or move_out_resp.status_code != 200:
        raise Exception("Failed to download images")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        generation_config=genai.GenerationConfig(response_mime_type="application/json"),
    )

    response = model.generate_content([
        _DAMAGE_PROMPT,
        {"mime_type": "image/jpeg", "data": move_in_resp.content},
        {"mime_type": "image/jpeg", "data": move_out_resp.content},
    ])

    result = json.loads(response.text)
    score = int(result.get("score", 0))
    damages = result.get("damages", [])
    reasoning = result.get("reasoning", "")

    # Calculate points
    if score >= 90:
        points = 15
    elif score >= 70:
        points = 5
    elif score >= 50:
        points = 0
    elif score >= 30:
        points = -10
    else:
        points = -25

    # Update trust score
    tenant = db.get(Tenant, req.tenant_id)
    if tenant:
        tenant.trust_score = max(0, tenant.trust_score + points)
        db.add(tenant)

    # Save report
    report = DamageReport(
        tenant_id=req.tenant_id,
        owner_id=owner.id,
        score=score,
        damages=damages,
        reasoning=reasoning,
        points_applied=points,
    )
    db.add(report)
    db.commit()

