import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.enums import Role, VerificationStatus
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.user import TenantProfileUpdate, UserProfileResponse, UserTenantData


router = APIRouter(prefix="/tenant", tags=["tenant"])


@router.patch("/profile")
def update_profile(
    body: TenantProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    tenant = db.get(Tenant, user.id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant profile missing")

    if body.date_of_birth is not None:
        user.date_of_birth = body.date_of_birth
    if body.address is not None:
        tenant.address = body.address

    db.add(user)
    db.add(tenant)
    db.commit()
    return {"message": "Profile updated successfully."}


@router.post("/verify", status_code=status.HTTP_202_ACCEPTED)
def upload_verification_id(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
    file: UploadFile = File(...),
    document_type: str = Form(...),
):
    tenant = db.get(Tenant, user.id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant profile missing")

    allowed = {"image/jpeg", "image/png", "application/pdf"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    uploads_dir = Path("uploads") / "kyc"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1].lower() or ".bin"
    fname = f"{user.id}_{uuid.uuid4().hex}{ext}"
    target = uploads_dir / fname
    content = file.file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large (max 5MB)")
    target.write_bytes(content)

    tenant.id_proof_url = str(target).replace("\\", "/")
    tenant.verification_status = VerificationStatus.PENDING
    db.add(tenant)
    db.commit()

    return {"message": "Document uploaded successfully. Verification pending.", "status": tenant.verification_status.value}


@router.post("/verify/mark-verified")
def mark_verified(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    """
    Local-MVP helper to unblock flows without an Admin module.
    """
    tenant = db.get(Tenant, user.id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant profile missing")
    tenant.verification_status = VerificationStatus.VERIFIED
    db.add(tenant)
    db.commit()
    return {"message": "Verification marked as VERIFIED."}


@router.get("/{tenant_id}/profile", response_model=UserProfileResponse)
def get_tenant_profile(
    tenant_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.OWNER)),
):
    try:
        tenant_uuid = uuid.UUID(tenant_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tenant_id")

    tenant_user = db.get(User, tenant_uuid)
    if not tenant_user or tenant_user.role != Role.TENANT:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    tenant_info = db.get(Tenant, tenant_uuid)
    tenant_data = None
    if tenant_info:
        tenant_data = UserTenantData(
            verification_status=tenant_info.verification_status.value,
            trust_score=tenant_info.trust_score,
        )

    return UserProfileResponse(
        id=str(tenant_user.id),
        email=tenant_user.email,
        full_name=tenant_user.full_name,
        phone_number=tenant_user.phone_number,
        role=tenant_user.role.value,
        tenant_data=tenant_data,
    )


@router.get("/current-pg")
def get_current_pg(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.TENANT)),
):
    from sqlalchemy import and_, select
    from app.models.request import Request
    from app.models.pg_listing import PGListing
    from app.models.enums import RequestStatus

    row = (
        db.execute(
            select(Request, PGListing)
            .join(PGListing, PGListing.id == Request.pg_id)
            .where(
                and_(
                    Request.tenant_id == user.id,
                    Request.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED]),
                )
            )
            .order_by(Request.decision_date.desc())
        )
        .first()
    )

    if not row:
        return {"pg": None}

    r, pg = row
    return {
        "pg": {
            "id": str(pg.id),
            "name": pg.name,
            "location": pg.location,
            "rent": pg.rent,
            "status": r.status.value,
        }
    }

