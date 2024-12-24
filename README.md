This is the backend code for the road-trip planning app. 
It takes in location addresses from the user and suggests places to stop on the way based on various conditions such driving time, restaurant stops based on cuisine choices etc.
A live demo is available at https://tripmaker.inertia.cc


## Core Functionality

The Rovis app is a road trip planning tool that helps users plan optimal routes with intelligent stop scheduling.

### User Inputs
- Start and end locations
- Optional waypoints
- Trip parameters:
  - Maximum driving hours per day
  - Maximum hours between stops
  - Meal preferences and cuisine filters 
  - Trip start/end dates and times

## Route Planning System

### Route Calculation
- Uses TomTom's routing API for optimal path calculation
- Automatically determines necessary stops based on:
  - Meal times (considering driving duration and time of day)
  - Rest breaks (based on maximum continuous driving time)
  - Overnight stays (based on maximum daily driving hours)
  - User-defined waypoint locations

### Stop Selection Process
- For each calculated stop point:
  - Searches nearby businesses via Yelp or Google API, (based on environment variables)
  - Configurable search radius
  - Filters based on stop type:
    - Restaurants for meals
    - Rest areas for breaks
    - Hotels for overnight stays
  - Applies user's cuisine/category preferences
  - Displays business details:
    - Ratings & reviews
    - Distance from route
    - Operating hours
  - Allows manual selection of specific businesses

## Technical Architecture

