/**
 * Client-side location aggregation (replaces Cloud Functions)
 * Works on Firebase free tier - no premium plan needed
 */

import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export class LocationAggregator {
  /**
   * Calculate aggregated location from multiple beacons
   * Uses weighted average based on accuracy
   */
  static calculateAggregatedLocation(locations) {
    if (locations.length === 1) {
      return {
        latitude: locations[0].location.latitude,
        longitude: locations[0].location.longitude,
        accuracy: locations[0].accuracy
      };
    }

    // Weight by inverse of accuracy (more accurate = higher weight)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    let maxAccuracy = 0;

    locations.forEach(loc => {
      const weight = 1 / Math.max(loc.accuracy, 1); // Avoid division by zero
      totalWeight += weight;
      weightedLat += loc.location.latitude * weight;
      weightedLng += loc.location.longitude * weight;
      maxAccuracy = Math.max(maxAccuracy, loc.accuracy);
    });

    return {
      latitude: weightedLat / totalWeight,
      longitude: weightedLng / totalWeight,
      accuracy: maxAccuracy / Math.sqrt(locations.length) // Improved accuracy with more beacons
    };
  }

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
   * Aggregate and update bus location from all active beacons
   * This runs client-side instead of Cloud Functions
   */
  static async aggregateBusLocation(busId) {
    try {
      // Get all active sessions (beacons) for this bus
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('busId', '==', busId),
        where('isActive', '==', true)
      );
      
      const activeSessions = await getDocs(q);

      if (activeSessions.empty) {
        return null;
      }

      // Collect valid locations
      const locations = [];
      activeSessions.forEach(doc => {
        const data = doc.data();
        if (data.lastLocation && data.lastLocation.timestamp) {
          // Only include recent locations (within last 2 minutes)
          const locationAge = Date.now() - data.lastLocation.timestamp;
          if (locationAge < 120000) { // 2 minutes
            locations.push({
              location: data.lastLocation,
              accuracy: data.lastLocation.accuracy || 50
            });
          }
        }
      });

      if (locations.length === 0) {
        return null;
      }

      // Calculate aggregated location
      const aggregatedLocation = this.calculateAggregatedLocation(locations);

      // Get bus document
      const busRef = doc(db, 'buses', busId);
      const busDoc = await getDoc(busRef);

      if (!busDoc.exists()) {
        // Create bus document if it doesn't exist
        await setDoc(busRef, {
          routeId: 'route-1', // Default, should be set properly
          isActive: true,
          location: {
            latitude: aggregatedLocation.latitude,
            longitude: aggregatedLocation.longitude,
            accuracy: aggregatedLocation.accuracy,
            timestamp: Date.now()
          },
          beaconCount: locations.length,
          lastUpdate: serverTimestamp(),
          speed: 0,
          name: `Bus ${busId}`
        });
      } else {
        // Calculate speed if we have previous location
        const busData = busDoc.data();
        let speed = null;
        
        if (busData.location && busData.lastUpdate) {
          const timeDiff = (Date.now() - busData.lastUpdate.toMillis()) / 1000; // seconds
          if (timeDiff > 0) {
            const distance = this.calculateDistance(
              busData.location.latitude,
              busData.location.longitude,
              aggregatedLocation.latitude,
              aggregatedLocation.longitude
            );
            speed = distance / timeDiff; // m/s
          }
        }

        // Update bus location
        await updateDoc(busRef, {
          location: {
            latitude: aggregatedLocation.latitude,
            longitude: aggregatedLocation.longitude,
            accuracy: aggregatedLocation.accuracy,
            timestamp: Date.now()
          },
          beaconCount: locations.length,
          lastUpdate: serverTimestamp(),
          speed: speed || 0,
          isActive: true
        });
      }

      return {
        location: aggregatedLocation,
        beaconCount: locations.length,
        speed: speed || 0
      };
    } catch (error) {
      console.error('Error aggregating bus location:', error);
      return null;
    }
  }

  /**
   * Start periodic aggregation for a bus
   * Runs every 15 seconds (client-side) - optimized for free tier
   */
  static startAggregation(busId, callback) {
    // Aggregate immediately
    this.aggregateBusLocation(busId).then(result => {
      if (result && callback) {
        callback(result);
      }
    }).catch(error => {
      console.error('Initial aggregation error:', error);
    });

    // Then aggregate every 15 seconds (reduced frequency for free tier)
    const intervalId = setInterval(() => {
      this.aggregateBusLocation(busId).then(result => {
        if (result && callback) {
          callback(result);
        }
      }).catch(error => {
        console.error('Aggregation error:', error);
      });
    }, 15000); // 15 seconds - optimized for free tier limits

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

