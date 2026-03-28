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
from app.schemas.user import TenantProfileUpdate


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
        tenant.date_of_birth = body.date_of_birth
    if body.address is not None:
        tenant.address = body.address

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

