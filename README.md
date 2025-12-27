# Bus Tracker - Student-as-Beacon System

A full-stack web application for real-time campus bus tracking using students' mobile phones as GPS beacons instead of hardware GPS devices.

## 🎯 Core Concept

Instead of installing expensive GPS hardware on buses, this system uses students' mobile phones as temporary GPS beacons. When students board a bus, they can opt-in to anonymously share location data, enabling real-time tracking with crowd-based accuracy.

## ✨ Features

### Core Features
- **Live Bus Location Tracking** - Real-time shuttle tracking by aggregating GPS data from students on the bus
- **One-Tap "I'm on the Bus" Toggle** - Simple UI control to start/stop beacon sharing instantly
- **Estimated Arrival Time (ETA)** - Automatic ETA calculation for each stop using current position, route data, and speed
- **Multiple Beacon Support** - Improved accuracy by averaging GPS signals from multiple students on the same bus
- **Battery-Efficient Tracking** - Adaptive location update intervals, low-power GPS modes, and background throttling
- **Privacy-First Design** - Anonymous session IDs, no personal identity storage, aggregate data only
- **Offline-Friendly** - Caches last known bus locations locally for weak connectivity scenarios
- **Push Notifications** - Notifies users when bus is approaching selected stop or delays occur
- **No Hardware Dependency** - Works entirely without physical GPS devices on buses

### Admin Features
- **Usage Statistics** - View active beacons, buses, and coverage metrics
- **Peak Hours Analysis** - Identify high-usage periods
- **Route Efficiency** - Monitor route performance and passenger counts
- **Real-time Monitoring** - Dashboard with live updates

## 🏗️ System Architecture

### Frontend
- **Framework**: React with Vite
- **Maps**: Google Maps API for route visualization
- **State Management**: React Hooks
- **Styling**: CSS Modules

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth
- **Cloud Functions**: Location aggregation, ETA calculations, notifications
- **Real-time Updates**: Firestore real-time listeners
- **Notifications**: Firebase Cloud Messaging (FCM)

### Key Components

```
bus-tracker/
├── src/
│   ├── components/          # React UI components
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── BusTracker.jsx   # Main tracking interface
│   │   ├── BeaconToggle.jsx # One-tap beacon control
│   │   ├── BusSelector.jsx  # Bus selection
│   │   ├── StopList.jsx     # Stop list with ETAs
│   │   └── AdminDashboard.jsx # Admin analytics
│   ├── services/            # Business logic
│   │   ├── beaconService.js # Beacon session management
│   │   ├── busService.js    # Bus and route data
│   │   └── etaService.js    # ETA calculations
│   ├── utils/               # Utilities
│   │   ├── locationTracker.js # Battery-efficient GPS tracking
│   │   └── offlineStorage.js  # Local caching
│   └── firebase/            # Firebase configuration
├── functions/               # Cloud Functions
│   └── index.js            # Backend logic
└── firestore.rules         # Security rules
```

## 📊 Database Schema

### Collections

#### `sessions` (Beacon Sessions)
```javascript
{
  userId: string,           // Anonymous user ID
  busId: string,            // Bus identifier
  isActive: boolean,        // Active status
  startTime: timestamp,     // Session start
  lastUpdate: timestamp,    // Last location update
  lastLocation: {
    latitude: number,
    longitude: number,
    accuracy: number,
    timestamp: number
  },
  locationHistory: array    // Last 10 locations
}
```

#### `buses` (Bus Locations)
```javascript
{
  routeId: string,          // Route identifier
  location: {
    latitude: number,
    longitude: number,
    accuracy: number,
    timestamp: number
  },
  beaconCount: number,      // Number of active beacons
  speed: number,            // Current speed (m/s)
  isActive: boolean,
  etas: array,              // ETAs for all stops
  lastUpdate: timestamp
}
```

#### `routes` (Route Definitions)
```javascript
{
  name: string,
  description: string,
  stops: array              // Stop IDs in order
}
```

#### `stops` (Bus Stops)
```javascript
{
  routeId: string,
  name: string,
  latitude: number,
  longitude: number,
  order: number             // Order in route
}
```

#### `userPreferences` (User Settings)
```javascript
{
  selectedStopId: string,   // Stop for notifications
  fcmToken: string          // Push notification token
}
```

## 🔒 Privacy & Security

### Privacy Features
- **Anonymous Authentication**: Users authenticated anonymously via Firebase
- **No Identity Storage**: Only session IDs stored, no personal information
- **Aggregate Data Only**: Individual locations aggregated at bus level
- **Session Expiration**: Inactive sessions automatically cleaned up
- **Local-First**: Location data cached locally, minimal server exposure

### Security Rules
- Users can only read/write their own sessions
- Bus locations are public read, functions-only write
- Admin data requires authentication
- All writes validated through Cloud Functions

## 🔋 Battery Optimization

### Strategies Implemented
1. **Adaptive Intervals**: Update frequency adjusts based on:
   - Battery level (slower updates when low)
   - Movement patterns (faster when stationary)
   - Background/foreground state

2. **Smart Throttling**:
   - Minimum interval: 5 seconds
   - Maximum interval: 30 seconds
   - Default: 10 seconds

3. **Efficient GPS Usage**:
   - High accuracy only when needed
   - Cached location reuse
   - Background mode detection

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase account
- Google Maps API key

### Installation

1. **Clone and install dependencies**
```bash
npm install
cd functions && npm install
```

2. **Firebase Setup**
```bash
firebase login
firebase init
```

3. **Configure Firebase**
   - Update `src/firebase/config.js` with your Firebase config
   - Update `index.html` with your Google Maps API key
   - Update `functions/index.js` VAPID key for FCM

4. **Deploy**
```bash
# Deploy functions
npm run deploy-functions

# Build and deploy frontend
npm run build
firebase deploy --only hosting
```

### Development

```bash
# Start dev server
npm run dev

# Run functions locally
cd functions
npm run serve
```

## 📱 Usage

### For Students
1. Open the app and allow location access
2. Select your bus route
3. Tap "I'm on the Bus" when boarding
4. Tap "Stop Beacon" when exiting
5. View real-time bus location and ETAs

### For Administrators
1. Access the Admin Dashboard
2. Monitor active beacons and buses
3. View usage statistics and peak hours
4. Analyze route efficiency

## 🔔 Notifications

Users can enable push notifications to receive alerts when:
- Bus is approaching their selected stop (within 5 minutes)
- Delays or route changes occur
- New routes become available

## 🌐 Offline Support

- Last known bus locations cached locally
- Routes and stops cached for offline viewing
- Automatic sync when connection restored
- Visual indicator for offline mode

## 🛠️ Cloud Functions

### Scheduled Functions
- **aggregateBusLocations**: Runs every 10 seconds to aggregate beacon locations
- **cleanupInactiveSessions**: Runs hourly to remove old sessions
- **updateAdminStats**: Runs every 5 minutes to update statistics

### Triggered Functions
- **calculateETAs**: Triggered on bus location updates to calculate ETAs

### HTTP Functions
- **getBusETAs**: REST endpoint for external integrations

## 📈 Scalability

- **Horizontal Scaling**: Firebase automatically scales
- **Cost-Effective**: Pay-per-use model, no infrastructure management
- **Real-time Updates**: Efficient Firestore listeners
- **Caching**: Multiple layers of caching for performance

## 🔮 Future Enhancements

- [ ] Route optimization based on passenger data
- [ ] Predictive ETAs using ML
- [ ] Multi-campus support
- [ ] Integration with campus systems
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for campus communities**

