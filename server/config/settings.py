"""
Application settings and configuration management.
"""
import os
from typing import Optional, List
from pydantic import BaseSettings, field_validator, Field

# URL constants
LOCALHOST_3000 = "http://localhost:3000"
LOCALHOST_3030 = "http://localhost:3030"


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application settings
    app_name: str = "Navigate LA 2028 API"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, description="Enable debug mode")

    # Database settings
    database_url: str = Field(
        default="postgresql+asyncpg://user:password@localhost/dbname",
        description="Database connection URL"
    )

    # Security settings
    secret_key: str = Field(
        default="defaultsecretkey",
        description="Secret key for JWT tokens"
    )
    access_token_expire_minutes: int = Field(
        default=30,
        description="JWT access token expiration time in minutes"
    )

    # CORS settings
    allowed_origins: List[str] = Field(
        default=[LOCALHOST_3030, LOCALHOST_3000],
        description="Allowed CORS origins"
    )

    # API settings
    api_prefix: str = Field(default="/api", description="API route prefix")
    docs_url: str = Field(default="/docs", description="Swagger docs URL")
    redoc_url: str = Field(default="/redoc", description="ReDoc URL")

    # External services
    google_maps_api_key: Optional[str] = Field(
        default=None,
        description="Google Maps API key"
    )

    # Analytics settings
    analytics_enabled: bool = Field(
        default=True,
        description="Enable analytics features"
    )
    analytics_cache_ttl: int = Field(
        default=3600,
        description="Analytics cache TTL in seconds"
    )

    # Search settings
    default_search_radius: int = Field(
        default=1000,
        description="Default search radius in meters"
    )
    max_search_radius: int = Field(
        default=10000,
        description="Maximum search radius in meters"
    )

    # Rate limiting
    rate_limit_enabled: bool = Field(
        default=True,
        description="Enable rate limiting"
    )
    rate_limit_requests: int = Field(
        default=100,
        description="Number of requests per minute"
    )

    @field_validator('allowed_origins', mode='before')
    @classmethod
    def validate_origins(cls, v):
        """Validate and process allowed origins."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

    @field_validator('debug', mode='before')
    @classmethod
    def validate_debug(cls, v):
        """Validate debug setting."""
        if isinstance(v, str):
            return v.lower() in ('true', '1', 'yes', 'on')
        return bool(v)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings."""
    return settings


# Environment-specific configurations
class DevelopmentSettings(Settings):
    """Development environment settings."""
    debug: bool = True
    allowed_origins: List[str] = [LOCALHOST_3030, LOCALHOST_3000]


class ProductionSettings(Settings):
    """Production environment settings."""
    debug: bool = False
    allowed_origins: List[str] = Field(
        default_factory=list,
        description="Production allowed origins"
    )


class TestSettings(Settings):
    """Test environment settings."""
    debug: bool = True
    database_url: str = Field(
        default="sqlite:///./test.db",
        description="Test database connection URL (set TEST_DATABASE_URL env var for PostgreSQL)"
    )
    allowed_origins: List[str] = [LOCALHOST_3000]


def get_environment_settings() -> Settings:
    """Get environment-specific settings."""
    environment = os.getenv("ENVIRONMENT", "development").lower()

    if environment == "production":
        return ProductionSettings()
    elif environment == "test":
        return TestSettings()
    else:
        return DevelopmentSettings()
