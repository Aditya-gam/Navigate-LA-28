# server/routes/olympic_venue_routes.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from config.database import get_db
from services.olympic_venue_service import OlympicVenueService
from models.olympic_venue import OlympicVenue
from pydantic import BaseModel


# Pydantic models for request/response
class OlympicVenueResponse(BaseModel):
    id: int
    name: str
    venue_type: Optional[str]
    sport_category: Optional[str]
    latitude: float
    longitude: float
    address: str
    capacity: Optional[int]
    description: Optional[str]
    accessibility_features: Optional[str]

    class Config:
        from_attributes = True


class NearestVenueResponse(BaseModel):
    venue: OlympicVenueResponse
    distance_km: float


class VenueStatsResponse(BaseModel):
    total_venues: int
    venue_types: List[dict]
    sport_categories: List[dict]


# Router setup
router = APIRouter(prefix="/api/olympic-venues", tags=["Olympic Venues"])


@router.get("/", response_model=List[OlympicVenueResponse])
async def get_all_venues(db: Session = Depends(get_db)):
    """Get all Olympic venues."""
    service = OlympicVenueService(db)
    venues = service.get_all_venues()
    return venues


@router.get("/{venue_id}", response_model=OlympicVenueResponse)
async def get_venue_by_id(venue_id: int, db: Session = Depends(get_db)):
    """Get a specific Olympic venue by ID."""
    service = OlympicVenueService(db)
    venue = service.get_venue_by_id(venue_id)

    if not venue:
        raise HTTPException(status_code=404, detail="Olympic venue not found")

    return venue


@router.get("/search/by-sport", response_model=List[OlympicVenueResponse])
async def get_venues_by_sport(
    sport: str = Query(..., description="Sport category to search for"),
    db: Session = Depends(get_db)
):
    """Get venues by sport category."""
    service = OlympicVenueService(db)
    venues = service.get_venues_by_sport(sport)
    return venues


@router.get("/search/by-type", response_model=List[OlympicVenueResponse])
async def get_venues_by_type(
    venue_type: str = Query(..., description="Venue type to search for"),
    db: Session = Depends(get_db)
):
    """Get venues by venue type."""
    service = OlympicVenueService(db)
    venues = service.get_venues_by_type(venue_type)
    return venues


@router.get("/search/general", response_model=List[OlympicVenueResponse])
async def search_venues(
    q: str = Query(..., description="Search query for venues"),
    db: Session = Depends(get_db)
):
    """Search venues by name, sport category, or venue type."""
    service = OlympicVenueService(db)
    venues = service.search_venues(q)
    return venues


@router.get("/nearest", response_model=List[NearestVenueResponse])
async def get_nearest_venues(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    limit: int = Query(10, description="Maximum number of venues to return"),
    max_distance: float = Query(
        50.0, description="Maximum distance in kilometers"),
    db: Session = Depends(get_db)
):
    """Get the nearest Olympic venues to a given location."""
    service = OlympicVenueService(db)
    venues_with_distance = service.get_nearest_venues(
        lat, lon, limit, max_distance)

    return [
        NearestVenueResponse(
            venue=OlympicVenueResponse.from_orm(venue),
            distance_km=distance
        )
        for venue, distance in venues_with_distance
    ]


@router.get("/area/within-radius", response_model=List[OlympicVenueResponse])
async def get_venues_in_area(
    center_lat: float = Query(..., description="Center latitude"),
    center_lon: float = Query(..., description="Center longitude"),
    radius: float = Query(10.0, description="Radius in kilometers"),
    db: Session = Depends(get_db)
):
    """Get all venues within a specified radius of a center point."""
    service = OlympicVenueService(db)
    venues = service.get_venues_in_area(center_lat, center_lon, radius)
    return venues


@router.get("/stats", response_model=VenueStatsResponse)
async def get_venue_statistics(db: Session = Depends(get_db)):
    """Get statistics about Olympic venues."""
    service = OlympicVenueService(db)
    stats = service.get_venue_statistics()
    return stats


@router.get("/accessible", response_model=List[OlympicVenueResponse])
async def get_accessible_venues(db: Session = Depends(get_db)):
    """Get venues that have accessibility features."""
    service = OlympicVenueService(db)
    venues = service.get_accessible_venues()
    return venues


@router.get("/large-capacity", response_model=List[OlympicVenueResponse])
async def get_large_capacity_venues(
    min_capacity: int = Query(10000, description="Minimum capacity threshold"),
    db: Session = Depends(get_db)
):
    """Get venues with capacity above a threshold."""
    service = OlympicVenueService(db)
    venues = service.get_large_capacity_venues(min_capacity)
    return venues
