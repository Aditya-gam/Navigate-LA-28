# server/services/nearest_bustops.py

from shapely.geometry import LineString, Point  # For route and point geometries
from shapely.ops import substring  # For extracting a portion of a geometry
import json  # For handling JSON data
import os
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from yarl import URL as MultiHostUrl
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Set up logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConfig:
    """
    Configuration class for the PostgreSQL database with PostGIS support.
    """
    POSTGRES_USER = os.getenv("POSTGRES_USER", "la28_user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "bigdata_la28")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "navigate_la28_db")

    @property
    def database_url(self) -> str:
        """
        Construct the database connection URL.
        """
        logger.info(
            f"Attempting to connect to: {self.POSTGRES_HOST}:{self.POSTGRES_PORT}")
        return str(
            MultiHostUrl.build(
                scheme="postgresql+asyncpg",
                user=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_HOST,
                port=int(self.POSTGRES_PORT),
                path=f"/{self.POSTGRES_DB}"
            )
        )


class NearestBusStopsService:
    def __init__(self):
        self.db_config = DatabaseConfig()
        self.engine = create_async_engine(
            self.db_config.database_url, echo=True, future=True, pool_pre_ping=True
        )
        self.async_session_factory = async_sessionmaker(
            self.engine,
            autoflush=False,
            expire_on_commit=False,
        )

    def trim_route_geometry(self, route_coords, origin_point, destination_point):
        """
        Extracts the portion of route geometry between origin and destination points.
        Returns only the route coordinates without including the origin and destination points.

        Args:
            route_coords (list): List of coordinates representing the route.
            origin_point (tuple): Origin point (longitude, latitude).
            destination_point (tuple): Destination point (longitude, latitude).

        Returns:
            list: List of coordinates for the trimmed route.
        """
        try:
            # Create LineString from route coordinates
            route_line = LineString(route_coords)

            # Find the nearest points on the route to origin and destination
            # Distance along route to origin
            origin_dist = route_line.project(Point(origin_point))
            # Distance along route to destination
            dest_dist = route_line.project(Point(destination_point))

            # Ensure origin comes before destination
            start_dist = min(origin_dist, dest_dist)
            end_dist = max(origin_dist, dest_dist)

            # Extract the portion of the route between these points
            trimmed_line = substring(route_line, start_dist, end_dist)

            # Get the coordinates without adding origin and destination points
            return list(trimmed_line.coords)
        except Exception as e:
            logger.error(f"Error trimming route geometry: {str(e)}")
            return route_coords

    async def _find_nearby_stops(self, lat, lon, buffer_radius_miles):
        """
        Find bus stops within buffer radius using PostGIS spatial queries.
        """
        async with self.async_session_factory() as session:
            try:
                # Use PostGIS ST_DWithin for efficient spatial queries
                query = text("""
                    SELECT 
                        stop_number, line, direction, stop_name, latitude, longitude,
                        ST_Distance(
                            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
                            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                        ) * 69.0 AS distance_miles
                    FROM bus_stops
                    WHERE ST_DWithin(
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
                        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
                        :buffer_radius_miles / 69.0
                    )
                    ORDER BY distance_miles
                """)
                
                result = await session.execute(query, {
                    'longitude': lon,
                    'latitude': lat,
                    'buffer_radius_miles': buffer_radius_miles
                })
                
                return [dict(row._mapping) for row in result.fetchall()]
            except Exception as e:
                logger.error(f"Error finding nearby stops: {str(e)}")
                raise

    async def _load_route_geometries(self):
        """
        Load bus route geometries from the database using PostGIS.
        """
        async with self.async_session_factory() as session:
            try:
                # Query to get route geometries from places table
                # Assuming routes are stored as GeoJSON in the places table
                query = text("""
                    SELECT 
                        id, name, category, description,
                        ST_AsGeoJSON(geometry) as geometry_geojson
                    FROM places 
                    WHERE category = 'bus_route' 
                    AND geometry IS NOT NULL
                """)
                
                result = await session.execute(query)
                routes = result.fetchall()
                
                route_lookup = {}
                for route in routes:
                    try:
                        # Parse GeoJSON geometry
                        geom_data = json.loads(route.geometry_geojson)
                        route_num = str(route.id)
                        route_info = {
                            "geometry": geom_data["coordinates"],
                            "name": route.name,
                            "type": "Metro Bus",
                            "category": route.category or "Bus Route",
                        }
                        if route_num not in route_lookup:
                            route_lookup[route_num] = []
                        route_lookup[route_num].append(route_info)
                    except (json.JSONDecodeError, KeyError) as e:
                        logger.warning(f"Error parsing route geometry for route {route.id}: {str(e)}")
                        continue
                
                return route_lookup
            except Exception as e:
                logger.error(f"Error loading route geometries: {str(e)}")
                # Return empty lookup if there's an error
                return {}

    def _find_best_route(self, user_stops, target_stops, route_lookup):
        """
        Find the best route with shortest total distance.
        """
        best_route = None
        min_total_distance = float("inf")

        for user_stop in user_stops:
            for target_stop in target_stops:
                if user_stop['line'] == target_stop['line']:
                    total_distance = user_stop['distance_miles'] + target_stop['distance_miles']

                    for route_info in route_lookup.get(str(user_stop['line']), []):
                        try:
                            origin_point = Point(
                                float(user_stop['longitude']), float(user_stop['latitude']))
                            dest_point = Point(
                                float(target_stop['longitude']), float(target_stop['latitude']))
                            
                            # Check if route has valid geometry
                            if not route_info.get("geometry"):
                                continue
                                
                            route_line = LineString(route_info["geometry"])

                            origin_dist_to_route = origin_point.distance(route_line)
                            dest_dist_to_route = dest_point.distance(route_line)
                            adjusted_total_distance = total_distance + \
                                origin_dist_to_route + dest_dist_to_route

                            if adjusted_total_distance < min_total_distance:
                                min_total_distance = adjusted_total_distance
                                best_route = {
                                    "route_number": user_stop['line'],
                                    "route_name": route_info["name"],
                                    "route_type": route_info["type"],
                                    "category": route_info["category"],
                                    "geometry": self.trim_route_geometry(
                                        route_info["geometry"],
                                        [float(user_stop['longitude']), float(user_stop['latitude'])],
                                        [float(target_stop['longitude']), float(target_stop['latitude'])],
                                    ),
                                    "origin": {
                                        "stop_number": user_stop['stop_number'],
                                        "name": user_stop['stop_name'],
                                        "distance": float(user_stop['distance_miles']),
                                        "coordinates": [float(user_stop['longitude']), float(user_stop['latitude'])],
                                    },
                                    "destination": {
                                        "stop_number": target_stop['stop_number'],
                                        "name": target_stop['stop_name'],
                                        "distance": float(target_stop['distance_miles']),
                                        "coordinates": [float(target_stop['longitude']), float(target_stop['latitude'])],
                                    },
                                }
                        except Exception as e:
                            logger.warning(f"Error processing route {user_stop['line']}: {str(e)}")
                            continue

        return best_route

    async def find_direct_bus_lines(
        self, user_lat, user_lon, target_lat, target_lon, buffer_radius_miles
    ):
        """
        Finds the best direct bus route connecting user and target areas within a buffer radius.
        Returns the route with the shortest total distance to both stops.
        """
        try:
            # Get nearby stops for user and target locations using PostGIS
            user_stops = await self._find_nearby_stops(
                user_lat, user_lon, buffer_radius_miles)
            target_stops = await self._find_nearby_stops(
                target_lat, target_lon, buffer_radius_miles)

            if not user_stops or not target_stops:
                return {
                    "status": "error", 
                    "data": {"message": "No bus stops found within the specified radius"}
                }

            # Load route geometries and find best route
            route_lookup = await self._load_route_geometries()
            best_route = self._find_best_route(user_stops, target_stops, route_lookup)

            if best_route is None:
                return {
                    "status": "error", 
                    "data": {"message": "No direct bus routes found"}
                }

            return {"status": "success", "data": best_route}

        except Exception as e:
            logger.error(f"Error finding direct bus lines: {str(e)}")
            return {
                "status": "error",
                "data": {"message": f"Error finding direct bus lines: {str(e)}"},
            }

    async def get_nearby_stops(self, lat, lon, radius_miles=1.0, limit=10):
        """
        Get nearby bus stops within a specified radius.
        """
        try:
            stops = await self._find_nearby_stops(lat, lon, radius_miles)
            return {
                "status": "success",
                "data": {
                    "stops": stops[:limit],
                    "total_found": len(stops),
                    "search_radius_miles": radius_miles
                }
            }
        except Exception as e:
            logger.error(f"Error getting nearby stops: {str(e)}")
            return {
                "status": "error",
                "data": {"message": f"Error getting nearby stops: {str(e)}"},
            }

    async def get_bus_routes_in_area(self, lat, lon, radius_miles=2.0):
        """
        Get all bus routes that pass through a specified area.
        """
        try:
            async with self.async_session_factory() as session:
                # Find stops in the area and get unique routes
                query = text("""
                    SELECT DISTINCT line, direction, COUNT(*) as stop_count
                    FROM bus_stops
                    WHERE ST_DWithin(
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
                        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
                        :radius_miles / 69.0
                    )
                    GROUP BY line, direction
                    ORDER BY stop_count DESC
                """)
                
                result = await session.execute(query, {
                    'longitude': lon,
                    'latitude': lat,
                    'radius_miles': radius_miles
                })
                
                routes = [dict(row._mapping) for row in result.fetchall()]
                
                return {
                    "status": "success",
                    "data": {
                        "routes": routes,
                        "search_radius_miles": radius_miles
                    }
                }
        except Exception as e:
            logger.error(f"Error getting bus routes in area: {str(e)}")
            return {
                "status": "error",
                "data": {"message": f"Error getting bus routes in area: {str(e)}"},
            }


# Create a singleton instance
nearest_bustops_service = NearestBusStopsService()

# Backward compatibility function
async def find_direct_bus_lines(
    user_lat, user_lon, target_lat, target_lon, buffer_radius_miles
):
    """
    Backward compatibility function for the old API.
    """
    return await nearest_bustops_service.find_direct_bus_lines(
        user_lat, user_lon, target_lat, target_lon, buffer_radius_miles
    )
