from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.enums import Role, VerificationStatus
from app.models.owner import Owner
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.user import SetRoleRequest, UserProfileResponse, UserTenantData


router = APIRouter(prefix="/user", tags=["user"])


@router.post("/set-role")
def set_role(
    body: SetRoleRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != Role.UNASSIGNED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role already set")

    new_role = Role(body.role)
    user.role = new_role
    db.add(user)

    if new_role == Role.TENANT:
        db.add(Tenant(user_id=user.id, verification_status=VerificationStatus.UNVERIFIED, trust_score=500))
    else:
        db.add(Owner(user_id=user.id))

    db.commit()
    return {"message": "Role updated successfully.", "role": user.role.value}


@router.get("/profile", response_model=UserProfileResponse)
def profile(user: User = Depends(get_current_user)):
    tenant_data = None
    if user.role == Role.TENANT and user.tenant:
        tenant_data = UserTenantData(
            verification_status=user.tenant.verification_status.value,
            trust_score=user.tenant.trust_score,
        )

    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        role=user.role.value,
        tenant_data=tenant_data,
    )

