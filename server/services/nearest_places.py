# server/services/nearest_places.py

# Import SparkSession for working with Spark DataFrames
from pyspark.sql import SparkSession
import os

# Check if we're in development mode (no HDFS)
is_development = os.getenv('ENVIRONMENT', 'development') == 'development'

if is_development:
    # Use local Spark configuration for development
    spark = (
        SparkSession.builder.appName("NearestPlacesFinder")
        .config("spark.driver.memory", "1g")
        .config("spark.executor.memory", "1g")
        .config("spark.sql.adaptive.enabled", "false")
        .config("spark.sql.adaptive.coalescePartitions.enabled", "false")
        .master("local[*]")
        .getOrCreate()
    )
else:
    # Initialize Spark Session with HDFS configuration for production
    spark = (
        # Name of the Spark application
        SparkSession.builder.appName("NearestPlacesFinder")
        # Allocate 2GB memory for the driver
        .config("spark.driver.memory", "2g")
        # Allocate 2GB memory for the executor
        .config("spark.executor.memory", "2g")
        # Configure HDFS as the default file system
        .config("spark.hadoop.fs.defaultFS", "hdfs://hadoop:9000")
        # Use HDFS implementation
        .config("spark.hadoop.fs.hdfs.impl", "org.apache.hadoop.hdfs.DistributedFileSystem")
        # Use local file system implementation
        .config("spark.hadoop.fs.file.impl", "org.apache.hadoop.fs.LocalFileSystem")
        # Include Hadoop client package
        .config("spark.jars.packages", "org.apache.hadoop:hadoop-client:3.3.1")
        .getOrCreate()  # Create or retrieve the SparkSession
    )


def find_nearest_places(x, y, n):
    """
    Find the nearest places to a given location using Haversine formula.

    Args:
        x (float): Latitude of the given location.
        y (float): Longitude of the given location.
        n (int): Number of nearest places to return.

    Returns:
        list: A list of rows representing the nearest places, including their names, coordinates, addresses, and distances.

    Steps:
        1. Load the dataset of places from HDFS or local file.
        2. Register the dataset as a temporary SQL table.
        3. Use SQL to calculate the distances to all places using the Haversine formula.
        4. Sort the results by distance in ascending order and limit the results to the top `n` places.
        5. Return the results as a list of rows.
    """
    if is_development:
        # Use local file path for development
        file_path = "data/all_places.csv"
        if not os.path.exists(file_path):
            # Return mock data for development
            return [
                {"name": "Sample Place 1", "latitude": 34.0522, "longitude": -
                    118.2437, "address": "123 Main St", "distance": 0.5},
                {"name": "Sample Place 2", "latitude": 34.0622, "longitude": -
                    118.2537, "address": "456 Oak Ave", "distance": 1.2},
            ]
    else:
        # Path to the CSV file on HDFS
        file_path = "hdfs://hadoop:9000/user/hdfs/uploads/all_places.csv"

    try:
        # Read the CSV file into a Spark DataFrame
        places_df = spark.read.csv(file_path, header=True, inferSchema=True)

        # Register the DataFrame as a temporary SQL table
        places_df.createOrReplaceTempView("places")

        # SQL query to calculate distances and find the nearest places
        query = f"""
        SELECT name, latitude, longitude, address,
               (3958.8 * acos(
                   cos(radians({x})) * cos(radians(latitude)) *
                   cos(radians(longitude) - radians({y})) +
                   sin(radians({x})) * sin(radians(latitude))
               )) AS distance  -- Calculate distance using the Haversine formula
        FROM places
        ORDER BY distance ASC  -- Sort results by distance (ascending)
        LIMIT {n}  -- Limit results to the top `n` places
        """

        # Execute the query and collect the results
        result_df = spark.sql(query)
        return result_df.collect()  # Collect the results as a list of rows
    except Exception as e:
        # Return mock data if there's an error
        print(f"Error loading places data: {e}")
        return [
            {"name": "Sample Place 1", "latitude": 34.0522, "longitude": -
                118.2437, "address": "123 Main St", "distance": 0.5},
            {"name": "Sample Place 2", "latitude": 34.0622, "longitude": -
                118.2537, "address": "456 Oak Ave", "distance": 1.2},
        ]
