from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyUrl
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Application ──────────────────────────────────────────────
    app_name: str = "SmartPost"
    app_env: str = "development"
    debug: bool = True
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # ── Database ─────────────────────────────────────────────────
    database_url: str

    # ── Email ────────────────────────────────────────────────────
    mail_username: str
    mail_password: str
    mail_from: str
    mail_from_name: str = "SmartPost - IAA College"
    mail_server: str
    mail_port: int = 587
    mail_starttls: bool = True
    mail_ssl_tls: bool = False

    # ── File Storage ─────────────────────────────────────────────
    upload_dir: str = "uploads"
    max_file_size_mb: int = 5
    allowed_extensions: str = "pdf,jpg,png"

    # ── CORS ─────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://localhost:3001"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def allowed_extensions_list(self) -> List[str]:
        return [e.strip().lower() for e in self.allowed_extensions.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


settings = Settings()
