# 🧪 Navigate LA 28 - Testing Guide

**Guide Version:** 1.0  
**Last Updated:** January 15, 2024  
**Testing Framework:** Jest, Pytest, React Testing Library

---

## 📋 **Table of Contents**

- [Testing Strategy](#-testing-strategy)
- [Testing Environments](#-testing-environments)
- [Backend Testing](#-backend-testing)
- [Frontend Testing](#-frontend-testing)
- [Integration Testing](#-integration-testing)
- [Performance Testing](#-performance-testing)
- [Security Testing](#-security-testing)
- [Test Data Management](#-test-data-management)

---

## 🎯 **Testing Strategy**

### **Testing Pyramid**
```
                    E2E Tests (5%)
                 ↗ Slow, Expensive ↖
              Integration Tests (15%)
           ↗ Medium Speed, Medium Cost ↖
        Unit Tests (80%)
     ↗ Fast, Cheap, Reliable ↖
```

### **Test Types & Coverage Goals**
| Test Type | Coverage Goal | Tools | Frequency |
|-----------|---------------|-------|-----------|
| **Unit Tests** | 80%+ | Jest, Pytest | Every commit |
| **Integration Tests** | 70%+ | Jest, Pytest, TestClient | Every PR |
| **E2E Tests** | Key user flows | Playwright, Cypress | Nightly |
| **Performance Tests** | Critical paths | Artillery, Locust | Weekly |
| **Security Tests** | All endpoints | Bandit, ESLint | Every deployment |

---

## 🛠️ **Testing Environments**

### **Environment Setup**
```bash
# Backend testing environment
cd server
python -m venv test_env
source test_env/bin/activate
pip install -r requirements.txt
pip install pytest pytest-cov pytest-asyncio

# Frontend testing environment  
cd client
npm install
npm run test:setup
```

### **Test Configuration**

#### **Backend (pytest.ini)**
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = 
    -ra
    --strict-markers
    --strict-config
    --cov=server
    --cov-report=term-missing
    --cov-report=html
    --cov-fail-under=80
asyncio_mode = auto
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
    security: marks tests as security tests
```

#### **Frontend (jest.config.js)**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
};
```

---

## 🐍 **Backend Testing**

### **Unit Tests**
```python
# tests/unit/test_place_service.py
import pytest
from unittest.mock import Mock, AsyncMock, patch
from server.services.place_service import PlaceService
from server.models.place import Place
from server.schemas.place import PlaceCreate

class TestPlaceService:
    @pytest.fixture
    def place_service(self):
        return PlaceService()
    
    @pytest.fixture
    def sample_place_data(self):
        return PlaceCreate(
            name="Test Restaurant",
            description="A great place to eat",
            latitude=34.0522,
            longitude=-118.2437,
            category="restaurant"
        )

    @pytest.mark.asyncio
    async def test_create_place_success(self, place_service, sample_place_data):
        """Test successful place creation."""
        # Arrange
        expected_place = Place(id="place_123", **sample_place_data.dict())
        
        with patch('server.models.place.Place.create') as mock_create:
            mock_create.return_value = expected_place
            
            # Act
            result = await place_service.create(sample_place_data)
            
            # Assert
            assert result.name == sample_place_data.name
            assert result.latitude == sample_place_data.latitude
            mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_places_with_geospatial_filter(self, place_service):
        """Test place search with geospatial filtering."""
        # Arrange
        search_params = {
            "query": "restaurant",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "radius": 1000
        }
        
        expected_places = [
            Place(id="place_1", name="Restaurant 1", latitude=34.0520, longitude=-118.2435),
            Place(id="place_2", name="Restaurant 2", latitude=34.0525, longitude=-118.2440)
        ]
        
        with patch('server.services.place_service.PlaceService._execute_geospatial_search') as mock_search:
            mock_search.return_value = expected_places
            
            # Act
            results = await place_service.search_nearby(search_params)
            
            # Assert
            assert len(results) == 2
            assert all(place.name.startswith("Restaurant") for place in results)
            mock_search.assert_called_once_with(search_params)
```

### **API Tests**
```python
# tests/api/test_place_routes.py
import pytest
from httpx import AsyncClient
from server.main import app
from server.models.user import User

@pytest.mark.asyncio
async def test_search_places_api():
    """Test place search API endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
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
        
        # Validate response structure
        assert "places" in data
        assert "pagination" in data
        assert isinstance(data["places"], list)
        assert "total" in data["pagination"]

@pytest.mark.asyncio
async def test_create_place_requires_authentication():
    """Test that place creation requires authentication."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        place_data = {
            "name": "New Restaurant",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "category": "restaurant"
        }
        
        response = await client.post("/places/", json=place_data)
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_place_with_authentication(authenticated_client):
    """Test place creation with valid authentication."""
    place_data = {
        "name": "New Restaurant",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "category": "restaurant"
    }
    
    response = await authenticated_client.post("/places/", json=place_data)
    
    if response.status_code == 201:
        data = response.json()
        assert data["place"]["name"] == "New Restaurant"
        assert data["place"]["category"] == "restaurant"
```

### **Database Tests**
```python
# tests/database/test_place_model.py
import pytest
from server.models.place import Place
from server.database import get_test_db

@pytest.mark.asyncio
async def test_place_creation():
    """Test place model creation and persistence."""
    place_data = {
        "name": "Test Restaurant",
        "description": "A test restaurant",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "category": "restaurant"
    }
    
    # Create place
    place = await Place.create(**place_data)
    assert place.id is not None
    assert place.name == "Test Restaurant"
    
    # Verify persistence
    retrieved_place = await Place.get(place.id)
    assert retrieved_place.name == place.name
    assert retrieved_place.latitude == place.latitude

@pytest.mark.asyncio
async def test_geospatial_query():
    """Test geospatial queries using PostGIS."""
    # Create test places
    places = [
        await Place.create(
            name=f"Place {i}",
            latitude=34.0522 + (i * 0.001),
            longitude=-118.2437 + (i * 0.001),
            category="restaurant"
        )
        for i in range(5)
    ]
    
    # Search within radius
    nearby_places = await Place.find_within_radius(
        latitude=34.0522,
        longitude=-118.2437,
        radius_meters=200
    )
    
    assert len(nearby_places) >= 1
    assert all(place.name.startswith("Place") for place in nearby_places)
```

---

## ⚛️ **Frontend Testing**

### **Component Tests**
```tsx
// src/components/__tests__/PlaceCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PlaceCard } from '../PlaceCard';
import { createTestStore } from '../../utils/testUtils';

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('PlaceCard', () => {
  const mockPlace = {
    id: 'place_123',
    name: 'Grand Central Market',
    description: 'Historic food hall',
    category: 'restaurant',
    location: {
      latitude: 34.0505,
      longitude: -118.2489,
      address: '317 S Broadway, Los Angeles, CA 90013'
    },
    rating: {
      average: 4.5,
      count: 150
    },
    features: {
      wheelchair_accessible: true,
      parking_available: true
    }
  };

  it('renders place information correctly', () => {
    renderWithProviders(<PlaceCard place={mockPlace} />);
    
    expect(screen.getByText('Grand Central Market')).toBeInTheDocument();
    expect(screen.getByText('Historic food hall')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('150 reviews')).toBeInTheDocument();
  });

  it('displays accessibility indicators', () => {
    renderWithProviders(<PlaceCard place={mockPlace} />);
    
    expect(screen.getByLabelText('Wheelchair accessible')).toBeInTheDocument();
    expect(screen.getByLabelText('Parking available')).toBeInTheDocument();
  });

  it('handles click events correctly', async () => {
    const mockOnClick = jest.fn();
    renderWithProviders(<PlaceCard place={mockPlace} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('place-card');
    fireEvent.click(card);
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledWith(mockPlace);
    });
  });
});
```

### **Hook Tests**
```tsx
// src/hooks/__tests__/useGeolocation.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
});

describe('useGeolocation', () => {
  beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockClear();
  });

  it('should get current position successfully', async () => {
    const mockPosition = {
      coords: {
        latitude: 34.0522,
        longitude: -118.2437,
        accuracy: 10,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success(mockPosition)
    );

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentPosition();
    });

    expect(result.current.position).toEqual({
      latitude: 34.0522,
      longitude: -118.2437,
      accuracy: 10,
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle geolocation errors', async () => {
    const mockError = {
      code: 1,
      message: 'User denied Geolocation',
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) =>
      error(mockError)
    );

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getCurrentPosition();
    });

    expect(result.current.position).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });
});
```

### **Redux Tests**
```tsx
// src/store/__tests__/placeSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import placeReducer, { searchPlaces, clearResults } from '../slices/placeSlice';
import { placeService } from '../../services/placeService';

// Mock the place service
jest.mock('../../services/placeService');
const mockPlaceService = placeService as jest.Mocked<typeof placeService>;

describe('placeSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        places: placeReducer,
      },
    });
  });

  it('should handle clearResults', () => {
    // Add some initial state
    store.dispatch(searchPlaces.fulfilled({
      places: [{ id: '1', name: 'Test Place' }],
      pagination: { total: 1, limit: 20, offset: 0 }
    }, '', { query: 'test' }));

    // Clear results
    store.dispatch(clearResults());

    const state = store.getState().places;
    expect(state.results).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('should handle searchPlaces.pending', () => {
    store.dispatch(searchPlaces.pending('', { query: 'test' }));

    const state = store.getState().places;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle searchPlaces.fulfilled', () => {
    const mockResults = {
      places: [
        { id: '1', name: 'Test Place 1' },
        { id: '2', name: 'Test Place 2' }
      ],
      pagination: { total: 2, limit: 20, offset: 0 }
    };

    store.dispatch(searchPlaces.fulfilled(mockResults, '', { query: 'test' }));

    const state = store.getState().places;
    expect(state.loading).toBe(false);
    expect(state.results).toEqual(mockResults.places);
    expect(state.error).toBeNull();
  });

  it('should handle searchPlaces.rejected', () => {
    const errorMessage = 'Search failed';
    store.dispatch(searchPlaces.rejected(
      { message: errorMessage, name: 'Error' },
      '',
      { query: 'test' }
    ));

    const state = store.getState().places;
    expect(state.loading).toBe(false);
    expect(state.results).toEqual([]);
    expect(state.error).toBe(errorMessage);
  });
});
```

---

## 🔗 **Integration Testing**

### **API Integration Tests**
```python
# tests/integration/test_place_flow.py
import pytest
from httpx import AsyncClient
from server.main import app

@pytest.mark.asyncio
async def test_complete_place_workflow():
    """Test complete workflow: create, search, update, delete place."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. Create a place
        place_data = {
            "name": "Integration Test Restaurant",
            "description": "Test restaurant for integration testing",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "category": "restaurant"
        }
        
        # Get auth token first
        auth_response = await client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "testpassword"
        })
        token = auth_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create place
        create_response = await client.post(
            "/places/", 
            json=place_data, 
            headers=headers
        )
        assert create_response.status_code == 201
        place_id = create_response.json()["place"]["id"]
        
        # 2. Search for the created place
        search_response = await client.get(
            "/places/search",
            params={"q": "Integration Test", "limit": 10}
        )
        assert search_response.status_code == 200
        places = search_response.json()["places"]
        assert any(place["id"] == place_id for place in places)
        
        # 3. Get place by ID
        get_response = await client.get(f"/places/{place_id}")
        assert get_response.status_code == 200
        retrieved_place = get_response.json()["place"]
        assert retrieved_place["name"] == place_data["name"]
        
        # 4. Update place
        update_data = {"description": "Updated description"}
        update_response = await client.patch(
            f"/places/{place_id}",
            json=update_data,
            headers=headers
        )
        assert update_response.status_code == 200
        assert update_response.json()["place"]["description"] == "Updated description"
        
        # 5. Delete place
        delete_response = await client.delete(f"/places/{place_id}", headers=headers)
        assert delete_response.status_code == 204
        
        # 6. Verify deletion
        get_deleted_response = await client.get(f"/places/{place_id}")
        assert get_deleted_response.status_code == 404
```

### **End-to-End Tests**
```typescript
// e2e/place-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Place Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should search for places and display results', async ({ page }) => {
    // Enter search query
    await page.fill('[data-testid="search-input"]', 'restaurants');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="place-card"]');
    
    // Verify search results
    const placeCards = await page.locator('[data-testid="place-card"]');
    await expect(placeCards).toHaveCountGreaterThan(0);
    
    // Check that results contain search term
    const firstCard = placeCards.first();
    await expect(firstCard).toContainText(/restaurant|food|dining/i);
  });

  test('should filter places by category', async ({ page }) => {
    // Open category filter
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="category-restaurant"]');
    
    // Search with filter applied
    await page.fill('[data-testid="search-input"]', 'food');
    await page.click('[data-testid="search-button"]');
    
    // Verify filtered results
    await page.waitForSelector('[data-testid="place-card"]');
    const placeCards = await page.locator('[data-testid="place-card"]');
    
    // All results should be restaurants
    const count = await placeCards.count();
    for (let i = 0; i < count; i++) {
      const card = placeCards.nth(i);
      await expect(card.locator('[data-testid="place-category"]')).toContainText('restaurant');
    }
  });

  test('should handle geolocation-based search', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 34.0522, longitude: -118.2437 });
    
    // Click "Near Me" button
    await page.click('[data-testid="near-me-button"]');
    
    // Wait for location-based results
    await page.waitForSelector('[data-testid="place-card"]');
    
    // Verify distance information is shown
    const firstCard = page.locator('[data-testid="place-card"]').first();
    await expect(firstCard.locator('[data-testid="place-distance"]')).toBeVisible();
  });
});
```

---

## ⚡ **Performance Testing**

### **Load Testing Configuration**
```yaml
# artillery.yml
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  variables:
    searchQueries:
      - "restaurants"
      - "attractions"
      - "hotels"
      - "entertainment"

scenarios:
  - name: "Search places"
    weight: 60
    flow:
      - get:
          url: "/places/search"
          qs:
            q: "{{ searchQueries[0] }}"
            lat: 34.0522
            lng: -118.2437
            limit: 20
      - think: 2

  - name: "Get place details"
    weight: 30
    flow:
      - get:
          url: "/places/search"
          qs:
            q: "restaurants"
            limit: 1
          capture:
            - json: "$.places[0].id"
              as: "placeId"
      - get:
          url: "/places/{{ placeId }}"
      - think: 5

  - name: "User authentication"
    weight: 10
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "testpassword"
          capture:
            - json: "$.access_token"
              as: "token"
      - get:
          url: "/users/profile"
          headers:
            Authorization: "Bearer {{ token }}"
```

### **Performance Benchmarks**
```python
# tests/performance/test_api_performance.py
import asyncio
import time
import pytest
from httpx import AsyncClient
from server.main import app

@pytest.mark.performance
@pytest.mark.asyncio
async def test_place_search_performance():
    """Test place search API performance under load."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Warm up
        await client.get("/places/search?q=test&limit=10")
        
        # Performance test
        start_time = time.time()
        tasks = []
        
        for i in range(100):  # 100 concurrent requests
            task = client.get("/places/search", params={
                "q": f"restaurant{i % 10}",
                "lat": 34.0522,
                "lng": -118.2437,
                "limit": 20
            })
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks)
        end_time = time.time()
        
        # Assertions
        total_time = end_time - start_time
        avg_response_time = total_time / len(responses)
        
        assert all(r.status_code == 200 for r in responses)
        assert avg_response_time < 0.5  # Average response time < 500ms
        assert total_time < 10  # All requests complete within 10 seconds
        
        print(f"Average response time: {avg_response_time:.3f}s")
        print(f"Total time for 100 requests: {total_time:.3f}s")
```

---

## 🔒 **Security Testing**

### **Authentication Tests**
```python
# tests/security/test_auth_security.py
import pytest
from httpx import AsyncClient
from server.main import app

@pytest.mark.security
@pytest.mark.asyncio
async def test_jwt_token_validation():
    """Test JWT token validation and security."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/users/profile", headers=invalid_headers)
        assert response.status_code == 401
        
        # Test with expired token
        expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired"
        expired_headers = {"Authorization": f"Bearer {expired_token}"}
        response = await client.get("/users/profile", headers=expired_headers)
        assert response.status_code == 401
        
        # Test without authorization header
        response = await client.get("/users/profile")
        assert response.status_code == 401

@pytest.mark.security
@pytest.mark.asyncio
async def test_sql_injection_protection():
    """Test protection against SQL injection attacks."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Attempt SQL injection in search query
        malicious_queries = [
            "'; DROP TABLE places; --",
            "' OR 1=1 --",
            "' UNION SELECT * FROM users --"
        ]
        
        for query in malicious_queries:
            response = await client.get("/places/search", params={"q": query})
            # Should not cause server error or expose data
            assert response.status_code in [200, 400, 422]
            if response.status_code == 200:
                data = response.json()
                # Verify no suspicious data returned
                assert "places" in data
                assert isinstance(data["places"], list)

@pytest.mark.security
@pytest.mark.asyncio
async def test_rate_limiting():
    """Test API rate limiting functionality."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Make rapid requests to trigger rate limiting
        responses = []
        for i in range(200):  # Exceed rate limit
            response = await client.get("/places/search?q=test")
            responses.append(response)
        
        # Should eventually receive 429 Too Many Requests
        status_codes = [r.status_code for r in responses]
        assert 429 in status_codes  # Rate limit triggered
```

---

## 📊 **Test Data Management**

### **Test Fixtures**
```python
# tests/fixtures/place_fixtures.py
import pytest
from server.models.place import Place
from server.models.user import User

@pytest.fixture
async def sample_places():
    """Create sample places for testing."""
    places = []
    place_data = [
        {
            "name": "Test Restaurant 1",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "category": "restaurant"
        },
        {
            "name": "Test Attraction 1", 
            "latitude": 34.0545,
            "longitude": -118.2455,
            "category": "attraction"
        },
        {
            "name": "Test Hotel 1",
            "latitude": 34.0500,
            "longitude": -118.2420,
            "category": "hotel"
        }
    ]
    
    for data in place_data:
        place = await Place.create(**data)
        places.append(place)
    
    yield places
    
    # Cleanup
    for place in places:
        await place.delete()

@pytest.fixture
async def test_user():
    """Create a test user."""
    user_data = {
        "username": "testuser",
        "email": "test@example.com", 
        "password": "securepassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    user = await User.create(**user_data)
    yield user
    await user.delete()
```

### **Test Database Management**
```python
# tests/conftest.py
import pytest
import asyncio
from server.database import create_test_database, drop_test_database

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Setup and teardown test database."""
    await create_test_database()
    yield
    await drop_test_database()

@pytest.fixture(autouse=True)
async def clean_database():
    """Clean database before each test."""
    # Clean up all tables
    from server.models import Place, User, Review
    await Place.delete_all()
    await User.delete_all()
    await Review.delete_all()
```

### **Running Tests**

#### **Backend Tests**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=server --cov-report=html

# Run specific test types
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m security      # Security tests only

# Run tests in parallel
pytest -n auto

# Run performance tests
pytest -m performance --durations=10
```

#### **Frontend Tests**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Update snapshots
npm test -- --updateSnapshot
```

---

*This testing guide ensures comprehensive coverage and quality assurance for the Navigate LA 28 platform. Regular updates reflect our evolving testing practices and tools.* 