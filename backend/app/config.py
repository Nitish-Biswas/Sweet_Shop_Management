"""
Configuration module for Sweet Shop Management System.
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    """
    Application settings.
    NO DEFAULTS provided for critical fields. 
    If .env is not loaded, the app will fail to start.
    """
    
    # --- REQUIRED FIELDS (Must match .env exactly) ---
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    admin_email: str
    debug: bool
    
    # --- OPTIONAL / DEFAULTS (These were not in your .env snippet) ---
    # It is safe to keep defaults for these, or add them to .env if you prefer
    app_name: str = "Sweet Shop Management System"
    app_version: str = "1.0.0"
    allowed_origins: List[str]
    
    # Configure path to find .env in 'backend/' folder
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()