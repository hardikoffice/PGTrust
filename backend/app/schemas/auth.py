from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=100)
    phone_number: str | None = Field(default=None, max_length=20)
    role: str


class SignupResponse(BaseModel):
    message: str
    user_id: str
    access_token: str
    token_type: str = "bearer"
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

