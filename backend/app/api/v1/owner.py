from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.enums import Role
from pydantic import BaseModel

router = APIRouter(prefix="/owner", tags=["owner"])

class OwnerProfileUpdate(BaseModel):
    phone: str | None = None

@router.patch("/profile")
def update_owner_profile(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    obj_in: OwnerProfileUpdate,
):
    if current_user.role != Role.OWNER:
        raise HTTPException(status_code=403, detail="Not an owner")
    
    if obj_in.phone is not None:
        current_user.phone_number = obj_in.phone
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"ok": True}
