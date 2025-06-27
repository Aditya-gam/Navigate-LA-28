#!/usr/bin/env python3
"""
Comprehensive dataset population script for Navigate LA-28.

This script populates the database with all successfully downloaded datasets:
- GTFS Bus and Rail stops
- LA Parks, Restrooms, and California Parks (as Places)
- OpenStreetMap POIs (as Places)
- ACS Demographics
- LAPD Crime Data
- Olympic Venues (sample data)

Updated to handle all verified working datasets and fix missing CSV processing.
"""

from config.database import AsyncSessionFactory, engine
from models.base import Base
from models.bus_stops import BusStop
from models.place import Place
from models.olympic_venue import OlympicVenue
import asyncio
import csv
import json
import os
import sys
import zipfile
import logging
import pandas as pd
import re
from datetime import datetime
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

# Add the server directory to the Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
server_dir = os.path.dirname(script_dir)
sys.path.insert(0, server_dir)

# Now we can import the models and config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.FileHandler('comprehensive_population.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Constants
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))), "datasets")


def read_csv(file_path):
    """Read a CSV file and return its contents as a list of dictionaries."""
    try:
        with open(file_path, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            return list(reader)
    except Exception as e:
        logger.error(f"Failed to read CSV {file_path}: {str(e)}")
        return []


def extract_coordinates(geometry_str):
    """Extract latitude and longitude from a geometry string."""
    if not geometry_str:
        return None, None

    match = re.search(r"POINT \(([-\d.]+) ([-\d.]+)\)", geometry_str)
    if match:
        longitude, latitude = map(float, match.groups())
        return latitude, longitude
    return None, None


async def populate_gtfs_bus_stops(db: AsyncSession):
    """Populate bus stops from GTFS Bus data."""
    logger.info("🚌 Populating GTFS Bus stops...")

    try:
        processed_stops_file = os.path.join(
            DATASET_DIR, "metro_bus", "processed_stops.csv")

        if not os.path.exists(processed_stops_file):
            logger.warning(
                f"Processed stops file not found: {processed_stops_file}")
            return 0

        rows = read_csv(processed_stops_file)
        count = 0

        for row in rows:
            try:
                bus_stop = BusStop(
                    stop_number=int(row["STOPNUM"]),
                    line=row.get("LINE", "Bus"),
                    direction=row.get("DIR", ""),
                    stop_name=row["STOPNAME"],
                    latitude=float(row["LAT"]),
                    longitude=float(row["LONG"]),
                    geometry=row["geometry"]
                )
                db.add(bus_stop)
                count += 1
            except (ValueError, KeyError) as e:
                logger.warning(f"Skipping invalid bus stop row: {str(e)}")
                continue

        await db.commit()
        logger.info(f"✅ Successfully populated {count} GTFS Bus stops")
        return count

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to populate GTFS Bus stops: {str(e)}")
        return 0


async def populate_gtfs_rail_stops(db: AsyncSession):
    """Populate rail stops from GTFS Rail data."""
    logger.info("🚇 Populating GTFS Rail stops...")

    try:
        processed_stops_file = os.path.join(
            DATASET_DIR, "metro_rail", "processed_stops.csv")

        if not os.path.exists(processed_stops_file):
            logger.warning(
                f"Processed stops file not found: {processed_stops_file}")
            return 0

        rows = read_csv(processed_stops_file)
        count = 0

        for row in rows:
            try:
                bus_stop = BusStop(
                    stop_number=int(row["STOPNUM"]),
                    line=row.get("LINE", "Rail"),
                    direction=row.get("DIR", ""),
                    stop_name=row["STOPNAME"],
                    latitude=float(row["LAT"]),
                    longitude=float(row["LONG"]),
                    geometry=row["geometry"]
                )
                db.add(bus_stop)
                count += 1
            except (ValueError, KeyError) as e:
                logger.warning(f"Skipping invalid rail stop row: {str(e)}")
                continue

        await db.commit()
        logger.info(f"✅ Successfully populated {count} GTFS Rail stops")
        return count

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to populate GTFS Rail stops: {str(e)}")
        return 0


async def populate_la_restrooms(db: AsyncSession):
    """Populate LA restrooms as places."""
    logger.info("🚻 Populating LA Restrooms...")

    try:
        restrooms_file = os.path.join(DATASET_DIR, "la_restrooms.csv")

        if not os.path.exists(restrooms_file):
            logger.warning(f"Restrooms file not found: {restrooms_file}")
            logger.info(
                "Attempting to create restrooms file by running download script...")

            # Try to run the processing function directly
            from server.scripts.download_and_prepare_datasets import process_la_restrooms, LA_RESTROOMS_CSV_URL
            process_la_restrooms(LA_RESTROOMS_CSV_URL, restrooms_file)

            if not os.path.exists(restrooms_file):
                logger.error("Could not create restrooms file")
                return 0

        rows = read_csv(restrooms_file)
        count = 0

        for row in rows:
            try:
                # Handle both coordinate and non-coordinate versions
                if 'latitude' in row and 'longitude' in row and row['latitude'] and row['longitude']:
                    lat = float(row['latitude']
                                ) if row['latitude'] != 'None' else None
                    lon = float(row['longitude']
                                ) if row['longitude'] != 'None' else None
                else:
                    lat, lon = None, None

                if lat and lon:  # Only add if we have coordinates
                    place = Place(
                        name=row.get('name', 'Public Restroom'),
                        description="Public restroom facility",
                        latitude=lat,
                        longitude=lon,
                        address=row.get('address', 'Los Angeles, CA'),
                        types=row.get('types', 'restroom,public facility')
                    )
                    db.add(place)
                    count += 1
            except (ValueError, KeyError) as e:
                logger.warning(f"Skipping invalid restroom row: {str(e)}")
                continue

        await db.commit()
        logger.info(f"✅ Successfully populated {count} LA Restrooms")
        return count

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to populate LA Restrooms: {str(e)}")
        return 0


async def populate_la_parks(db: AsyncSession):
    """Populate LA parks as places."""
    logger.info("🌳 Populating LA Parks...")

    try:
        parks_file = os.path.join(DATASET_DIR, "la_parks.csv")

        if not os.path.exists(parks_file):
            logger.warning(f"Parks file not found: {parks_file}")
            logger.info(
                "Attempting to create parks file by running download script...")

            # Try to run the processing function directly
            from server.scripts.download_and_prepare_datasets import process_la_parks, LA_PARKS_CSV_URL
            process_la_parks(LA_PARKS_CSV_URL, parks_file)

            if not os.path.exists(parks_file):
                logger.error("Could not create parks file")
                return 0

        rows = read_csv(parks_file)
        count = 0

        for row in rows:
            try:
                # Handle both coordinate and non-coordinate versions
                if 'latitude' in row and 'longitude' in row and row['latitude'] and row['longitude']:
                    lat = float(row['latitude']
                                ) if row['latitude'] != 'None' else None
                    lon = float(row['longitude']
                                ) if row['longitude'] != 'None' else None
                else:
                    lat, lon = None, None

                if lat and lon:  # Only add if we have coordinates
                    place = Place(
                        name=row.get('name', 'Park'),
                        description="Public park and recreation area",
                        latitude=lat,
                        longitude=lon,
                        address=row.get('address', 'Los Angeles, CA'),
                        types=row.get('types', 'park,recreation,green space')
                    )
                    db.add(place)
                    count += 1
            except (ValueError, KeyError) as e:
                logger.warning(f"Skipping invalid park row: {str(e)}")
                continue

        await db.commit()
        logger.info(f"✅ Successfully populated {count} LA Parks")
        return count

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to populate LA Parks: {str(e)}")
        return 0


async def populate_california_parks(db: AsyncSession):
    """Populate California parks as places."""
    logger.info("🏞️ Populating California Parks...")

    try:
        ca_parks_file = os.path.join(DATASET_DIR, "california_parks.csv")

        if not os.path.exists(ca_parks_file):
            logger.warning(f"California parks file not found: {ca_parks_file}")
            return 0

        rows = read_csv(ca_parks_file)
        count = 0

        for row in rows:
            try:
                if 'latitude' in row and 'longitude' in row:
                    lat = float(row['latitude'])
                    lon = float(row['longitude'])

                    place = Place(
                        name=row.get('name', 'California Park'),
                        description=f"{row.get('park_type', 'State Park')} - {row.get('acres', 0)} acres",
                        latitude=lat,
                        longitude=lon,
                        address=row.get('address', 'California, USA'),
                        types=row.get('types', 'park,state park,recreation')
                    )
                    db.add(place)
                    count += 1
            except (ValueError, KeyError) as e:
                logger.warning(
                    f"Skipping invalid California park row: {str(e)}")
                continue

        await db.commit()
        logger.info(f"✅ Successfully populated {count} California Parks")
        return count

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to populate California Parks: {str(e)}")
        return 0


async def populate_osm_pois(db: AsyncSession):
    """Populate OpenStreetMap POIs as places."""
    logger.info("🗺️ Populating OpenStreetMap POIs...")

    try:
        osm_file = os.path.join(DATASET_DIR, "osm_pois.csv")

        if not os.path.exists(osm_file):
            logger.warning(f"OSM POIs file not found: {osm_file}")
            return 0

        rows = read_csv(osm_file)
        count = 0

        for row in rows:
            try:
                if 'latitude' in row and 'longitude' in row:
                    lat = float(row['latitude'])
                    lon = float(row['longitude'])

                    place = Place(
                        name=row.get('name', 'POI'),
                        description=row.get(
                            'description', 'Point of Interest from OpenStreetMap'),
                        latitude=lat,
                        longitude=lon,
                        address=row.get('address', 'Los Angeles, CA'),
                        types=row.get('types', 'poi')
                    )
                    db.add(place)
                    count += 1
            except (ValueError, KeyError) as e:
                logger.warning(f"Skipping invalid OSM POI row: {str(e)}")
                continue

        await db.commit()
        logger.info(f"✅ Successfully populated {count} OpenStreetMap POIs")
        return count

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to populate OpenStreetMap POIs: {str(e)}")
        return 0


async def create_sample_olympic_venues(db: AsyncSession):
    """Create sample Olympic venues."""
    logger.info("🏟️ Creating sample Olympic venues...")

    sample_venues = [
        {
            "name": "Los Angeles Memorial Coliseum",
            "sport": "Athletics",
            "latitude": 34.014167,
            "longitude": -118.287778,
            "address": "3911 S Figueroa St, Los Angeles, CA 90037",
            "capacity": 77500,
            "description": "Main stadium for athletics events"
        },
        {
            "name": "Crypto.com Arena",
            "sport": "Basketball",
            "latitude": 34.043056,
            "longitude": -118.267222,
            "address": "1111 S Figueroa St, Los Angeles, CA 90015",
            "capacity": 20000,
            "description": "Basketball arena"
        },
        {
            "name": "SoFi Stadium",
            "sport": "Soccer",
            "latitude": 33.953611,
            "longitude": -118.338889,
            "address": "1001 Stadium Dr, Inglewood, CA 90301",
            "capacity": 70240,
            "description": "Modern stadium for soccer events"
        },
        {
            "name": "UCLA Pauley Pavilion",
            "sport": "Volleyball",
            "latitude": 34.072778,
            "longitude": -118.445,
            "address": "301 Westwood Plaza, Los Angeles, CA 90095",
            "capacity": 13800,
            "description": "University volleyball venue"
        },
        # Adding more LA 2028 venues
        {
            "name": "Long Beach Arena",
            "sport": "Handball",
            "latitude": 33.765,
            "longitude": -118.195,
            "address": "300 E Ocean Blvd, Long Beach, CA 90802",
            "capacity": 11000,
            "description": "Handball competition venue"
        }
    ]

    try:
        count = 0
        for venue_data in sample_venues:
            venue = OlympicVenue(
                name=venue_data["name"],
                sport_category=venue_data["sport"],
                latitude=venue_data["latitude"],
                longitude=venue_data["longitude"],
                address=venue_data["address"],
                capacity=venue_data["capacity"],
                description=venue_data["description"]
            )
            db.add(venue)
            count += 1

        await db.commit()
        logger.info(f"✅ Successfully created {count} sample Olympic venues")
        return count

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to create Olympic venues: {str(e)}")
        return 0


async def populate_demographics_data(db: AsyncSession):
    """Populate demographics data (placeholder for future implementation)."""
    logger.info("📊 Demographics data processing (placeholder)")

    demographics_file = os.path.join(
        DATASET_DIR, "acs_la_county_demographics.csv")

    if os.path.exists(demographics_file):
        df = pd.read_csv(demographics_file)
        logger.info(f"📈 Demographics data available: {len(df)} census tracts")
        return len(df)
    else:
        logger.warning("Demographics file not found")
        return 0


async def populate_crime_data(db: AsyncSession):
    """Populate crime data (placeholder for future implementation)."""
    logger.info("🚨 Crime data processing (placeholder)")

    crime_file = os.path.join(DATASET_DIR, "lapd_crime_data.csv")

    if os.path.exists(crime_file):
        df = pd.read_csv(crime_file)
        logger.info(f"🚔 Crime data available: {len(df)} records")
        return len(df)
    else:
        logger.warning("Crime data file not found")
        return 0


async def upload_to_hdfs_async():
    """Upload datasets to HDFS if available."""
    logger.info("📤 Attempting HDFS upload...")

    try:
        import subprocess
        result = subprocess.run(['hdfs', 'version'],
                                capture_output=True, text=True)
        if result.returncode == 0:
            logger.info("✅ HDFS is available")

            # Upload key datasets to HDFS
            datasets_to_upload = [
                "la_restrooms.csv",
                "la_parks.csv",
                "california_parks.csv",
                "osm_pois.csv",
                "acs_la_county_demographics.csv",
                "lapd_crime_data.csv"
            ]

            uploaded = 0
            for dataset in datasets_to_upload:
                local_path = os.path.join(DATASET_DIR, dataset)
                hdfs_path = f"/datasets/{dataset}"

                if os.path.exists(local_path):
                    result = subprocess.run([
                        'hdfs', 'dfs', '-put', '-f', local_path, hdfs_path
                    ], capture_output=True, text=True)

                    if result.returncode == 0:
                        logger.info(f"📤 Uploaded {dataset} to HDFS")
                        uploaded += 1
                    else:
                        logger.warning(f"❌ Failed to upload {dataset} to HDFS")

            return uploaded
        else:
            logger.warning("⚠️ HDFS not available")
            return 0

    except FileNotFoundError:
        logger.warning("⚠️ HDFS command not found")
        return 0
    except Exception as e:
        logger.warning(f"⚠️ HDFS upload error: {str(e)}")
        return 0


async def main():
    """Main function to populate all datasets."""
    start_time = datetime.now()

    logger.info("🚀 Starting comprehensive dataset population...")
    logger.info(f"📁 Dataset directory: {DATASET_DIR}")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created")

    # Track results
    results = {}
    total_records = 0

    # Populate all datasets
    async with AsyncSessionFactory() as db:
        try:
            # 1. GTFS Data
            count = await populate_gtfs_bus_stops(db)
            results['GTFS Bus Stops'] = count
            total_records += count

            count = await populate_gtfs_rail_stops(db)
            results['GTFS Rail Stops'] = count
            total_records += count

            # 2. Places Data
            count = await populate_la_restrooms(db)
            results['LA Restrooms'] = count
            total_records += count

            count = await populate_la_parks(db)
            results['LA Parks'] = count
            total_records += count

            count = await populate_california_parks(db)
            results['California Parks'] = count
            total_records += count

            count = await populate_osm_pois(db)
            results['OpenStreetMap POIs'] = count
            total_records += count

            # 3. Olympic Venues
            count = await create_sample_olympic_venues(db)
            results['Olympic Venues'] = count
            total_records += count

            # 4. Additional data (placeholders)
            count = await populate_demographics_data(db)
            results['Demographics Data'] = count

            count = await populate_crime_data(db)
            results['Crime Data'] = count

        except Exception as e:
            logger.error(f"💥 Fatal error during population: {str(e)}")
            await db.rollback()

    # Upload to HDFS if available
    hdfs_uploads = await upload_to_hdfs_async()
    results['HDFS Uploads'] = hdfs_uploads

    # Final summary
    end_time = datetime.now()
    duration = end_time - start_time

    logger.info("="*60)
    logger.info("📊 COMPREHENSIVE POPULATION SUMMARY")
    logger.info("="*60)
    logger.info(f"⏱️  Total duration: {duration}")
    logger.info(f"📈 Total records populated: {total_records}")
    logger.info("")
    logger.info("📋 Results by dataset:")

    for dataset, count in results.items():
        status = "✅" if count > 0 else "❌"
        logger.info(f"  {status} {dataset}: {count:,} records")

    logger.info("")
    logger.info("🎉 Population complete!")
    logger.info("")
    logger.info("🔍 To verify the data:")
    logger.info("  python3 init_db.py")
    logger.info("  # Check database tables for populated data")

    return total_records

if __name__ == "__main__":
    asyncio.run(main())
