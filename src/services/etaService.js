/**
 * Service for calculating Estimated Time of Arrival (ETA)
 */

export class ETAService {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate ETA to a stop
   */
  static calculateETA(busLocation, stopLocation, currentSpeed = null) {
    const distance = this.calculateDistance(
      busLocation.latitude,
      busLocation.longitude,
      stopLocation.latitude,
      stopLocation.longitude
    );

    // Average bus speed (in m/s) - can be adjusted based on route data
    const averageSpeed = currentSpeed || 8.33; // ~30 km/h = 8.33 m/s
    
    // Calculate time in seconds
    const timeInSeconds = distance / averageSpeed;
    
    // Add buffer for stops, traffic, etc. (20% buffer)
    const adjustedTime = timeInSeconds * 1.2;
    
    return {
      distance: Math.round(distance), // meters
      eta: Math.round(adjustedTime), // seconds
      etaMinutes: Math.round(adjustedTime / 60), // minutes
      estimatedArrival: new Date(Date.now() + adjustedTime * 1000)
    };
  }

  /**
   * Calculate ETA for multiple stops
   */
  static calculateETAsForStops(busLocation, stops, currentSpeed = null) {
    return stops.map(stop => ({
      stopId: stop.id,
      stopName: stop.name,
      ...this.calculateETA(busLocation, stop, currentSpeed)
    })).sort((a, b) => a.eta - b.eta);
  }

  /**
   * Find nearest stop
   */
  static findNearestStop(busLocation, stops) {
    let nearest = null;
    let minDistance = Infinity;

    stops.forEach(stop => {
      const distance = this.calculateDistance(
        busLocation.latitude,
        busLocation.longitude,
        stop.latitude,
        stop.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...stop, distance };
      }
    });

    return nearest;
  }

  /**
   * Calculate route progress (0-100%)
   */
  static calculateRouteProgress(busLocation, routeStops) {
    if (routeStops.length < 2) return 0;

    // Find current segment
    let totalDistance = 0;
    let traveledDistance = 0;
    let nearestStopIndex = 0;
    let minDistance = Infinity;

    // Calculate total route distance
    for (let i = 0; i < routeStops.length - 1; i++) {
      const segmentDistance = this.calculateDistance(
        routeStops[i].latitude,
        routeStops[i].longitude,
        routeStops[i + 1].latitude,
        routeStops[i + 1].longitude
      );
      totalDistance += segmentDistance;

      // Check if bus is near this segment
      const distanceToStop = this.calculateDistance(
        busLocation.latitude,
        busLocation.longitude,
        routeStops[i].latitude,
        routeStops[i].longitude
      );

      if (distanceToStop < minDistance) {
        minDistance = distanceToStop;
        nearestStopIndex = i;
      }
    }

    // Calculate traveled distance
    for (let i = 0; i < nearestStopIndex; i++) {
      traveledDistance += this.calculateDistance(
        routeStops[i].latitude,
        routeStops[i].longitude,
        routeStops[i + 1].latitude,
        routeStops[i + 1].longitude
      );
    }

    // Add partial distance to current position
    if (nearestStopIndex < routeStops.length - 1) {
      const segmentDistance = this.calculateDistance(
        routeStops[nearestStopIndex].latitude,
        routeStops[nearestStopIndex].longitude,
        routeStops[nearestStopIndex + 1].latitude,
        routeStops[nearestStopIndex + 1].longitude
      );
      
      const distanceToNext = this.calculateDistance(
        busLocation.latitude,
        busLocation.longitude,
        routeStops[nearestStopIndex + 1].latitude,
        routeStops[nearestStopIndex + 1].longitude
      );
      
      traveledDistance += segmentDistance - distanceToNext;
    }

    return totalDistance > 0 ? Math.min(100, (traveledDistance / totalDistance) * 100) : 0;
  }
}

