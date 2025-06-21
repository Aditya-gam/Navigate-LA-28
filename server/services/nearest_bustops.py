# server/services/nearest_bustops.py

from pyspark.sql import SparkSession  # For working with Spark dataframes
from shapely.geometry import LineString, Point  # For route and point geometries
from shapely.ops import substring  # For extracting a portion of a geometry
import json  # For handling JSON data

# Initialize Spark Session with HDFS configuration
spark = (
    SparkSession.builder.appName("DirectBusLinesFinder")
    .config("spark.driver.memory", "2g")  # Allocate memory for the driver
    .config("spark.executor.memory", "2g")  # Allocate memory for executors
    .config("spark.hadoop.fs.defaultFS", "hdfs://hadoop:9000")  # HDFS setup
    .config("spark.hadoop.fs.hdfs.impl", "org.apache.hadoop.hdfs.DistributedFileSystem")
    .config("spark.hadoop.fs.file.impl", "org.apache.hadoop.fs.LocalFileSystem")
    # Hadoop client
    .config("spark.jars.packages", "org.apache.hadoop:hadoop-client:3.3.1")
    .getOrCreate()
)


def trim_route_geometry(route_coords, origin_point, destination_point):
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


def _create_nearby_stops_query(lat, lon, buffer_radius_miles):
    """Create SQL query to find stops within buffer radius."""
    return f"""
    SELECT STOPNUM, LINE, DIR, STOPNAME, LAT, LONG,
           (3958.8 * acos(
               cos(radians({lat})) * cos(radians(LAT)) *
               cos(radians(LONG) - radians({lon})) +
               sin(radians({lat})) * sin(radians(LAT))
           )) AS distance
    FROM bus_stops
    WHERE (3958.8 * acos(
               cos(radians({lat})) * cos(radians(LAT)) *
               cos(radians(LONG) - radians({lon})) +
               sin(radians({lat})) * sin(radians(LAT))
           )) <= {buffer_radius_miles}
    """


def _load_route_geometries():
    """Load and process bus route geometries from HDFS."""
    geojson_path = "hdfs://hadoop:9000/user/hdfs/uploads/bus_lines.geojson"
    route_df = spark.read.option("multiline", "true").json(geojson_path)
    features = route_df.select("features").first()[0]

    route_lookup = {}
    for feature in features:
        route_num = str(feature.properties.RouteNumber)
        route_info = {
            "geometry": feature.geometry.coordinates,
            "name": feature.properties.RouteName,
            "type": feature.properties.MetroBusType,
            "category": feature.properties.MetroCategory,
        }
        if route_num not in route_lookup:
            route_lookup[route_num] = []
        route_lookup[route_num].append(route_info)

    return route_lookup


def _find_best_route(user_stops, target_stops, route_lookup):
    """Find the best route with shortest total distance."""
    best_route = None
    min_total_distance = float("inf")

    for user_stop in user_stops:
        for target_stop in target_stops:
            if user_stop.LINE == target_stop.LINE:
                total_distance = user_stop.distance + target_stop.distance

                for route_info in route_lookup.get(str(user_stop.LINE), []):
                    origin_point = Point(
                        float(user_stop.LONG), float(user_stop.LAT))
                    dest_point = Point(
                        float(target_stop.LONG), float(target_stop.LAT))
                    route_line = LineString(route_info["geometry"])

                    origin_dist_to_route = origin_point.distance(route_line)
                    dest_dist_to_route = dest_point.distance(route_line)
                    adjusted_total_distance = total_distance + \
                        origin_dist_to_route + dest_dist_to_route

                    if adjusted_total_distance < min_total_distance:
                        min_total_distance = adjusted_total_distance
                        best_route = {
                            "route_number": user_stop.LINE,
                            "route_name": route_info["name"],
                            "route_type": route_info["type"],
                            "category": route_info["category"],
                            "geometry": trim_route_geometry(
                                route_info["geometry"],
                                [float(user_stop.LONG), float(user_stop.LAT)],
                                [float(target_stop.LONG),
                                 float(target_stop.LAT)],
                            ),
                            "origin": {
                                "stop_number": user_stop.STOPNUM,
                                "name": user_stop.STOPNAME,
                                "distance": float(user_stop.distance),
                                "coordinates": [float(user_stop.LONG), float(user_stop.LAT)],
                            },
                            "destination": {
                                "stop_number": target_stop.STOPNUM,
                                "name": target_stop.STOPNAME,
                                "distance": float(target_stop.distance),
                                "coordinates": [float(target_stop.LONG), float(target_stop.LAT)],
                            },
                        }

    return best_route


async def find_direct_bus_lines(
    user_lat, user_lon, target_lat, target_lon, buffer_radius_miles
):
    """
    Finds the best direct bus route connecting user and target areas within a buffer radius.
    Returns the route with the shortest total distance to both stops.
    """
    try:
        # Read bus stops data from HDFS
        hdfs_file_path = "hdfs://hadoop:9000/user/hdfs/uploads/bus_stops.csv"
        bus_stops_df = spark.read.csv(
            hdfs_file_path, header=True, inferSchema=True)
        bus_stops_df.createOrReplaceTempView("bus_stops")

        # Get nearby stops for user and target locations
        user_query = _create_nearby_stops_query(
            user_lat, user_lon, buffer_radius_miles)
        target_query = _create_nearby_stops_query(
            target_lat, target_lon, buffer_radius_miles)

        user_stops = spark.sql(user_query).collect()
        target_stops = spark.sql(target_query).collect()

        # Load route geometries and find best route
        route_lookup = _load_route_geometries()
        best_route = _find_best_route(user_stops, target_stops, route_lookup)

        if best_route is None:
            return {"status": "error", "data": {"message": "No direct bus routes found"}}

        return {"status": "success", "data": best_route}

    except Exception as e:
        print(f"Error finding direct bus lines: {str(e)}")
        return {
            "status": "error",
            "data": {"message": f"Error finding direct bus lines: {str(e)}"},
        }
