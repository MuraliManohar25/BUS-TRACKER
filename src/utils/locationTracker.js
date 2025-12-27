/**
 * Battery-efficient location tracking with adaptive intervals
 * Uses geolocation API with optimized settings
 */

export class LocationTracker {
  constructor(options = {}) {
    this.watchId = null;
    this.callback = options.onLocationUpdate || (() => {});
    this.onError = options.onError || (() => {});
    this.updateInterval = options.updateInterval || 10000; // 10 seconds default
    this.highAccuracy = options.highAccuracy !== false; // Default true
    this.maxAge = options.maxAge || 5000; // 5 seconds cache
    this.timeout = options.timeout || 10000; // 10 seconds timeout
    
    // Adaptive interval based on movement
    this.lastLocation = null;
    this.stationaryCount = 0;
    this.minInterval = 5000; // 5 seconds minimum
    this.maxInterval = 30000; // 30 seconds maximum
    this.currentInterval = this.updateInterval;
    
    // Battery optimization
    this.isBackground = false;
    this.batteryLevel = null;
    this.checkBatteryLevel();
  }

  async checkBatteryLevel() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        this.batteryLevel = battery.level;
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
          this.adjustInterval();
        });
      } catch (e) {
        // Battery API not available
      }
    }
  }

  adjustInterval() {
    // Increase interval if battery is low
    if (this.batteryLevel !== null && this.batteryLevel < 0.2) {
      this.currentInterval = this.maxInterval;
    } else if (this.batteryLevel !== null && this.batteryLevel < 0.5) {
      this.currentInterval = this.updateInterval * 2;
    } else {
      this.currentInterval = this.updateInterval;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  handleLocationUpdate(position) {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now(),
      heading: position.coords.heading,
      speed: position.coords.speed
    };

    // Adaptive interval based on movement
    if (this.lastLocation) {
      const distance = this.calculateDistance(
        this.lastLocation.latitude,
        this.lastLocation.longitude,
        location.latitude,
        location.longitude
      );

      // If stationary, increase interval
      if (distance < 10) { // Less than 10 meters
        this.stationaryCount++;
        if (this.stationaryCount > 3) {
          this.currentInterval = Math.min(
            this.currentInterval * 1.5,
            this.maxInterval
          );
        }
      } else {
        this.stationaryCount = 0;
        this.currentInterval = this.updateInterval;
      }
    }

    this.lastLocation = location;
    this.callback(location);
  }

  start() {
    if (this.watchId !== null) {
      return; // Already tracking
    }

    const options = {
      enableHighAccuracy: this.highAccuracy,
      maximumAge: this.maxAge,
      timeout: this.timeout
    };

    // Use watchPosition for continuous updates
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.onError(error),
      options
    );

    // Throttle updates based on interval
    this.intervalId = setInterval(() => {
      if (this.lastLocation) {
        this.callback(this.lastLocation);
      }
    }, this.currentInterval);
  }

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.lastLocation = null;
    this.stationaryCount = 0;
  }

  setBackgroundMode(isBackground) {
    this.isBackground = isBackground;
    if (isBackground) {
      // Increase interval in background
      this.currentInterval = this.maxInterval;
    } else {
      this.currentInterval = this.updateInterval;
    }
  }
}

