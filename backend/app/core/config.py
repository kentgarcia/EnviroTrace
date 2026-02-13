from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 600  # 10 hours
    ALGORITHM: str = "HS256"
    
    # Supabase Configuration (Required for Auth)
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_PUBLIC_KEY: str  # From Supabase Dashboard -> Settings -> API -> JWT Signing Keys (supports ES256 ECC P-256 or RS256)
    
    # Gemini API Configuration
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash-lite"
    
    # OCR Configuration
    OCR_PROVIDER: str = "gemini"  # "gemini" or "ocr_space"
    OCR_SPACE_API_KEY: Optional[str] = None
    
    # Super Admin Configuration
    # Comma-separated list of emails that should have super admin privileges
    SUPER_ADMIN_EMAILS: str = ""
    
    # For Alembic, if you want to reference the sync URL:
    # ALEMBIC_DATABASE_URL: Optional[str] = None
      # CORS settings
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "https://localhost:8080",
        "tauri://localhost",
        "http://tauri.localhost",
        "https://tauri.localhost",
    ]

    # Audit logging
    # If enabled, every request is recorded (see AuditLoggingMiddleware).
    # Disable for local dev/perf triage by setting AUDIT_LOGGING_ENABLED=false.
    AUDIT_LOGGING_ENABLED: bool = True
    # If true, audit logging will query the DB to resolve session + user email.
    # This adds 2+ extra DB round-trips per request; keep false for performance.
    AUDIT_RESOLVE_USER_DETAILS: bool = False

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    def get_super_admin_emails(self) -> List[str]:
        """Parse SUPER_ADMIN_EMAILS and return as list"""
        if not self.SUPER_ADMIN_EMAILS:
            return []
        return [email.strip().lower() for email in self.SUPER_ADMIN_EMAILS.split(",") if email.strip()]

    def get_cors_origins(self) -> List[str]:
        """Normalize CORS origins from env (comma-separated string or list)."""
        value = self.BACKEND_CORS_ORIGINS
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return list(value)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()