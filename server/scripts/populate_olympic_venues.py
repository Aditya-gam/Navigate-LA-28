#!/usr/bin/env python3
"""
Script to populate the Olympic venues table from LA 28 venues dataset.

This script reads the processed venues CSV file and inserts the data into the
olympic_venues database table.
"""

from config.database import get_database_url
from models.base import Base
from models.olympic_venue import OlympicVenue
import os
import sys
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the server directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Configuration
DATASET_DIR = os.getenv("DATASET_DIR", "datasets")
VENUES_CSV = os.path.join(DATASET_DIR, "la28_venues.csv")


def populate_olympic_venues():
    """Populate the olympic_venues table from CSV data."""

    # Database setup
    DATABASE_URL = get_database_url()
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    if not os.path.exists(VENUES_CSV):
        print(f"❌ Olympic venues CSV file not found: {VENUES_CSV}")
        print("Please run the dataset download script first:")
        print("python server/scripts/download_and_prepare_datasets.py")
        return False

    try:
        # Read venues data
        print(f"📊 Reading Olympic venues data from {VENUES_CSV}")
        venues_df = pd.read_csv(VENUES_CSV)

        if venues_df.empty:
            print("⚠️  No venue data found in CSV file")
            return False

        print(f"📋 Processing {len(venues_df)} Olympic venues...")

        # Create database session
        session = SessionLocal()

        # Clear existing venues (optional - comment out to keep existing data)
        session.query(OlympicVenue).delete()
        session.commit()

        venues_added = 0
        venues_skipped = 0

        for _, row in venues_df.iterrows():
            try:
                # Validate required fields
                if pd.isna(row.get('latitude')) or pd.isna(row.get('longitude')):
                    print(
                        f"⚠️  Skipping venue '{row.get('name', 'Unknown')}' - missing coordinates")
                    venues_skipped += 1
                    continue

                # Create venue object
                venue = OlympicVenue(
                    name=str(row.get('name', 'Olympic Venue')),
                    venue_type=str(row.get('venue_type', 'Olympic Venue')),
                    sport_category=str(
                        row.get('sport_category', 'Multi-Sport')),
                    latitude=float(row['latitude']),
                    longitude=float(row['longitude']),
                    address=str(row.get('address', 'Los Angeles, CA')),
                    capacity=int(row['capacity']) if pd.notna(
                        row.get('capacity')) else None,
                    description=str(row.get('description', '')),
                    accessibility_features=str(
                        row.get('accessibility_features', ''))
                )

                session.add(venue)
                venues_added += 1

            except Exception as e:
                print(
                    f"❌ Error processing venue '{row.get('name', 'Unknown')}': {str(e)}")
                venues_skipped += 1
                continue

        # Commit all venues
        session.commit()
        session.close()

        print(f"✅ Successfully added {venues_added} Olympic venues")
        if venues_skipped > 0:
            print(f"⚠️  Skipped {venues_skipped} venues due to errors")

        return True

    except Exception as e:
        print(f"❌ Error populating Olympic venues: {str(e)}")
        return False


def main():
    """Main function to populate Olympic venues."""
    print("🏟️  Starting Olympic venues population...")

    success = populate_olympic_venues()

    if success:
        print("🎉 Olympic venues population completed successfully!")
    else:
        print("💥 Olympic venues population failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
