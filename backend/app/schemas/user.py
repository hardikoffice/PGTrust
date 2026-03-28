from datetime import date
from pydantic import BaseModel, ConfigDict, Field

class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=100)
    phone_number: str | None = Field(None, max_length=20)
    date_of_birth: date | None = None
    gender: str | None = None
    marital_status: str | None = None
    income_range: str | None = None

class TenantProfileUpdate(BaseModel):
    date_of_birth: date | None = None
    address: str | None = None

class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    phone_number: str | None
    date_of_birth: date | None
    gender: str | None
    marital_status: str | None
    income_range: str | None
    role: str

class SetRoleRequest(BaseModel):
    role: str

class UserTenantData(BaseModel):
    verification_status: str
    trust_score: int

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone_number: str | None
    role: str
    tenant_data: UserTenantData | None = None
