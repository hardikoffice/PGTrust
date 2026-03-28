from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


import os
from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(_BASE_DIR, ".env"),
        extra="ignore"
    )

    environment: str = Field(default="development", alias="ENVIRONMENT")
    port: int = Field(default=8000, alias="PORT")

    database_url: str = Field(
        default="sqlite:///./pgtrust.db", alias="DATABASE_URL"
    )

    secret_key: str = Field(default="dev_secret_change_me", alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    
    # ImgBB Settings
    imgbb_api_key: str | None = Field(default=None, alias="IMGBB_API_KEY")

    # Gemini AI Settings
    gemini_api_key: str | None = Field(default=None, alias="GEMINI_API_KEY")


settings = Settings()

