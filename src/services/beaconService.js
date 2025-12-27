/**
 * Service for managing beacon sessions (student location sharing)
 */

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { OfflineStorage } from '../utils/offlineStorage';

export class BeaconService {
  constructor(userId) {
    this.userId = userId;
    this.sessionRef = null;
  }

  /**
   * Start a beacon session when user boards the bus
   */
  async startBeacon(busId, initialLocation) {
    try {
      const sessionData = {
        userId: this.userId,
        busId: busId,
        isActive: true,
        startTime: serverTimestamp(),
        lastUpdate: serverTimestamp(),
        lastLocation: {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          accuracy: initialLocation.accuracy,
          timestamp: Date.now()
        },
        locationHistory: [{
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          timestamp: Date.now()
        }]
      };

      this.sessionRef = doc(db, 'sessions', this.userId);
      await setDoc(this.sessionRef, sessionData);
      
      return true;
    } catch (error) {
      console.error('Error starting beacon:', error);
      // Fallback to offline storage
      if (OfflineStorage.isOffline()) {
        const offlineData = {
          busId,
          location: initialLocation,
          timestamp: Date.now()
        };
        OfflineStorage.saveBusLocations([offlineData]);
      }
      throw error;
    }
  }

  /**
   * Update beacon location
   */
  async updateLocation(location) {
    if (!this.sessionRef) return;

    try {
      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      };

      const sessionDoc = await getDoc(this.sessionRef);
      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        const locationHistory = data.locationHistory || [];
        
        // Keep only last 10 locations to save storage
        const updatedHistory = [
          ...locationHistory.slice(-9),
          locationData
        ];

        await updateDoc(this.sessionRef, {
          lastLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: Date.now()
          },
          locationHistory: updatedHistory,
          lastUpdate: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      // Continue silently - location updates are best effort
    }
  }

  /**
   * Stop beacon session when user exits the bus
   */
  async stopBeacon() {
    if (!this.sessionRef) return;

    try {
      await updateDoc(this.sessionRef, {
        isActive: false,
        endTime: serverTimestamp(),
        lastUpdate: serverTimestamp()
      });
      
      // Optionally delete after a delay (handled by Cloud Function)
      this.sessionRef = null;
      return true;
    } catch (error) {
      console.error('Error stopping beacon:', error);
      throw error;
    }
  }

  /**
   * Get current active session
   */
  async getActiveSession() {
    if (!this.userId) return null;

    try {
      const sessionRef = doc(db, 'sessions', this.userId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists() && sessionDoc.data().isActive) {
        return sessionDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  /**
   * Listen to bus location updates (aggregated from all beacons)
   */
  subscribeToBusLocation(busId, callback) {
    const busRef = doc(db, 'buses', busId);
    
    return onSnapshot(busRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        // Try offline storage
        const offlineLocations = OfflineStorage.getBusLocations();
        if (offlineLocations) {
          const busLocation = offlineLocations.find(loc => loc.busId === busId);
          if (busLocation) {
            callback({
              location: busLocation.location,
              lastUpdate: busLocation.timestamp,
              isOffline: true
            });
          }
        }
      }
    }, (error) => {
      console.error('Error listening to bus location:', error);
      // Fallback to offline
      const offlineLocations = OfflineStorage.getBusLocations();
      if (offlineLocations) {
        const busLocation = offlineLocations.find(loc => loc.busId === busId);
        if (busLocation) {
          callback({
            location: busLocation.location,
            lastUpdate: busLocation.timestamp,
            isOffline: true
          });
        }
      }
    });
  }

  /**
   * Get all active beacons for a bus
   */
  async getActiveBeaconsForBus(busId) {
    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('busId', '==', busId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active beacons:', error);
      return [];
    }
  }
}

