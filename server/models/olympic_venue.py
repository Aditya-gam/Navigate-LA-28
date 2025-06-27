from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from models.base import Base


class OlympicVenue(Base):
    """
    SQLAlchemy model representing LA 28 Olympic and Paralympic venues.

    This table stores information about official Olympic venues, including their 
    geographic coordinates, sport categories, and venue-specific details.

    Attributes:
        id (int): Primary key for the venue.
        name (str): Official name of the Olympic venue (required).
        venue_type (str): Type of venue (e.g., 'Stadium', 'Arena', 'Aquatics Center').
        sport_category (str): Primary sport categories hosted at this venue.
        latitude (float): Geographical latitude of the venue (required).
        longitude (float): Geographical longitude of the venue (required).
        address (str): Full address of the venue (required).
        capacity (int): Venue capacity if available.
        description (str): Detailed description of the venue.
        accessibility_features (str): Description of accessibility features.
        created_at (datetime): Timestamp when the record was created.
        updated_at (datetime): Timestamp when the record was last updated.
    """
    __tablename__ = "olympic_venues"

    # Primary key for the venues table
    id = Column(Integer, primary_key=True, index=True)

    # Venue identification and categorization
    name = Column(String, nullable=False, index=True)
    venue_type = Column(String, nullable=True)  # Stadium, Arena, etc.
    sport_category = Column(String, nullable=True)  # Swimming, Athletics, etc.

    # Geographic coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=False)

    # Venue details
    capacity = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    accessibility_features = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
