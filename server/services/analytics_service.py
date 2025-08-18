# server/services/analytics_service.py

import pandas as pd  # For handling dataframes
import asyncio  # For asynchronous programming
from sqlalchemy import text  # For raw SQL queries
# For async database interactions
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from yarl import URL as MultiHostUrl  # For handling multi-host URLs
import os  # For accessing environment variables
from dotenv import load_dotenv  # For loading environment variables from a .env file
import logging  # For logging messages

# Load environment variables from .env file
load_dotenv()

# Set up logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConfig:
    """
    Configuration class for the PostgreSQL database.

    Attributes:
        POSTGRES_USER (str): Database username.
        POSTGRES_PASSWORD (str): Database password.
        POSTGRES_HOST (str): Database host.
        POSTGRES_PORT (str): Database port.
        POSTGRES_DB (str): Name of the database.
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


class AnalyticsService:
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

    async def _fetch_table_data(self, table_name: str) -> pd.DataFrame:
        """Fetch data from a table asynchronously"""
        async with self.async_session_factory() as session:
            try:
                query = text(f"SELECT * FROM {table_name}")
                result = await session.execute(query)
                return pd.DataFrame(result.fetchall(), columns=result.keys())
            except Exception as e:
                logger.error(
                    f"Error fetching data from {table_name}: {str(e)}")
                raise

    async def _load_data(self):
        """Load data from database into Pandas DataFrames"""
        # Fetch all data concurrently
        tables = ["users", "reviews", "bus_route_usage", "bus_stops", "places"]
        data = await asyncio.gather(
            *[self._fetch_table_data(table) for table in tables]
        )

        # Create Pandas DataFrames
        self.users_df = data[0]
        self.reviews_df = data[1]
        self.bus_route_usage_df = data[2]
        self.bus_stops_df = data[3]
        self.places_df = data[4]

        # Convert date columns to datetime if they exist
        if 'dob' in self.users_df.columns:
            self.users_df['dob'] = pd.to_datetime(
                self.users_df['dob'], errors='coerce')

    def analyze_top_attractions(self):
        """Analyze most reviewed attractions using pandas"""
        # Merge reviews with places
        merged_df = pd.merge(
            self.reviews_df,
            self.places_df,
            left_on='place_id',
            right_on='id',
            how='inner'
        )

        # Group by place and calculate metrics
        result = merged_df.groupby(['place_id', 'name', 'category', 'latitude', 'longitude']).agg({
            'id_x': 'count',  # review count
            'rating': 'mean',  # average rating
            'rating': lambda x: (x >= 4).mean()  # high rating ratio
        }).reset_index()

        # Rename columns
        result.columns = ['place_id', 'name', 'category', 'latitude',
                          'longitude', 'review_count', 'avg_rating', 'high_rating_ratio']

        # Round values
        result['avg_rating'] = result['avg_rating'].round(2)
        result['high_rating_ratio'] = result['high_rating_ratio'].round(2)

        # Sort by review count and add rank
        result = result.sort_values(
            'review_count', ascending=False).reset_index(drop=True)
        result['rank'] = result.index + 1

        return result

    def analyze_user_demographics(self):
        """Analyze user demographics and their platform usage using pandas"""
        # Calculate age from date of birth
        if 'dob' in self.users_df.columns:
            current_year = pd.Timestamp.now().year
            self.users_df['age'] = current_year - \
                pd.to_datetime(self.users_df['dob']).dt.year

            # Create age groups
            def get_age_group(age):
                if pd.isna(age):
                    return 'Unknown'
                elif age < 25:
                    return '18-24'
                elif age < 35:
                    return '25-34'
                elif age < 45:
                    return '35-44'
                elif age < 55:
                    return '45-54'
                else:
                    return '55+'

            self.users_df['age_group'] = self.users_df['age'].apply(
                get_age_group)
        else:
            self.users_df['age_group'] = 'Unknown'

        # Age-based analysis
        age_reviews = pd.merge(
            self.users_df,
            self.reviews_df,
            left_on='id',
            right_on='user_id',
            how='left'
        ).groupby('age_group').agg({
            'rating': ['count', 'mean'],
            'user_id': 'nunique'
        }).reset_index()

        # Flatten column names
        age_reviews.columns = [
            'age_group', 'total_reviews', 'avg_rating', 'active_reviewers']
        age_reviews['avg_rating'] = age_reviews['avg_rating'].round(2)
        age_reviews = age_reviews[age_reviews['total_reviews'] > 0].sort_values(
            'total_reviews', ascending=False)

        age_bus_usage = pd.merge(
            self.users_df,
            self.bus_route_usage_df,
            left_on='id',
            right_on='user_id',
            how='left'
        ).groupby('age_group').agg({
            'id_x': 'count',
            'user_id': 'nunique'
        }).reset_index()

        age_bus_usage.columns = ['age_group', 'total_trips', 'active_riders']
        age_bus_usage['trips_per_user'] = (
            age_bus_usage['total_trips'] / age_bus_usage['active_riders']).round(1)
        age_bus_usage = age_bus_usage[age_bus_usage['active_riders'] > 0].sort_values(
            'total_trips', ascending=False)

        # Country-based analysis
        country_reviews = pd.merge(
            self.users_df,
            self.reviews_df,
            left_on='id',
            right_on='user_id',
            how='left'
        ).groupby('country').agg({
            'rating': ['count', 'mean'],
            'user_id': 'nunique'
        }).reset_index()

        country_reviews.columns = [
            'country', 'total_reviews', 'avg_rating', 'active_reviewers']
        country_reviews['avg_rating'] = country_reviews['avg_rating'].round(2)
        country_reviews = country_reviews[country_reviews['total_reviews'] > 0].sort_values(
            'total_reviews', ascending=False)

        country_bus_usage = pd.merge(
            self.users_df,
            self.bus_route_usage_df,
            left_on='id',
            right_on='user_id',
            how='left'
        ).groupby('country').agg({
            'id_x': 'count',
            'user_id': 'nunique'
        }).reset_index()

        country_bus_usage.columns = ['country', 'total_trips', 'active_riders']
        country_bus_usage['trips_per_user'] = (
            country_bus_usage['total_trips'] / country_bus_usage['active_riders']).round(1)
        country_bus_usage = country_bus_usage[country_bus_usage['active_riders'] > 0].sort_values(
            'total_trips', ascending=False)

        return {
            "age": {"reviews": age_reviews, "bus_usage": age_bus_usage},
            "country": {"reviews": country_reviews, "bus_usage": country_bus_usage},
        }

    def analyze_bus_patterns(self):
        """Analyze bus usage patterns using pandas"""
        # Most frequent routes
        frequent_routes = pd.merge(
            self.bus_route_usage_df,
            self.bus_stops_df,
            left_on='origin_stop_id',
            right_on='id',
            how='inner'
        ).merge(
            self.bus_stops_df,
            left_on='destination_stop_id',
            right_on='id',
            how='inner',
            suffixes=('_origin', '_destination')
        ).groupby(['line', 'stop_name_origin', 'stop_name_destination']).agg({
            'id_x': 'count',
            'user_id': 'nunique'
        }).reset_index()

        frequent_routes.columns = ['line', 'origin_stop_name',
                                   'destination_stop_name', 'trip_count', 'unique_users']
        frequent_routes = frequent_routes.sort_values(
            'trip_count', ascending=False)

        # Line popularity
        line_popularity = pd.merge(
            self.bus_route_usage_df,
            self.bus_stops_df,
            left_on='origin_stop_id',
            right_on='id',
            how='inner'
        ).groupby('line').agg({
            'id_x': 'count',
            'user_id': 'nunique',
            'origin_stop_id': 'nunique'
        }).reset_index()

        line_popularity.columns = [
            'line', 'total_trips', 'unique_users', 'stops_used']
        line_popularity = line_popularity.sort_values(
            'total_trips', ascending=False)

        return frequent_routes, line_popularity

    def analyze_geographic_distribution(self):
        """Analyze geographic distribution using pandas"""
        # User distribution by country with review counts
        user_distribution = pd.merge(
            self.users_df,
            self.reviews_df[['id', 'user_id', 'rating']].rename(
                columns={'id': 'review_id'}),
            left_on='id',
            right_on='user_id',
            how='left'
        ).groupby('country').agg({
            'id': 'nunique',  # Count distinct users
            'review_id': 'nunique',  # Count distinct reviews
            'rating': lambda x: x.notna().mean()  # Average reviews per user
        }).reset_index()

        user_distribution.columns = [
            'country', 'user_count', 'active_users', 'avg_reviews_per_user']
        user_distribution['avg_reviews_per_user'] = user_distribution['avg_reviews_per_user'].round(
            2)
        user_distribution = user_distribution.sort_values(
            'user_count', ascending=False)

        # Popular bus stops
        popular_stops = pd.merge(
            self.bus_route_usage_df,
            self.bus_stops_df[['id', 'stop_name', 'line', 'latitude', 'longitude']].rename(
                columns={'id': 'stop_id'}),
            left_on='origin_stop_id',
            right_on='stop_id',
            how='inner'
        ).groupby(['stop_name', 'line', 'latitude', 'longitude']).agg({
            'id_x': 'count',
            'user_id': 'nunique'
        }).reset_index()

        popular_stops.columns = [
            'stop_name', 'line', 'latitude', 'longitude', 'usage_count', 'unique_users']
        popular_stops = popular_stops.sort_values(
            'usage_count', ascending=False)

        return user_distribution, popular_stops

    async def get_top_attractions(self, min_rating=None, category=None, limit=10):
        """Get top attractions with optional filters"""
        try:
            await self._load_data()
            query = self.analyze_top_attractions()

            if min_rating is not None:
                query = query[query['avg_rating'] >= min_rating]
            if category:
                query = query[query['category'] == category]

            result_df = query.head(limit)
            return self._convert_to_json_serializable(result_df)
        except Exception as e:
            logger.error(f"Error in get_top_attractions: {str(e)}")
            raise

    async def get_user_demographics(self):
        """Get user demographics analysis"""
        try:
            await self._load_data()
            demographics = self.analyze_user_demographics()

            return {
                "age": {
                    "reviews": self._convert_to_json_serializable(
                        demographics["age"]["reviews"]
                    ),
                    "bus_usage": self._convert_to_json_serializable(
                        demographics["age"]["bus_usage"]
                    ),
                },
                "country": {
                    "reviews": self._convert_to_json_serializable(
                        demographics["country"]["reviews"]
                    ),
                    "bus_usage": self._convert_to_json_serializable(
                        demographics["country"]["bus_usage"]
                    ),
                },
            }
        except Exception as e:
            logger.error(f"Error in get_user_demographics: {str(e)}")
            raise

    async def get_bus_routes_analysis(self, min_trips=None, limit=10):
        """Get bus routes analysis with optional filters"""
        try:
            await self._load_data()
            frequent_routes, line_popularity = self.analyze_bus_patterns()

            if min_trips is not None:
                frequent_routes = frequent_routes[frequent_routes['trip_count'] >= min_trips]
                line_popularity = line_popularity[line_popularity['total_trips'] >= min_trips]

            return {
                "frequent_routes": self._convert_to_json_serializable(
                    frequent_routes.head(limit)
                ),
                "line_popularity": self._convert_to_json_serializable(
                    line_popularity.head(limit)
                ),
            }
        except Exception as e:
            logger.error(f"Error in get_bus_routes_analysis: {str(e)}")
            raise

    async def get_popular_stops(self, min_usage=None, line=None, limit=10):
        """Get popular bus stops with optional filters"""
        try:
            await self._load_data()
            _, popular_stops = self.analyze_geographic_distribution()

            if min_usage is not None:
                popular_stops = popular_stops[popular_stops['usage_count'] >= min_usage]
            if line:
                popular_stops = popular_stops[popular_stops['line'] == line]

            result_df = popular_stops.head(limit)
            return self._convert_to_json_serializable(result_df)
        except Exception as e:
            logger.error(f"Error in get_popular_stops: {str(e)}")
            raise

    async def get_geographic_distribution(self):
        """Get geographic distribution of users"""
        try:
            await self._load_data()
            user_distribution, _ = self.analyze_geographic_distribution()
            return self._convert_to_json_serializable(user_distribution)
        except Exception as e:
            logger.error(f"Error in get_geographic_distribution: {str(e)}")
            raise

    def _convert_to_json_serializable(self, df):
        """Convert Pandas DataFrame to JSON serializable format"""
        if df is None or df.empty:
            return []

        # Convert DataFrame to records and handle numpy types
        return df.astype(object).to_dict(orient="records")


analytics_service = AnalyticsService()