### Frontend Architecture 
(repo: https://github.com/rovisapp/rovis-frontend)
- Pure JavaScript implementation
- No frontend framework dependencies
- Key components:
  - Custom web components for UI
  - Custom state management (store.js)
  - Bootstrap 5.3 for styling
  - TomTom Maps for route visualization
  - Modular component system in `js/components/`

### Backend Architecture 
(This repo)
- Node.js server implementation
- Key features:
  - API integrations:
    - TomTom (geocoding/routing)
    - Google Places API (places search)
    - Yelp (business search)
  - Complex route calculations
  - Comprehensive error handling
  - API rate limiting system
  - Request/response validation

### Data Flow
1. User Input Flow:
   - UI interactions trigger state updates
   - State changes managed through central store
   - Components re-render based on state changes

2. Backend Processing Flow:
   - Location search/geocoding
   - Route optimization
   - Stop point calculations
   - Business search around stops
   - Data aggregation and response formatting

3. Display Flow:
   - List view of stops and businesses
   - Interactive map visualization
   - Real-time updates as selections change

# Backend Implementation Details

## Core Components

### Error Handling System
- Centralized error handling through `errorHandler/` directory
- Custom error classes:
  - `Api400Error` - Bad request handling
  - `Api500Error` - Server error handling
  - `BaseError` - Base error class
- Error middleware for consistent error responses
- HTTP status code management

### Google Places API Usage Counter
- Implemented in `services/apiUsageTracker.js`
- Features:
  - Per-method usage tracking
  - Count management for API calls
  - Singleton pattern implementation
- TODO: Prevents API quota exhaustion

### Route Management
- Core routing functionality in `routes/` directory
- Main routes:
  ```
  POST /api/user/routing - Route calculation between two coordinates and multiple waypoints (TOMTOM API)
  GET  /api/user/search - Location/Address search by text query (TOMTOM API)
  POST /api/user/locatestoparray - Takes in route, calculates stopping points on route and returns eligible businesses around each stopping point (YELP or GOOGLE API)
  POST /api/user/poisearch - search for individual business around one coordinate (YELP or GOOGLE API)
  GET /fake/gsearch - hosts a endpoint to return test/fake data resembling google api search. Activated using GFAKER=1 in .env file
  ```

## Service Integration

### TomTom Integration
- Services defined in `services/tomtom.js`
- Key functionalities:
  - Geocoding (`searchLocation`)
  - Route calculation (`routebetweenLocations`)
  - Stop location determination (`locateStop`)
  - Reverse geocoding (`reversegeocode`)

### Yelp Integration
- Business / Places search implementation
- Features:
  - Category-based filtering
  - Radius-based search
  - Operating hours consideration
  

### Google Places Integration
- Business / Places search implementation
- Features:
  - Category-based filtering
  - Takes in Radius-based search request from frontend and makes a callout to Google with a location restriction of a rectangular box.
  - Google's response is converted to Yelp's data model to make use of the same codebase.
  - Allows mocking API calls without hitting the real api using /fake/gsearch. Can be activated by setting GFAKER=1 in .env file. Returns places defined in .dataseed/hardedplaces.js with random coordinates around search location.

### Google Service Integration (Usage Monitoring)
- Implemented in `services/gUsageActuals.js`
- Monitors API usage across services
- Provides usage metrics and alerts

## Data Processing

### Stop Calculation
- Complex stop determination logic
- Factors considered:
  - Drive time requirements
  - Meal timing
  - Rest requirements
  - Fuel stops (if enabled)
  - User-defined waypoints

### Route Optimization
- Multi-point route calculation
- Waypoint handling
- Time window consideration
- Traffic data integration

## Configuration Management

### Environment Variables
Required configurations in .env file
```
TOMTOM_API_KEY= //tomtom backend api key - required
TOMTOMAPIFRONTENDKEY= //tomtom frontend api key - required
YELP_API_KEY= // yelp api key - required, if PLACES_PROVIDER=YELP
GOOGLE_API_KEY= // google places api key; required, if PLACES_PROVIDER=GOOGLE; use a random / fake key, if GFAKER=1
GOOGLE_JAVASCRIPT_KEY= // google map javascript api key for frontend; required, if PLACES_PROVIDER=GOOGLE
GPROJECT_ID= // google project id to monitor API usage; not required; Can use a fake number for the app the load.
PLACES_PROVIDER=YELP // required; can be set to YELP or GOOGLE
GFAKER=0 // can be set to 0 or 1; required; If set to 1, the server code can feed in dummy places data defined in .dataseed/hardedplaces. js
SEARCHCOUNTRY_DEFAULT=US // Depends on Cloudfront's cf-ipcountry header to understand request of country a request is coming from. The address autocomplete feature puts addresses of that country on top of prompt list. If the cf-ipcountry header, it defaults to the value assigned here
```



## Logging System

### Winston Logger Implementation
- Configured in `logger/logger.js`
- Features:
  - Error stack traces
  - Timestamp logging
  - Log level management
  - Console transport
  - Custom formatting

## Data Models

### Stop Model
```javascript
{
  latitude: Number,
  longitude: Number,
  type: Array<String>,
  poisearchbyoffsetarray: Array,
  poiselected: Array,
  address: Object,
  poisearchtags: Set,
  poisearchradiusinmiles: Number
}
```

### Route Model
```javascript
{
  summary: {
    lengthInMeters: Number,
    travelTimeInSeconds: Number,
    trafficDelayInSeconds: Number,
    departureTime: String,
    arrivalTime: String
  },
  legs: Array,
  guidance: Object,
  routehash: String
}
```





## User Experience Flow

1. Initial Setup:
   - Enter start/end locations
   - Set trip parameters
   - Define preferences

2. Route Planning:
   - Automatic route calculation
   - Stop point determination
   - Business suggestions

3. Customization:
   - Select specific businesses
   - Adjust stop locations
   - Modify preferences

4. Finalization:
   - Complete route overview
   - Stop sequence with timings
   - Business details and contacts

### Contribution Instructions
The api endpoints are defined in routes/user.js \
The code for routing and searching places is in services/tomtom.js \
Uses Tomtom to find places of interest (restaurant, hotels, rest stops). Google places api is used as a backup based on how you define the .env file.\
Allows faking google like places api data to help test UI/frontend without hitting real google maps api.\
Use .env, .dataseed/hardcodedplaces.js, .secret/g-service-usage-credential.json.\
Use .gitignore while commiting code.
Do not commit any code secrets.
Do not commit to main branch.

### To start the app
```
npm install
npm run start:dev
```


