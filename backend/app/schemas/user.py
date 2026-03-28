from datetime import date

from pydantic import BaseModel, EmailStr, Field


class SetRoleRequest(BaseModel):
    role: str = Field(pattern="^(TENANT|OWNER)$")


class UserTenantData(BaseModel):
    verification_status: str
    trust_score: int


class UserProfileResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    phone_number: str | None = None
    tenant_data: UserTenantData | None = None


class TenantProfileUpdate(BaseModel):
    date_of_birth: date | None = None
    address: str | None = None

