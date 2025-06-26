# 👨‍💻 Navigate LA 28 - Developer Guide

**Guide Version:** 1.0  
**Last Updated:** January 15, 2024  
**Target Audience:** Software Developers, Contributors

---

## 📋 **Table of Contents**

- [Development Environment Setup](#-development-environment-setup)
- [Project Structure](#-project-structure)
- [Coding Standards](#-coding-standards)
- [Development Workflow](#-development-workflow)
- [Testing Guidelines](#-testing-guidelines)
- [API Development](#-api-development)
- [Frontend Development](#-frontend-development)
- [Database Development](#-database-development)
- [Performance Guidelines](#-performance-guidelines)
- [Debugging & Troubleshooting](#-debugging--troubleshooting)

---

## 🚀 **Development Environment Setup**

### **Quick Start**

#### **1. Prerequisites Installation**
```bash
# Install required tools
brew install docker node python git  # macOS
# OR
sudo apt install docker.io nodejs python3 git  # Ubuntu

# Verify installations
docker --version    # >= 20.10.x
node --version      # >= 18.x
python3 --version   # >= 3.10
git --version       # >= 2.30
```

#### **2. Repository Setup**
```bash
# Clone repository
git clone https://github.com/yourusername/Navigate-LA-28.git
cd Navigate-LA-28

# Setup development environment
./scripts/setup-dev.sh

# Start development services
docker-compose up -d
```

#### **3. IDE Configuration**

**VS Code Recommended Extensions:**
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-toolsai.jupyter",
    "ms-vscode.docker"
  ]
}
```

**VS Code Settings:**
```json
{
  "python.defaultInterpreterPath": "./server/venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

---

## 📁 **Project Structure**

### **Repository Overview**
```
Navigate-LA-28/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node dependencies
│   └── tsconfig.json      # TypeScript config
├── server/                # FastAPI backend application
│   ├── config/           # Configuration files
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── tests/            # Test files
│   ├── requirements.txt  # Python dependencies
│   └── main.py          # Application entry point
├── docs/                 # Documentation
├── scripts/              # Development scripts
├── hadoop/               # Hadoop configuration
├── spark/                # Spark configuration
├── docker-compose.yml    # Development orchestration
└── README.md            # Project overview
```

### **Frontend Architecture**
```
src/
├── components/
│   ├── common/           # Reusable components
│   ├── layout/           # Layout components
│   ├── features/         # Feature-specific components
│   └── ui/              # Basic UI components
├── hooks/
│   ├── useAuth.js       # Authentication hook
│   ├── useApi.js        # API interaction hook
│   └── useLocalStorage.js # Local storage hook
├── services/
│   ├── api.js           # API client
│   ├── auth.js          # Authentication service
│   └── mapService.js    # Map-related services
├── store/
│   ├── slices/          # Redux slices
│   ├── middleware/      # Custom middleware
│   └── store.js         # Store configuration
└── utils/
    ├── constants.js     # Application constants
    ├── helpers.js       # Helper functions
    └── validators.js    # Validation functions
```

### **Backend Architecture**
```
server/
├── config/
│   ├── database.py      # Database configuration
│   └── settings.py      # Application settings
├── models/
│   ├── base.py         # Base model class
│   ├── user.py         # User model
│   ├── place.py        # Place model
│   └── review.py       # Review model
├── routes/
│   ├── auth_routes.py  # Authentication endpoints
│   ├── user_routes.py  # User management
│   ├── geo_routes.py   # Geospatial endpoints
│   └── analytics_routes.py # Analytics endpoints
├── services/
│   ├── auth_service.py # Authentication logic
│   ├── geo_service.py  # Geospatial services
│   └── analytics_service.py # Analytics logic
├── schemas/
│   ├── user.py         # User schemas
│   ├── place.py        # Place schemas
│   └── response.py     # Response schemas
└── tests/
    ├── unit/           # Unit tests
    ├── integration/    # Integration tests
    └── fixtures/       # Test fixtures
```

---

## 📝 **Coding Standards**

### **Python Standards (Backend)**

#### **Code Style**
```python
# Use Black formatter (line length: 88 characters)
# Use isort for import sorting
# Follow PEP 8 guidelines

# Example function with proper docstring
async def get_user_by_id(user_id: str) -> Optional[User]:
    """
    Retrieve a user by their unique identifier.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        User object if found, None otherwise
        
    Raises:
        DatabaseError: If database connection fails
    """
    try:
        user = await User.get(user_id)
        return user
    except Exception as e:
        logger.error(f"Failed to retrieve user {user_id}: {e}")
        raise DatabaseError(f"User retrieval failed: {e}")
```

#### **Type Hints**
```python
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel

# Always use type hints
def process_places(
    places: List[Place], 
    filters: Optional[Dict[str, Any]] = None
) -> List[Place]:
    """Process and filter places based on criteria."""
    if filters is None:
        filters = {}
    
    return [place for place in places if matches_filters(place, filters)]

# Use Pydantic for data validation
class PlaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: str
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Grand Central Market",
                "description": "Historic food hall",
                "latitude": 34.0505,
                "longitude": -118.2489,
                "category": "restaurant"
            }
        }
```

#### **Error Handling**
```python
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

# Custom exception classes
class NotFoundError(Exception):
    """Raised when a resource is not found."""
    pass

class ValidationError(Exception):
    """Raised when data validation fails."""
    pass

# Proper error handling in routes
@router.get("/places/{place_id}")
async def get_place(place_id: str) -> PlaceResponse:
    try:
        place = await place_service.get_by_id(place_id)
        if not place:
            raise HTTPException(
                status_code=404,
                detail=f"Place with id {place_id} not found"
            )
        return PlaceResponse.from_orm(place)
    except ValidationError as e:
        logger.warning(f"Validation error for place {place_id}: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error retrieving place {place_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
```

### **JavaScript/TypeScript Standards (Frontend)**

#### **React Components**
```tsx
// Use TypeScript for all new components
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlaceCard } from './PlaceCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Place } from '../types/Place';

interface PlaceListProps {
  searchQuery: string;
  category?: string;
  onPlaceSelect: (place: Place) => void;
}

export const PlaceList: React.FC<PlaceListProps> = ({
  searchQuery,
  category,
  onPlaceSelect,
}) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const places = useSelector((state: RootState) => state.places.results);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        await dispatch(searchPlaces({ query: searchQuery, category }));
      } catch (error) {
        console.error('Failed to fetch places:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchPlaces();
    }
  }, [searchQuery, category, dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="place-list">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          onClick={() => onPlaceSelect(place)}
        />
      ))}
    </div>
  );
};
```

#### **Redux Slices**
```tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Place, PlaceSearchParams } from '../types/Place';
import { placeService } from '../services/placeService';

interface PlaceState {
  results: Place[];
  loading: boolean;
  error: string | null;
  searchParams: PlaceSearchParams | null;
}

const initialState: PlaceState = {
  results: [],
  loading: false,
  error: null,
  searchParams: null,
};

// Async thunk for searching places
export const searchPlaces = createAsyncThunk(
  'places/search',
  async (params: PlaceSearchParams, { rejectWithValue }) => {
    try {
      const response = await placeService.search(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const placeSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    },
    setSearchParams: (state, action: PayloadAction<PlaceSearchParams>) => {
      state.searchParams = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.places;
      })
      .addCase(searchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearResults, setSearchParams } = placeSlice.actions;
export default placeSlice.reducer;
```

#### **CSS Styling Guidelines**
```css
/* Use CSS custom properties for theming */
:root {
  --primary-color: #1976d2;
  --secondary-color: #dc004e;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Follow BEM methodology for class naming */
.place-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s ease;
}

.place-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.place-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.place-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.place-card__rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .place-card {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .place-card__title {
    font-size: 1.125rem;
  }
}
```

---

## 🔄 **Development Workflow**

### **Git Workflow**

#### **Branch Strategy**
```bash
# Main branches
main          # Production-ready code
develop       # Integration branch
staging       # Staging environment

# Feature branches
feature/user-authentication
feature/place-search
feature/analytics-dashboard

# Hotfix branches
hotfix/critical-security-fix
hotfix/database-connection-issue

# Release branches
release/v1.0.0
release/v1.1.0
```

#### **Commit Message Convention**
```bash
# Format: <type>(<scope>): <description>

# Types:
feat      # New feature
fix       # Bug fix
docs      # Documentation changes
style     # Code style changes (formatting, etc.)
refactor  # Code refactoring
test      # Adding or updating tests
chore     # Maintenance tasks

# Examples:
feat(auth): add JWT token refresh functionality
fix(search): resolve location search pagination issue
docs(api): update authentication endpoint documentation
test(places): add unit tests for place service
refactor(db): optimize geospatial query performance
```

#### **Pull Request Process**
```markdown
# Pull Request Template

## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Type definitions updated (if applicable)
```

### **Code Review Guidelines**

#### **What to Look For**
```markdown
## Code Quality
- [ ] Code is readable and well-documented
- [ ] Functions are small and focused
- [ ] Variable names are descriptive
- [ ] No commented-out code
- [ ] Error handling is appropriate

## Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] Caching is used where appropriate
- [ ] Large datasets are paginated

## Security
- [ ] Input validation is present
- [ ] No hardcoded secrets
- [ ] Authentication is properly implemented
- [ ] SQL injection prevention

## Testing
- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Test names are descriptive
- [ ] Mocks are used appropriately
```

---

## 🧪 **Testing Guidelines**

### **Backend Testing (Python)**

#### **Unit Tests**
```python
# tests/unit/test_place_service.py
import pytest
from unittest.mock import Mock, patch
from server.services.place_service import PlaceService
from server.models.place import Place

class TestPlaceService:
    @pytest.fixture
    def place_service(self):
        return PlaceService()
    
    @pytest.fixture
    def sample_place(self):
        return Place(
            id="place_123",
            name="Test Restaurant",
            latitude=34.0522,
            longitude=-118.2437,
            category="restaurant"
        )
    
    @pytest.mark.asyncio
    async def test_get_place_by_id_success(self, place_service, sample_place):
        """Test successful place retrieval by ID."""
        # Arrange
        with patch('server.models.place.Place.get') as mock_get:
            mock_get.return_value = sample_place
            
            # Act
            result = await place_service.get_by_id("place_123")
            
            # Assert
            assert result == sample_place
            mock_get.assert_called_once_with("place_123")
    
    @pytest.mark.asyncio
    async def test_get_place_by_id_not_found(self, place_service):
        """Test place retrieval when place doesn't exist."""
        # Arrange
        with patch('server.models.place.Place.get') as mock_get:
            mock_get.return_value = None
            
            # Act
            result = await place_service.get_by_id("nonexistent")
            
            # Assert
            assert result is None
            mock_get.assert_called_once_with("nonexistent")
    
    @pytest.mark.asyncio
    async def test_search_places_with_filters(self, place_service, sample_place):
        """Test place search with category filter."""
        # Arrange
        search_params = {
            "query": "restaurant",
            "category": "restaurant",
            "limit": 10
        }
        expected_results = [sample_place]
        
        with patch('server.services.place_service.PlaceService._execute_search') as mock_search:
            mock_search.return_value = expected_results
            
            # Act
            results = await place_service.search(search_params)
            
            # Assert
            assert len(results) == 1
            assert results[0] == sample_place
            mock_search.assert_called_once_with(search_params)
```

#### **Integration Tests**
```python
# tests/integration/test_place_api.py
import pytest
from httpx import AsyncClient
from server.main import app

@pytest.mark.asyncio
async def test_search_places_integration():
    """Test place search API endpoint integration."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test successful search
        response = await client.get(
            "/places/search",
            params={
                "q": "restaurant",
                "lat": 34.0522,
                "lng": -118.2437,
                "limit": 10
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "places" in data
        assert "pagination" in data
        assert isinstance(data["places"], list)

@pytest.mark.asyncio
async def test_get_place_by_id_integration():
    """Test get place by ID API endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test getting existing place
        response = await client.get("/places/place_123")
        
        if response.status_code == 200:
            data = response.json()
            assert "place" in data
            assert data["place"]["id"] == "place_123"
        else:
            # If place doesn't exist, should return 404
            assert response.status_code == 404
```

### **Frontend Testing (React)**

#### **Component Tests**
```tsx
// src/components/__tests__/PlaceCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlaceCard } from '../PlaceCard';
import { Place } from '../../types/Place';

const mockPlace: Place = {
  id: 'place_123',
  name: 'Test Restaurant',
  description: 'A great place to eat',
  category: 'restaurant',
  location: {
    latitude: 34.0522,
    longitude: -118.2437,
    address: '123 Test St, Los Angeles, CA 90012'
  },
  rating: {
    average: 4.5,
    count: 150
  }
};

describe('PlaceCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders place information correctly', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('A great place to eat')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(150 reviews)')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('place-card');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockPlace);
  });

  it('displays rating with correct formatting', () => {
    render(<PlaceCard place={mockPlace} onClick={mockOnClick} />);
    
    const ratingElement = screen.getByTestId('place-rating');
    expect(ratingElement).toHaveTextContent('4.5');
  });
});
```

#### **Hook Tests**
```tsx
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockAuthService.login.mockResolvedValue({ user: mockUser, token: 'token123' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should handle login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.login.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'wrongpassword');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });
});
```

---

## 🔧 **API Development**

### **FastAPI Best Practices**

#### **Route Structure**
```python
# routes/place_routes.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from server.schemas.place import PlaceResponse, PlaceCreate, PlaceUpdate
from server.services.place_service import PlaceService
from server.dependencies import get_current_user

router = APIRouter(prefix="/places", tags=["places"])

@router.get("/search", response_model=PlaceSearchResponse)
async def search_places(
    q: str = Query(..., description="Search query"),
    lat: Optional[float] = Query(None, description="Latitude for proximity search"),
    lng: Optional[float] = Query(None, description="Longitude for proximity search"),
    radius: int = Query(5000, ge=100, le=50000, description="Search radius in meters"),
    category: Optional[str] = Query(None, description="Place category"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Results offset"),
    place_service: PlaceService = Depends(),
):
    """
    Search for places with optional geospatial filtering.
    
    Returns a list of places matching the search criteria with pagination.
    """
    search_params = PlaceSearchParams(
        query=q,
        latitude=lat,
        longitude=lng,
        radius=radius,
        category=category,
        limit=limit,
        offset=offset
    )
    
    try:
        results = await place_service.search(search_params)
        return PlaceSearchResponse(
            places=results.places,
            pagination=results.pagination,
            search_metadata=results.metadata
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Place search failed: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@router.post("/", response_model=PlaceResponse, status_code=201)
async def create_place(
    place_data: PlaceCreate,
    current_user: User = Depends(get_current_user),
    place_service: PlaceService = Depends(),
):
    """
    Create a new place.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.can_create_places:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        place = await place_service.create(place_data, created_by=current_user.id)
        return PlaceResponse.from_orm(place)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Place creation failed: {e}")
        raise HTTPException(status_code=500, detail="Place creation failed")
```

#### **Dependency Injection**
```python
# dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from server.services.auth_service import AuthService
from server.models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends()
) -> User:
    """Get current authenticated user from JWT token."""
    try:
        token = credentials.credentials
        user = await auth_service.get_user_from_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure current user has admin privileges."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
```

---

## 🎨 **Frontend Development**

### **React Best Practices**

#### **Component Design Patterns**
```tsx
// Compound Component Pattern
interface TabsProps {
  children: React.ReactNode;
  defaultActiveTab?: string;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<TabsProps> & {
  List: typeof TabList;
  Tab: typeof Tab;
  Panel: typeof TabPanel;
} = ({ children, defaultActiveTab = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

const TabList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="tab-list" role="tablist">
    {children}
  </div>
);

const Tab: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      className={`tab ${isActive ? 'tab--active' : ''}`}
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

// Usage
<Tabs defaultActiveTab="places">
  <Tabs.List>
    <Tabs.Tab value="places">Places</Tabs.Tab>
    <Tabs.Tab value="transit">Transit</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="places">
    <PlacesList />
  </Tabs.Panel>
  <Tabs.Panel value="transit">
    <TransitInfo />
  </Tabs.Panel>
</Tabs>
```

#### **Custom Hooks**
```tsx
// useDebounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// useLocalStorage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Usage in component
const SearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('searchHistory', []);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery);
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [debouncedSearchQuery, ...prev.filter(q => q !== debouncedSearchQuery)];
        return newHistory.slice(0, 10); // Keep only last 10 searches
      });
    }
  }, [debouncedSearchQuery]);

  // ... rest of component
};
```

---

*This developer guide is continuously updated as our development practices evolve. For questions or suggestions, please reach out to the development team.* 