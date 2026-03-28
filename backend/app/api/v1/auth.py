from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import Role, VerificationStatus
from app.models.owner import Owner
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, SignupRequest, SignupResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    exists = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        phone_number=body.phone_number,
        role=Role(body.role),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user.role == Role.TENANT:
        db.add(Tenant(user_id=user.id, verification_status=VerificationStatus.UNVERIFIED, trust_score=500))
    elif user.role == Role.OWNER:
        db.add(Owner(user_id=user.id))
    db.commit()
    db.refresh(user)
    
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return SignupResponse(
        message="User registered successfully.", 
        user_id=str(user.id),
        access_token=token,
        role=user.role.value
    )


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=str(user.id), role=user.role.value)
    return LoginResponse(access_token=token, role=user.role.value)

