# System Architecture

## Overview

The Bus Tracker system is built on a serverless architecture using Firebase, providing real-time bus tracking through a crowd-sourced beacon network.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  BusTracker  │  │ BeaconToggle │  │ AdminDashboard│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                    │           │
│         └──────────────────┼────────────────────┘           │
│                            │                                │
│                    ┌───────▼────────┐                       │
│                    │  Services Layer│                       │
│                    │  - BeaconService│                       │
│                    │  - BusService   │                       │
│                    │  - ETAService   │                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Firebase SDK   │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   Firestore    │  │  Cloud Functions│  │  FCM (Push)    │
│   Database     │  │                 │  │  Notifications │
└───────┬────────┘  └────────┬────────┘  └────────────────┘
        │                    │
        │         ┌───────────▼───────────┐
        │         │  Location Aggregation │
        │         │  ETA Calculation      │
        │         │  Session Cleanup      │
        │         │  Stats Updates        │
        │         └───────────────────────┘
        │
┌───────▼────────────────────────────────────┐
│         Data Flow                          │
│                                            │
│  1. Student enables beacon                 │
│  2. Location updates → Firestore sessions │
│  3. Cloud Function aggregates locations    │
│  4. Bus location updated in Firestore      │
│  5. ETA calculated for all stops          │
│  6. Real-time updates to all clients      │
│  7. Notifications sent if approaching      │
└────────────────────────────────────────────┘
```

## Data Flow

### Beacon Activation Flow

1. **User Action**: Student taps "I'm on the Bus"
2. **Location Request**: App requests GPS permission
3. **Session Creation**: `BeaconService.startBeacon()` creates session in Firestore
4. **Location Tracking**: `LocationTracker` starts sending updates
5. **Location Updates**: Updates sent to Firestore `sessions` collection
6. **Aggregation**: Cloud Function aggregates all active beacons for the bus
7. **Bus Update**: Aggregated location saved to `buses` collection
8. **Real-time Sync**: All clients receive updated bus location via Firestore listeners

### ETA Calculation Flow

1. **Bus Location Update**: Cloud Function triggered on bus location change
2. **Route Retrieval**: Fetch all stops for the bus route
3. **Distance Calculation**: Calculate distance to each stop (Haversine formula)
4. **Speed Analysis**: Use current speed or average speed
5. **ETA Computation**: Calculate time = distance / speed + buffer
6. **Storage**: Save ETAs to bus document
7. **Notification Check**: If any stop < 5 minutes, trigger notifications
8. **Client Update**: Clients receive updated ETAs via real-time listener

### Notification Flow

1. **User Preference**: User selects favorite stop in settings
2. **FCM Token**: App registers for push notifications
3. **Token Storage**: FCM token saved to `userPreferences`
4. **ETA Monitoring**: Cloud Function checks approaching stops
5. **Notification Trigger**: If selected stop ETA < 5 minutes
6. **Message Sending**: FCM sends notification to user
7. **User Alert**: User receives notification on device

## Component Architecture

### Frontend Components

#### BusTracker (Main Component)
- Manages overall state and coordination
- Handles map rendering and markers
- Coordinates between services
- Manages real-time subscriptions

#### BeaconToggle
- One-tap beacon activation/deactivation
- Visual status indicator
- Battery efficiency display

#### BusSelector
- Lists available buses
- Route information display
- Active status indicators

#### StopList
- Displays all stops for selected route
- Shows ETAs for each stop
- Highlights approaching stops

#### AdminDashboard
- Statistics visualization
- Charts and graphs
- Real-time metrics

### Service Layer

#### BeaconService
- Session lifecycle management
- Location update handling
- Bus location subscriptions
- Offline fallback

#### BusService
- Bus and route data retrieval
- Stop information management
- Real-time bus updates

#### ETAService
- Distance calculations
- ETA computations
- Route progress tracking
- Nearest stop finding

### Utility Classes

#### LocationTracker
- Battery-efficient GPS tracking
- Adaptive update intervals
- Background mode handling
- Movement-based optimization

#### OfflineStorage
- Local data caching
- Offline data access
- Cache expiration
- Storage management

## Backend Architecture

### Cloud Functions

#### aggregateBusLocations (Scheduled)
- **Trigger**: Every 10 seconds
- **Purpose**: Aggregate all active beacon locations
- **Process**:
  1. Query all active sessions
  2. Group by busId
  3. Calculate weighted average location
  4. Update bus document
  5. Calculate speed from previous location

#### calculateETAs (Triggered)
- **Trigger**: On bus location update
- **Purpose**: Calculate ETAs for all stops
- **Process**:
  1. Get route stops
  2. Calculate distances
  3. Compute ETAs with speed
  4. Update bus document
  5. Check for approaching stops
  6. Send notifications if needed

#### cleanupInactiveSessions (Scheduled)
- **Trigger**: Every hour
- **Purpose**: Remove old inactive sessions
- **Process**:
  1. Find inactive sessions older than 2 hours
  2. Batch delete
  3. Log cleanup statistics

#### updateAdminStats (Scheduled)
- **Trigger**: Every 5 minutes
- **Purpose**: Update admin dashboard statistics
- **Process**:
  1. Count active beacons
  2. Count active buses
  3. Calculate metrics
  4. Update admin document

## Security Architecture

### Authentication
- Anonymous Firebase Authentication
- No personal information required
- Session-based access control

### Authorization
- Firestore Security Rules enforce:
  - Users can only access their own sessions
  - Bus locations are public read
  - Admin data requires authentication
  - Functions-only writes to buses

### Data Privacy
- No PII stored
- Anonymous session IDs
- Location data aggregated immediately
- Automatic session cleanup

## Performance Optimizations

### Frontend
- React component memoization
- Efficient Firestore listeners
- Local caching for offline support
- Lazy loading of map components

### Backend
- Batch operations in Cloud Functions
- Efficient Firestore queries with indexes
- Aggregated location calculations
- Scheduled cleanup to reduce data

### Network
- Minimal API calls
- Real-time listeners instead of polling
- Compressed data transfer
- Offline-first approach

## Scalability Considerations

### Horizontal Scaling
- Firebase automatically scales
- No server management needed
- Pay-per-use pricing model

### Data Management
- Indexed queries for performance
- Automatic cleanup of old data
- Efficient data structures
- Batch operations

### Cost Optimization
- Minimal Cloud Function invocations
- Efficient Firestore reads/writes
- Cached data reduces API calls
- Scheduled functions vs. continuous polling

## Monitoring & Analytics

### Metrics Tracked
- Active beacon count
- Active bus count
- Peak usage hours
- Route efficiency
- Average beacons per bus

### Logging
- Cloud Function execution logs
- Error tracking
- Performance metrics
- User activity (anonymous)

## Deployment Architecture

### Frontend
- Firebase Hosting
- CDN distribution
- Automatic SSL
- Global edge locations

### Backend
- Cloud Functions (serverless)
- Firestore (NoSQL database)
- FCM (push notifications)
- All managed by Firebase

## Error Handling

### Frontend
- Graceful degradation
- Offline fallbacks
- User-friendly error messages
- Retry mechanisms

### Backend
- Try-catch in all functions
- Error logging
- Graceful failures
- Dead letter queues (future)

## Future Architecture Enhancements

1. **Caching Layer**: Redis for frequently accessed data
2. **Message Queue**: For notification batching
3. **Analytics Pipeline**: BigQuery for advanced analytics
4. **ML Integration**: Predictive ETAs using historical data
5. **Multi-region**: Support for multiple campuses

