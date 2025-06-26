#!/usr/bin/env python3
"""
Database initialization script for Navigate LA 2028
"""

from models.base import Base
from config.database import engine
import asyncio
import sys
import os

# Add the server directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def create_tables():
    """
    Create database tables.
    """
    print("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
