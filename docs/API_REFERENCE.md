# 🔌 Navigate LA 28 - API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000` (Development) | `https://api.navigate-la28.com` (Production)  
**Interactive Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📋 **Table of Contents**

- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Authentication Endpoints](#-authentication-endpoints)
- [User Management](#-user-management)
- [Places & Attractions](#-places--attractions)
- [Transit & Transportation](#-transit--transportation)
- [Analytics & Insights](#-analytics--insights)
- [Geospatial Services](#-geospatial-services)
- [Review System](#-review-system)

---

## 🔐 **Authentication**

Navigate LA 28 uses **JWT (JSON Web Tokens)** for authentication. Tokens are issued upon successful login and must be included in the `Authorization` header for protected endpoints.

### **Authentication Header**
```http
Authorization: Bearer <your-jwt-token>
```

### **Token Lifecycle**
- **Access Token Expiry:** 24 hours
- **Refresh Token Expiry:** 7 days
- **Token Storage:** httpOnly cookies (recommended) or localStorage

---

## ⚠️ **Error Handling**

All API endpoints return consistent error responses with appropriate HTTP status codes.

### **Error Response Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123def456"
  }
}
```

### **HTTP Status Codes**
| Code | Description | Usage |
|------|-------------|--------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

---

## 🚦 **Rate Limiting**

API endpoints are rate-limited to ensure fair usage and system stability.

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Search/Query | 50 requests | 1 minute |
| Analytics | 20 requests | 1 minute |

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704023400
```

---

## 🔑 **Authentication Endpoints**

### **POST /auth/register**
Register a new user account.

**Request Body:**
```json
{
  "username": "tourist_explorer",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-05-15",
  "country": "United States",
  "preferences": {
    "language": "en",
    "accessibility_needs": ["wheelchair_access"],
    "interests": ["sports", "culture", "food"]
  }
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "user_abc123",
    "username": "tourist_explorer",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-15T10:30:00Z",
    "is_verified": false
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

### **POST /auth/login**
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_abc123",
    "username": "tourist_explorer",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "last_login": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

### **POST /auth/refresh**
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### **POST /auth/logout**
Invalidate user session and tokens.

**Headers:** `Authorization: Bearer <token>`

**Response (204 No Content)**

---

## 👤 **User Management**

### **GET /users/profile**
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_abc123",
    "username": "tourist_explorer",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-05-15",
    "country": "United States",
    "created_at": "2024-01-15T10:30:00Z",
    "preferences": {
      "language": "en",
      "accessibility_needs": ["wheelchair_access"],
      "interests": ["sports", "culture", "food"],
      "notification_settings": {
        "email_notifications": true,
        "push_notifications": false
      }
    },
    "statistics": {
      "places_visited": 15,
      "reviews_written": 8,
      "total_distance_traveled": "45.2 km"
    }
  }
}
```

### **PUT /users/profile**
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "preferences": {
    "language": "es",
    "accessibility_needs": ["wheelchair_access", "visual_aid"],
    "interests": ["sports", "culture", "food", "history"]
  }
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_abc123",
    "username": "tourist_explorer",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "updated_at": "2024-01-15T11:30:00Z"
  }
}
```

---

## 🏛️ **Places & Attractions**

### **GET /places/search**
Search for places and attractions with advanced filtering.

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Place category (restaurant, attraction, hotel, etc.)
- `lat` (float): Latitude for proximity search
- `lng` (float): Longitude for proximity search
- `radius` (int): Search radius in meters (default: 5000, max: 50000)
- `min_rating` (float): Minimum rating (1.0-5.0)
- `accessibility` (boolean): Wheelchair accessible venues only
- `olympic_venue` (boolean): Olympic venues only
- `limit` (int): Results per page (default: 20, max: 100)
- `offset` (int): Results offset for pagination

**Example Request:**
```http
GET /places/search?q=restaurants&lat=34.0522&lng=-118.2437&radius=2000&min_rating=4.0&limit=10
```

**Response (200 OK):**
```json
{
  "places": [
    {
      "id": "place_xyz789",
      "name": "Grand Central Market",
      "description": "Historic food hall featuring diverse LA cuisine",
      "category": "restaurant",
      "subcategory": "food_court",
      "location": {
        "latitude": 34.0505,
        "longitude": -118.2489,
        "address": "317 S Broadway, Los Angeles, CA 90013",
        "neighborhood": "Downtown LA"
      },
      "rating": {
        "average": 4.2,
        "count": 1847,
        "distribution": {
          "5": 612,
          "4": 739,
          "3": 331,
          "2": 123,
          "1": 42
        }
      },
      "pricing": {
        "level": 2,
        "currency": "USD",
        "average_cost": 15
      },
      "features": {
        "wheelchair_accessible": true,
        "outdoor_seating": false,
        "parking_available": true,
        "wifi": true,
        "accepts_cards": true
      },
      "hours": {
        "monday": {"open": "08:00", "close": "22:00"},
        "tuesday": {"open": "08:00", "close": "22:00"},
        "wednesday": {"open": "08:00", "close": "22:00"},
        "thursday": {"open": "08:00", "close": "22:00"},
        "friday": {"open": "08:00", "close": "22:00"},
        "saturday": {"open": "08:00", "close": "22:00"},
        "sunday": {"open": "08:00", "close": "22:00"}
      },
      "distance": 845.2,
      "olympic_venue": false,
      "images": [
        "https://images.navigate-la28.com/places/grand-central-market-1.jpg",
        "https://images.navigate-la28.com/places/grand-central-market-2.jpg"
      ],
      "created_at": "2024-01-10T14:30:00Z",
      "updated_at": "2024-01-15T09:15:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 10,
    "offset": 0,
    "pages": 16,
    "current_page": 1
  },
  "search_metadata": {
    "query": "restaurants",
    "location": {
      "lat": 34.0522,
      "lng": -118.2437
    },
    "radius": 2000,
    "filters_applied": ["min_rating"],
    "execution_time_ms": 45
  }
}
```

### **GET /places/{place_id}**
Get detailed information about a specific place.

**Path Parameters:**
- `place_id` (string): Unique place identifier

**Response (200 OK):**
```json
{
  "place": {
    "id": "place_xyz789",
    "name": "Grand Central Market",
    "description": "Historic food hall featuring diverse LA cuisine since 1917. A cultural landmark offering everything from traditional Mexican tacos to gourmet coffee.",
    "category": "restaurant",
    "subcategory": "food_court",
    "location": {
      "latitude": 34.0505,
      "longitude": -118.2489,
      "address": "317 S Broadway, Los Angeles, CA 90013",
      "neighborhood": "Downtown LA",
      "postal_code": "90013"
    },
    "contact": {
      "phone": "+1-213-624-2378",
      "website": "https://grandcentralmarket.com",
      "email": "info@grandcentralmarket.com"
    },
    "rating": {
      "average": 4.2,
      "count": 1847
    },
    "pricing": {
      "level": 2,
      "currency": "USD",
      "average_cost": 15
    },
    "features": {
      "wheelchair_accessible": true,
      "outdoor_seating": false,
      "parking_available": true,
      "valet_parking": false,
      "wifi": true,
      "accepts_cards": true,
      "accepts_mobile_payment": true,
      "family_friendly": true,
      "pet_friendly": false
    },
    "hours": {
      "monday": {"open": "08:00", "close": "22:00", "is_closed": false},
      "tuesday": {"open": "08:00", "close": "22:00", "is_closed": false},
      "wednesday": {"open": "08:00", "close": "22:00", "is_closed": false},
      "thursday": {"open": "08:00", "close": "22:00", "is_closed": false},
      "friday": {"open": "08:00", "close": "22:00", "is_closed": false},
      "saturday": {"open": "08:00", "close": "22:00", "is_closed": false},
      "sunday": {"open": "08:00", "close": "22:00", "is_closed": false}
    },
    "olympic_venue": false,
    "nearby_transit": [
      {
        "type": "metro_station",
        "name": "Pershing Square Station",
        "distance": 0.3,
        "lines": ["Red Line", "Purple Line"]
      }
    ],
    "images": [
      {
        "url": "https://images.navigate-la28.com/places/grand-central-market-1.jpg",
        "caption": "Main entrance",
        "type": "exterior"
      }
    ],
    "reviews_summary": {
      "recent_reviews": 45,
      "positive_sentiment": 0.78,
      "common_keywords": ["food", "variety", "historic", "crowded", "authentic"]
    }
  }
}
```

### **GET /places/nearby**
Find places near a specific location.

**Query Parameters:**
- `lat` (float, required): Latitude
- `lng` (float, required): Longitude
- `radius` (int): Search radius in meters (default: 1000)
- `category` (string): Filter by category
- `limit` (int): Number of results (default: 20)

**Response:** Same format as `/places/search`

---

## 🚌 **Transit & Transportation**

### **GET /transit/stops/nearby**
Find nearby bus stops and transit stations.

**Query Parameters:**
- `lat` (float, required): Latitude
- `lng` (float, required): Longitude
- `radius` (int): Search radius in meters (default: 500)
- `type` (string): Transit type (bus, metro, all)

**Response (200 OK):**
```json
{
  "stops": [
    {
      "id": "stop_456",
      "name": "Spring St & 1st St",
      "type": "bus_stop",
      "location": {
        "latitude": 34.0507,
        "longitude": -118.2501
      },
      "routes": [
        {
          "route_id": "2",
          "route_name": "Metro Local Line 2",
          "direction": "Eastbound",
          "next_arrivals": [
            {
              "estimated_arrival": "2024-01-15T10:35:00Z",
              "minutes_away": 3,
              "real_time": true
            },
            {
              "estimated_arrival": "2024-01-15T10:47:00Z",
              "minutes_away": 15,
              "real_time": false
            }
          ]
        }
      ],
      "features": {
        "wheelchair_accessible": true,
        "shelter": true,
        "bench": true,
        "digital_display": true
      },
      "distance": 127.5
    }
  ]
}
```

### **GET /transit/routes/{route_id}**
Get detailed information about a specific transit route.

**Response (200 OK):**
```json
{
  "route": {
    "id": "2",
    "name": "Metro Local Line 2",
    "type": "bus",
    "description": "Connects Downtown LA to West LA via Sunset Boulevard",
    "color": "#FF6B35",
    "directions": [
      {
        "direction_id": "0",
        "name": "Eastbound to Downtown",
        "stops_count": 47
      },
      {
        "direction_id": "1", 
        "name": "Westbound to West LA",
        "stops_count": 47
      }
    ],
    "schedule": {
      "weekday": {
        "first_departure": "05:00",
        "last_departure": "00:30",
        "frequency_minutes": 12
      },
      "weekend": {
        "first_departure": "06:00",
        "last_departure": "23:30",
        "frequency_minutes": 20
      }
    },
    "accessibility": {
      "wheelchair_accessible": true,
      "low_floor": true,
      "audio_announcements": true
    }
  }
}
```

### **POST /transit/routes/plan**
Plan a route between two locations using public transit.

**Request Body:**
```json
{
  "origin": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "destination": {
    "latitude": 34.0407,
    "longitude": -118.2468
  },
  "departure_time": "2024-01-15T10:30:00Z",
  "preferences": {
    "wheelchair_accessible": true,
    "max_walking_distance": 800,
    "transport_modes": ["bus", "metro", "walking"]
  }
}
```

**Response (200 OK):**
```json
{
  "routes": [
    {
      "duration_minutes": 23,
      "walking_distance_meters": 650,
      "total_cost": 1.75,
      "transfers": 1,
      "wheelchair_accessible": true,
      "steps": [
        {
          "type": "walking",
          "duration_minutes": 4,
          "distance_meters": 320,
          "instruction": "Walk to Spring St & 1st St bus stop",
          "path": [
            {"lat": 34.0522, "lng": -118.2437},
            {"lat": 34.0507, "lng": -118.2501}
          ]
        },
        {
          "type": "transit",
          "route": {
            "id": "2",
            "name": "Metro Local Line 2",
            "type": "bus"
          },
          "departure_stop": "Spring St & 1st St",
          "arrival_stop": "Hill St & 5th St",
          "departure_time": "2024-01-15T10:35:00Z",
          "arrival_time": "2024-01-15T10:45:00Z",
          "duration_minutes": 10
        }
      ]
    }
  ]
}
```

---

## 📊 **Analytics & Insights**

### **GET /analytics/popular**
Get popular destinations and trending locations.

**Query Parameters:**
- `timeframe` (string): Time period (hour, day, week, month)
- `category` (string): Place category filter
- `limit` (int): Number of results

**Headers:** `Authorization: Bearer <token>` (Optional)

**Response (200 OK):**
```json
{
  "popular_places": [
    {
      "place": {
        "id": "place_xyz789",
        "name": "Grand Central Market",
        "category": "restaurant"
      },
      "metrics": {
        "visits": 1247,
        "unique_visitors": 892,
        "average_duration_minutes": 45,
        "peak_hours": ["12:00", "13:00", "19:00"],
        "rating_trend": 0.15,
        "popularity_score": 0.94
      }
    }
  ],
  "metadata": {
    "timeframe": "week",
    "generated_at": "2024-01-15T10:30:00Z",
    "total_places_analyzed": 2847
  }
}
```

### **GET /analytics/demographics**
Get visitor demographics and usage patterns.

**Query Parameters:**
- `timeframe` (string): Time period
- `location_id` (string): Specific location analysis

**Headers:** `Authorization: Bearer <token>` (Admin required)

**Response (200 OK):**
```json
{
  "demographics": {
    "age_groups": {
      "18-24": 0.23,
      "25-34": 0.31,
      "35-44": 0.22,
      "45-54": 0.15,
      "55+": 0.09
    },
    "countries": {
      "United States": 0.45,
      "Canada": 0.12,
      "United Kingdom": 0.08,
      "Japan": 0.07,
      "Other": 0.28
    },
    "peak_usage_times": [
      {"hour": 10, "usage_percentage": 0.15},
      {"hour": 14, "usage_percentage": 0.22},
      {"hour": 19, "usage_percentage": 0.18}
    ],
    "popular_categories": {
      "restaurants": 0.35,
      "attractions": 0.28,
      "shopping": 0.18,
      "entertainment": 0.19
    }
  }
}
```

---

## 🌍 **Geospatial Services**

### **POST /geo/reverse-geocode**
Convert coordinates to human-readable address.

**Request Body:**
```json
{
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Response (200 OK):**
```json
{
  "address": {
    "formatted": "Downtown Los Angeles, CA 90012, USA",
    "components": {
      "street_number": "",
      "street_name": "",
      "neighborhood": "Downtown",
      "city": "Los Angeles",
      "county": "Los Angeles County",
      "state": "California",
      "postal_code": "90012",
      "country": "United States"
    }
  }
}
```

### **POST /geo/geocode**
Convert address to coordinates.

**Request Body:**
```json
{
  "address": "317 S Broadway, Los Angeles, CA 90013"
}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "formatted_address": "317 S Broadway, Los Angeles, CA 90013, USA",
      "location": {
        "latitude": 34.0505,
        "longitude": -118.2489
      },
      "accuracy": "ROOFTOP",
      "place_types": ["street_address"]
    }
  ]
}
```

---

## ⭐ **Review System**

### **POST /reviews**
Submit a review for a place.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "place_id": "place_xyz789",
  "rating": 4,
  "title": "Great food variety!",
  "content": "Amazing selection of food vendors. The tacos were incredible and the atmosphere is very authentic. Can get crowded during lunch hours.",
  "photos": [
    "https://user-uploads.navigate-la28.com/reviews/photo1.jpg"
  ],
  "visit_date": "2024-01-14",
  "visited_with": "friends",
  "tags": ["food", "authentic", "crowded"]
}
```

**Response (201 Created):**
```json
{
  "review": {
    "id": "review_abc123",
    "place_id": "place_xyz789",
    "user": {
      "id": "user_abc123",
      "username": "tourist_explorer",
      "avatar_url": "https://avatars.navigate-la28.com/user_abc123.jpg"
    },
    "rating": 4,
    "title": "Great food variety!",
    "content": "Amazing selection of food vendors...",
    "photos": [
      "https://user-uploads.navigate-la28.com/reviews/photo1.jpg"
    ],
    "visit_date": "2024-01-14",
    "created_at": "2024-01-15T10:30:00Z",
    "helpful_count": 0,
    "verified_visit": true
  }
}
```

### **GET /places/{place_id}/reviews**
Get reviews for a specific place.

**Query Parameters:**
- `limit` (int): Number of reviews per page
- `offset` (int): Results offset
- `sort` (string): Sort order (newest, oldest, highest_rated, lowest_rated, most_helpful)

**Response (200 OK):**
```json
{
  "reviews": [
    {
      "id": "review_abc123",
      "user": {
        "username": "tourist_explorer",
        "avatar_url": "https://avatars.navigate-la28.com/user_abc123.jpg",
        "review_count": 23,
        "is_verified": true
      },
      "rating": 4,
      "title": "Great food variety!",
      "content": "Amazing selection of food vendors...",
      "photos": [
        "https://user-uploads.navigate-la28.com/reviews/photo1.jpg"
      ],
      "visit_date": "2024-01-14",
      "created_at": "2024-01-15T10:30:00Z",
      "helpful_count": 15,
      "verified_visit": true,
      "response": {
        "author": "Grand Central Market",
        "content": "Thank you for your review! We're glad you enjoyed your visit.",
        "created_at": "2024-01-15T14:20:00Z"
      }
    }
  ],
  "pagination": {
    "total": 1847,
    "limit": 20,
    "offset": 0,
    "pages": 93
  },
  "summary": {
    "average_rating": 4.2,
    "rating_distribution": {
      "5": 612,
      "4": 739,
      "3": 331,
      "2": 123,
      "1": 42
    }
  }
}
```

---

## 📝 **Data Models**

### **User Model**
```json
{
  "id": "string",
  "username": "string",
  "email": "string (email format)",
  "first_name": "string",
  "last_name": "string", 
  "date_of_birth": "string (YYYY-MM-DD)",
  "country": "string",
  "preferences": {
    "language": "string (ISO 639-1)",
    "accessibility_needs": ["string"],
    "interests": ["string"],
    "notification_settings": "object"
  },
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)",
  "last_login": "string (ISO 8601)",
  "is_verified": "boolean",
  "is_active": "boolean"
}
```

### **Place Model**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "subcategory": "string",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string",
    "neighborhood": "string",
    "postal_code": "string"
  },
  "contact": {
    "phone": "string",
    "website": "string (URL)",
    "email": "string (email format)"
  },
  "rating": {
    "average": "number (1-5)",
    "count": "integer"
  },
  "pricing": {
    "level": "integer (1-4)",
    "currency": "string (ISO 4217)",
    "average_cost": "number"
  },
  "features": "object",
  "hours": "object",
  "olympic_venue": "boolean",
  "images": ["string (URL)"],
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

---

## 🔗 **Webhook Events**

Navigate LA 28 supports webhooks for real-time event notifications.

### **Supported Events**
- `user.registered` - New user registration
- `review.created` - New review submitted
- `place.updated` - Place information updated
- `analytics.daily_report` - Daily analytics summary

### **Webhook Payload Example**
```json
{
  "event": "review.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "review_id": "review_abc123",
    "place_id": "place_xyz789",
    "user_id": "user_abc123",
    "rating": 4
  },
  "api_version": "1.0.0"
}
```

---

## 🚀 **SDKs and Client Libraries**

### **Official SDKs**
- **JavaScript/TypeScript**: `@navigate-la28/js-sdk`
- **Python**: `navigate-la28-python`
- **Swift**: `NavigateLA28SDK`
- **Kotlin**: `navigate-la28-android`

### **JavaScript SDK Example**
```javascript
import { NavigateLA28 } from '@navigate-la28/js-sdk';

const client = new NavigateLA28({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Search for places
const places = await client.places.search({
  query: 'restaurants',
  location: { lat: 34.0522, lng: -118.2437 },
  radius: 2000
});
```

---

## 📞 **Support**

For API support and questions:
- **Documentation**: [https://docs.navigate-la28.com](https://docs.navigate-la28.com)
- **Status Page**: [https://status.navigate-la28.com](https://status.navigate-la28.com)
- **Support Email**: api-support@navigate-la28.com
- **Developer Portal**: [https://developers.navigate-la28.com](https://developers.navigate-la28.com)

---

*Last updated: January 15, 2024* 