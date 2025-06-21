# server/tests/conftest.py

import pytest  # For defining and managing test fixtures
# For asynchronous database connections and sessions
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker  # For creating database sessions
from fastapi.testclient import TestClient  # For testing FastAPI applications
import os  # For environment variable access
from dotenv import load_dotenv  # For loading environment variables from a .env file
from yarl import URL as MultiHostUrl  # Utility for building database URLs

from main import app  # The main FastAPI application instance
from models.base import Base  # Base model for SQLAlchemy
from config.database import get_db  # Dependency to get the database session

# Load environment variables from a .env file
load_dotenv()

# Database configuration for tests


class TestDatabaseConfig:
    POSTGRES_USER = os.getenv("POSTGRES_USER", "la28_user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "bigdata_la28")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "navigate_la_postgres")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_TEST_DB = os.getenv("POSTGRES_TEST_DB", "navigate_la28_test_db")

    @property
    def test_database_url(self) -> str:
        """
        Constructs the PostgreSQL test database URL using environment variables.
        """
        return str(
            MultiHostUrl.build(
                scheme="postgresql+asyncpg",
                user=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_HOST,
                port=int(self.POSTGRES_PORT),
                path=f"/{self.POSTGRES_TEST_DB}",
            )
        )

# Define an asynchronous fixture for the test database


@pytest.fixture(scope="session")
async def async_engine():
    """
    Fixture for creating an asynchronous SQLAlchemy engine.

    This fixture sets up a test database, creates all tables, and ensures
    that the database is cleaned up after the tests are completed.

    Yields:
        AsyncEngine: The asynchronous engine for the test database.
    """
    # Create test database configuration and engine
    test_db_config = TestDatabaseConfig()
    engine = create_async_engine(
        test_db_config.test_database_url,
        echo=True,  # Enable SQLAlchemy query logging
    )
    async with engine.begin() as conn:
        # Create all tables asynchronously for the test database
        await conn.run_sync(Base.metadata.create_all)

    # Provide the engine to the tests
    yield engine

    async with engine.begin() as conn:
        # Drop all tables asynchronously after tests are completed
        await conn.run_sync(Base.metadata.drop_all)

    # Dispose of the engine to release resources
    await engine.dispose()


@pytest.fixture(scope="session")
async def async_db(async_engine):
    """
    Fixture for creating a new asynchronous database session for testing.

    Args:
        async_engine (AsyncEngine): The asynchronous engine fixture.

    Yields:
        AsyncSession: A session object for interacting with the test database.
    """
    # Create an asynchronous session factory
    async_session = sessionmaker(
        bind=async_engine,  # Use the test engine
        class_=AsyncSession,  # Define the session class as asynchronous
        expire_on_commit=False  # Prevent session objects from expiring after commit
    )
    # Provide the session to the tests
    async with async_session() as session:
        yield session


@pytest.fixture
def client(async_db):
    """
    Fixture for creating a FastAPI test client with an overridden database dependency.

    This fixture overrides the `get_db` dependency in the FastAPI app to use the
    asynchronous test database session, enabling isolated testing.

    Args:
        async_db (AsyncSession): The asynchronous database session fixture.

    Yields:
        TestClient: A test client for making HTTP requests to the FastAPI app.
    """
    # Override the `get_db` dependency to use the test database session
    def override_get_db():
        try:
            yield async_db
        finally:
            # Session cleanup is handled by the async_db fixture
            # No explicit cleanup needed here
            pass

    app.dependency_overrides[get_db] = override_get_db

    # Use FastAPI TestClient for synchronous testing of the FastAPI app
    with TestClient(app) as test_client:
        yield test_client
