/**
 * Offline storage for last known bus locations and cached data
 */

const STORAGE_KEYS = {
  LAST_BUS_LOCATIONS: 'bus_tracker_last_locations',
  CACHED_ROUTES: 'bus_tracker_routes',
  CACHED_STOPS: 'bus_tracker_stops',
  USER_PREFERENCES: 'bus_tracker_preferences',
  LAST_UPDATE: 'bus_tracker_last_update'
};

export const OfflineStorage = {
  // Save last known bus locations
  saveBusLocations(locations) {
    try {
      const data = {
        locations,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.LAST_BUS_LOCATIONS, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving bus locations:', error);
    }
  },

  // Get last known bus locations
  getBusLocations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_BUS_LOCATIONS);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // Return only if data is less than 5 minutes old
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed.locations;
      }
      return null;
    } catch (error) {
      console.error('Error getting bus locations:', error);
      return null;
    }
  },

  // Cache routes
  cacheRoutes(routes) {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_ROUTES, JSON.stringify(routes));
    } catch (error) {
      console.error('Error caching routes:', error);
    }
  },

  // Get cached routes
  getCachedRoutes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHED_ROUTES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached routes:', error);
      return null;
    }
  },

  // Cache stops
  cacheStops(stops) {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_STOPS, JSON.stringify(stops));
    } catch (error) {
      console.error('Error caching stops:', error);
    }
  },

  // Get cached stops
  getCachedStops() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHED_STOPS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached stops:', error);
      return null;
    }
  },

  // Save user preferences
  savePreferences(preferences) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  // Get user preferences
  getPreferences() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {};
    }
  },

  // Check if offline
  isOffline() {
    return !navigator.onLine;
  },

  // Clear all cached data
  clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

