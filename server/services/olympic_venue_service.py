# server/services/olympic_venue_service.py

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
import math

from models.olympic_venue import OlympicVenue


class OlympicVenueService:
    """Service class for handling Olympic venue operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all_venues(self) -> List[OlympicVenue]:
        """Get all Olympic venues."""
        return self.db.query(OlympicVenue).all()

    def get_venue_by_id(self, venue_id: int) -> Optional[OlympicVenue]:
        """Get a specific Olympic venue by ID."""
        return self.db.query(OlympicVenue).filter(OlympicVenue.id == venue_id).first()

    def get_venues_by_sport(self, sport_category: str) -> List[OlympicVenue]:
        """Get venues by sport category."""
        return self.db.query(OlympicVenue).filter(
            OlympicVenue.sport_category.ilike(f"%{sport_category}%")
        ).all()

    def get_venues_by_type(self, venue_type: str) -> List[OlympicVenue]:
        """Get venues by venue type."""
        return self.db.query(OlympicVenue).filter(
            OlympicVenue.venue_type.ilike(f"%{venue_type}%")
        ).all()

    def search_venues(self, query: str) -> List[OlympicVenue]:
        """Search venues by name, sport category, or venue type."""
        search_term = f"%{query}%"
        return self.db.query(OlympicVenue).filter(
            and_(
                OlympicVenue.name.ilike(search_term) |
                OlympicVenue.sport_category.ilike(search_term) |
                OlympicVenue.venue_type.ilike(search_term)
            )
        ).all()

    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on earth.
        Returns distance in kilometers.
        """
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * \
            math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))

        # Radius of earth in kilometers
        r = 6371
        return c * r

    def get_nearest_venues(self, user_lat: float, user_lon: float,
                           limit: int = 10, max_distance_km: float = 50.0) -> List[Tuple[OlympicVenue, float]]:
        """
        Get the nearest Olympic venues to a given location.
        Returns a list of tuples (venue, distance_km).
        """
        venues = self.db.query(OlympicVenue).all()

        venues_with_distance = []
        for venue in venues:
            distance = self.calculate_distance(
                user_lat, user_lon,
                venue.latitude, venue.longitude
            )

            if distance <= max_distance_km:
                venues_with_distance.append((venue, distance))

        # Sort by distance and return top results
        venues_with_distance.sort(key=lambda x: x[1])
        return venues_with_distance[:limit]

    def get_venues_in_area(self, center_lat: float, center_lon: float,
                           radius_km: float = 10.0) -> List[OlympicVenue]:
        """Get all venues within a specified radius of a center point."""
        venues = self.db.query(OlympicVenue).all()

        venues_in_area = []
        for venue in venues:
            distance = self.calculate_distance(
                center_lat, center_lon,
                venue.latitude, venue.longitude
            )

            if distance <= radius_km:
                venues_in_area.append(venue)

        return venues_in_area

    def get_venue_statistics(self) -> dict:
        """Get statistics about Olympic venues."""
        total_venues = self.db.query(OlympicVenue).count()

        # Count by venue type
        venue_types = self.db.query(
            OlympicVenue.venue_type,
            func.count(OlympicVenue.id).label('count')
        ).group_by(OlympicVenue.venue_type).all()

        # Count by sport category
        sport_categories = self.db.query(
            OlympicVenue.sport_category,
            func.count(OlympicVenue.id).label('count')
        ).group_by(OlympicVenue.sport_category).all()

        return {
            'total_venues': total_venues,
            'venue_types': [{'type': vt[0], 'count': vt[1]} for vt in venue_types],
            'sport_categories': [{'category': sc[0], 'count': sc[1]} for sc in sport_categories]
        }

    def get_accessible_venues(self) -> List[OlympicVenue]:
        """Get venues that have accessibility features."""
        return self.db.query(OlympicVenue).filter(
            and_(
                OlympicVenue.accessibility_features.isnot(None),
                OlympicVenue.accessibility_features != ''
            )
        ).all()

    def get_large_capacity_venues(self, min_capacity: int = 10000) -> List[OlympicVenue]:
        """Get venues with capacity above a threshold."""
        return self.db.query(OlympicVenue).filter(
            OlympicVenue.capacity >= min_capacity
        ).order_by(OlympicVenue.capacity.desc()).all()
