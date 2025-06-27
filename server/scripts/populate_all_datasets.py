#!/usr/bin/env python3
"""
Master script to orchestrate the complete Navigate LA-28 dataset pipeline.

This script runs the complete workflow:
1. Download and prepare all verified working datasets
2. Populate database with all processed data  
3. Upload to HDFS if available
4. Comprehensive validation and reporting

This replaces multiple redundant scripts with a single coordinated pipeline.
"""

import os
import sys
import subprocess
import logging
from datetime import datetime
import asyncio

# Add the server directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.FileHandler('dataset_pipeline.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def run_script(script_path: str, description: str, use_asyncio: bool = False) -> bool:
    """Run a script and return True if successful."""
    try:
        logger.info(f"🚀 Starting: {description}")

        if use_asyncio:
            # Special handling for async scripts
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "module", script_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # Run the main function if it exists
            if hasattr(module, 'main'):
                result = asyncio.run(module.main())
                logger.info(
                    f"✅ Completed: {description} - {result} records processed")
                return True
            else:
                logger.error(f"❌ No main function found in {script_path}")
                return False
        else:
            # Regular script execution
            result = subprocess.run([sys.executable, script_path],
                                    capture_output=True, text=True, cwd=os.getcwd())

            if result.returncode == 0:
                logger.info(f"✅ Completed: {description}")
                if result.stdout:
                    # Log only important output lines
                    important_lines = [line for line in result.stdout.split('\n')
                                       if any(keyword in line.lower() for keyword in
                                              ['successfully', 'processed', 'error', 'failed', 'completed'])]
                    # Last 10 important lines
                    for line in important_lines[-10:]:
                        if line.strip():
                            logger.info(f"Output: {line.strip()}")
                return True
            else:
                logger.error(f"❌ Failed: {description}")
                logger.error(f"Error: {result.stderr}")
                return False

    except Exception as e:
        logger.error(f"💥 Exception in {description}: {str(e)}")
        return False


def check_hdfs_status() -> bool:
    """Check if HDFS is available and running."""
    try:
        result = subprocess.run(['hdfs', 'dfsadmin', '-report'],
                                capture_output=True, text=True)
        if result.returncode == 0:
            logger.info("✅ HDFS is available and running")
            return True
        else:
            logger.warning("⚠️  HDFS may not be available")
            return False
    except FileNotFoundError:
        logger.warning(
            "⚠️  HDFS command not found - HDFS integration will be skipped")
        return False
    except Exception as e:
        logger.warning(f"⚠️  HDFS status check failed: {str(e)}")
        return False


def check_dataset_directory():
    """Check if the dataset directory exists and list contents."""
    dataset_dir = os.path.join(os.path.dirname(os.path.dirname(
        os.path.dirname(os.path.abspath(__file__)))), "datasets")

    if os.path.exists(dataset_dir):
        logger.info(f"📁 Dataset directory found: {dataset_dir}")
        files = os.listdir(dataset_dir)
        logger.info(f"📋 Available files: {len(files)} items")

        # Count different types of files
        csv_files = [f for f in files if f.endswith('.csv')]
        json_files = [f for f in files if f.endswith('.json')]
        zip_files = [f for f in files if f.endswith('.zip')]

        logger.info(f"  📄 CSV files: {len(csv_files)}")
        logger.info(f"  📄 JSON files: {len(json_files)}")
        logger.info(f"  📦 ZIP files: {len(zip_files)}")

        return True
    else:
        logger.warning(f"⚠️  Dataset directory not found: {dataset_dir}")
        return False


def validate_database():
    """Basic database validation."""
    try:
        # Import database components
        from config.database import AsyncSessionFactory
        from models.base import Base
        from models.place import Place
        from models.bus_stops import BusStop
        from models.olympic_venue import OlympicVenue

        async def check_tables():
            async with AsyncSessionFactory() as db:
                try:
                    # Check Places table
                    from sqlalchemy import select
                    result = await db.execute(select(Place))
                    places_count = len(result.all())

                    # Check Bus Stops table
                    result = await db.execute(select(BusStop))
                    stops_count = len(result.all())

                    # Check Olympic Venues table
                    result = await db.execute(select(OlympicVenue))
                    venues_count = len(result.all())

                    logger.info(f"📊 Database validation:")
                    logger.info(f"  🏢 Places: {places_count} records")
                    logger.info(f"  🚌 Bus/Rail Stops: {stops_count} records")
                    logger.info(
                        f"  🏟️  Olympic Venues: {venues_count} records")

                    return places_count + stops_count + venues_count > 0

                except Exception as e:
                    logger.error(f"Database validation error: {str(e)}")
                    return False

        return asyncio.run(check_tables())

    except Exception as e:
        logger.error(f"Database validation failed: {str(e)}")
        return False


