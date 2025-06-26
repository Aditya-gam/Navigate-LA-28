# server/schemas/base.py

# Import necessary modules from Pydantic
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict, List
from datetime import datetime

# Base configuration for all Pydantic models


class BaseSchema(BaseModel):
    """
    Base schema class that provides common configuration for all Pydantic models.

    This class serves as the foundation for all other schema classes in the application.
    It provides:
        - Common configuration settings
        - Shared utility methods
        - Standard field types and validations

    Attributes:
        model_config (ConfigDict): Configuration for the Pydantic model
            - from_attributes (bool): Enables Pydantic models to work seamlessly with SQLAlchemy
            - json_encoders (dict): Custom JSON encoders for specific data types
            - validate_assignment (bool): Validates data when attributes are assigned
            - arbitrary_types_allowed (bool): Allows arbitrary types in the model
    """

    model_config = ConfigDict(
        # Enables ORM mode to allow direct interaction with SQLAlchemy models
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        },
        validate_assignment=True,
        arbitrary_types_allowed=True
    )

    def dict(self, *args, **kwargs) -> Dict[str, Any]:
        """
        Convert the model to a dictionary.

        Args:
            *args: Additional arguments to pass to the parent dict method
            **kwargs: Additional keyword arguments to pass to the parent dict method

        Returns:
            Dict[str, Any]: Dictionary representation of the model
        """
        return super().model_dump(*args, **kwargs)

    def json(self, *args, **kwargs) -> str:
        """
        Convert the model to a JSON string.

        Args:
            *args: Additional arguments to pass to the parent json method
            **kwargs: Additional keyword arguments to pass to the parent json method

        Returns:
            str: JSON string representation of the model
        """
        return super().model_dump_json(*args, **kwargs)
