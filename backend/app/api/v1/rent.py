from datetime import datetime, date
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.enums import Role, RequestStatus, RentPaymentStatus
from app.models.request import Request
from app.models.rent_payment import RentPayment
from app.models.tenant import Tenant
from app.models.user import User
from app.models.pg_listing import PGListing
from app.schemas.rent import (
    RentStatusResponse, 
    RentPaymentListResponse, 
    RentPaymentItem
)

router = APIRouter(prefix="/rent", tags=["rent"])

@router.get("/status", response_model=RentStatusResponse)
def get_rent_status(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    # Find active request and its PG
    row = db.execute(
        select(Request, PGListing)
        .join(PGListing, PGListing.id == Request.pg_id)
        .where(
            and_(
                Request.tenant_id == user.id,
                Request.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED])
            )
        )
        .order_by(Request.decision_date.desc())
    ).first()

    if not row:
        raise HTTPException(status_code=404, detail="No active PG stay found")

    req, pg = row
    now = datetime.now()
    month = now.month
    year = now.year

    # Find or create rent payment for current month
    payment = db.execute(
        select(RentPayment).where(
            and_(
                RentPayment.request_id == req.id,
                RentPayment.month == month,
                RentPayment.year == year
            )
        )
    ).scalar_one_or_none()

    if not payment:
        payment = RentPayment(
            request_id=req.id,
            month=month,
            year=year,
            status=RentPaymentStatus.PENDING
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

    # Automatic overdue check
    if payment.status == RentPaymentStatus.PENDING and pg.rent_due_day:
        if now.day > pg.rent_due_day:
            payment.status = RentPaymentStatus.OVERDUE
            # Penalty
            tenant_info = db.get(Tenant, user.id)
            if tenant_info:
                tenant_info.trust_score = max(0, tenant_info.trust_score - 20)
                db.add(tenant_info)
            db.add(payment)
            db.commit()

    return RentStatusResponse(
        month=payment.month,
        year=payment.year,
        due_day=int(pg.rent_due_day) if pg.rent_due_day else None,
        status=payment.status,
        tenant_paid_at=payment.tenant_paid_at,
        owner_verified_at=payment.owner_verified_at
    )

@router.post("/pay")
def pay_rent(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    req = db.execute(
        select(Request).where(
            and_(
                Request.tenant_id == user.id,
                Request.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED])
            )
        ).order_by(Request.decision_date.desc())
    ).scalar_one_or_none()

    if not req:
        raise HTTPException(status_code=404, detail="No active PG stay found")

    now = datetime.now()
    payment = db.execute(
        select(RentPayment).where(
            and_(
                RentPayment.request_id == req.id,
                RentPayment.month == now.month,
                RentPayment.year == now.year
            )
        )
    ).scalar_one_or_none()

    if not payment:
        payment = RentPayment(request_id=req.id, month=now.month, year=now.year)
    
    if payment.status in [RentPaymentStatus.PAID, RentPaymentStatus.VERIFIED]:
        return {"message": "Rent already marked as paid"}

    payment.status = RentPaymentStatus.PAID
    payment.tenant_paid_at = now
    db.add(payment)
    db.commit()
    return {"message": "Rent marked as paid. Waiting for owner verification."}

@router.get("/owner/pending-verifications", response_model=RentPaymentListResponse)
def get_pending_verifications(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    # Find all payments for owner's PGs that are PAID but not VERIFIED
    rows = db.execute(
        select(RentPayment, User.full_name)
        .join(Request, Request.id == RentPayment.request_id)
        .join(PGListing, PGListing.id == Request.pg_id)
        .join(User, User.id == Request.tenant_id)
        .where(
            and_(
                PGListing.owner_id == user.id,
                RentPayment.status == RentPaymentStatus.PAID
            )
        )
    ).all()

    return RentPaymentListResponse(
        payments=[
            RentPaymentItem(
                id=str(p.id),
                tenant_name=full_name,
                month=p.month,
                year=p.year,
                status=p.status,
                tenant_paid_at=p.tenant_paid_at
            ) for p, full_name in rows
        ]
    )

@router.post("/owner/verify/{payment_id}")
def verify_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    try:
        pid = uuid.UUID(payment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid payment ID")

    # Ensure payment belongs to owner
    row = db.execute(
        select(RentPayment, Request.tenant_id)
        .join(Request, Request.id == RentPayment.request_id)
        .join(PGListing, PGListing.id == Request.pg_id)
        .where(
            and_(
                RentPayment.id == pid,
                PGListing.owner_id == user.id
            )
        )
    ).first()

    if not row:
        raise HTTPException(status_code=404, detail="Payment not found or not authorized")

    payment, tenant_id = row
    if payment.status == RentPaymentStatus.VERIFIED:
        return {"message": "Already verified"}

    payment.status = RentPaymentStatus.VERIFIED
    payment.owner_verified_at = datetime.now()

    # Reward tenant
    tenant_info = db.get(Tenant, tenant_id)
    if tenant_info:
        tenant_info.trust_score = min(1000, tenant_info.trust_score + 10)
        db.add(tenant_info)

    db.add(payment)
    db.commit()
    return {"message": "Payment verified. Tenant trust score increased."}