def main():
    """Main function to orchestrate the complete dataset pipeline."""

    start_time = datetime.now()
    logger.info("="*80)
    logger.info("🏟️  NAVIGATE LA-28 COMPLETE DATASET PIPELINE")
    logger.info("="*80)
    logger.info(f"Started at: {start_time}")

    # Check prerequisites
    hdfs_available = check_hdfs_status()
    dataset_dir_exists = check_dataset_directory()

    # Define pipeline stages
    pipeline_stages = [
        {
            'script': 'server/scripts/download_and_prepare_datasets.py',
            'description': 'Download and prepare all verified datasets',
            'critical': True,
            'use_asyncio': False
        },
        {
            'script': 'server/scripts/populate_datasets_comprehensive.py',
            'description': 'Populate database with all processed datasets',
            'critical': True,
            'use_asyncio': True
        }
    ]

    # Track results
    successful_stages = []
    failed_stages = []
    total_processing_time = {}

    # Run each pipeline stage
    for stage_info in pipeline_stages:
        script_path = stage_info['script']
        description = stage_info['description']
        is_critical = stage_info['critical']
        use_asyncio = stage_info.get('use_asyncio', False)

        # Check if script exists
        if not os.path.exists(script_path):
            logger.warning(f"⚠️  Script not found: {script_path}")
            failed_stages.append(description)
            continue

        # Time the stage
        stage_start = datetime.now()

        # Run the stage
        success = run_script(script_path, description, use_asyncio)

        stage_end = datetime.now()
        stage_duration = stage_end - stage_start
        total_processing_time[description] = stage_duration

        if success:
            successful_stages.append(description)
            logger.info(f"⏱️  {description} completed in {stage_duration}")
        else:
            failed_stages.append(description)

            # If critical stage fails, consider stopping
            if is_critical:
                logger.error(f"💥 Critical stage failed: {description}")
                logger.error("Consider fixing this issue before continuing")
                # Uncomment to stop on critical failures
                # break

    # Validate results
    logger.info("🔍 Running validation checks...")

    # Check dataset files
    dataset_validation = check_dataset_directory()

    # Check database population
    database_validation = validate_database()

    # Final summary
    end_time = datetime.now()
    total_duration = end_time - start_time

    logger.info("="*80)
    logger.info("📊 COMPLETE PIPELINE SUMMARY")
    logger.info("="*80)
    logger.info(f"Completed at: {end_time}")
    logger.info(f"Total duration: {total_duration}")

    logger.info(
        f"\n✅ Successfully completed stages ({len(successful_stages)}):")
    for stage in successful_stages:
        duration = total_processing_time.get(stage, "Unknown")
        logger.info(f"  • {stage} ({duration})")

    if failed_stages:
        logger.warning(f"\n❌ Failed stages ({len(failed_stages)}):")
        for stage in failed_stages:
            logger.warning(f"  • {stage}")

    # System status
    logger.info(f"\n🔧 SYSTEM STATUS:")
    logger.info(
        f"  📁 Dataset directory: {'✅ Available' if dataset_dir_exists else '❌ Missing'}")
    logger.info(
        f"  🗄️  HDFS integration: {'✅ Available' if hdfs_available else '⚠️  Not available'}")
    logger.info(
        f"  🗃️  Database validation: {'✅ Passed' if database_validation else '❌ Failed'}")

    # Next steps
    logger.info(f"\n🚀 NEXT STEPS:")
    if all([successful_stages, dataset_validation, database_validation]):
        logger.info("✅ Pipeline completed successfully!")
        logger.info(
            "1. Start the FastAPI server: cd server && uvicorn main:app --reload")
        logger.info("2. Start the React frontend: cd client && npm start")
        logger.info("3. Test API endpoints for data access")

        # Show some example API endpoints
        logger.info(f"\n🌐 API ENDPOINTS TO TEST:")
        logger.info(
            "  GET /api/places - Get all places (parks, restrooms, POIs)")
        logger.info("  GET /api/bus-stops - Get all bus/rail stops")
        logger.info("  GET /api/venues - Get Olympic venues")
        logger.info("  GET /api/analytics/* - Get analytics data")

    else:
        logger.warning("⚠️  Pipeline completed with issues")
        logger.info("1. Check the logs above for specific errors")
        logger.info("2. Re-run individual scripts if needed")
        logger.info("3. Verify dataset files and database connections")

    # Exit with appropriate code
    if failed_stages and not successful_stages:
        logger.error("💥 All pipeline stages failed!")
        sys.exit(1)
    elif failed_stages:
        logger.warning("⚠️  Some stages failed, but others succeeded")
        sys.exit(2)
    else:
        logger.info("🎉 All pipeline stages completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
