import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
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

