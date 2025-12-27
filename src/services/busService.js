/**
 * Service for bus and route management
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { OfflineStorage } from '../utils/offlineStorage';

export class BusService {
  /**
   * Get all active buses
   */
  async getActiveBuses() {
    try {
      const busesRef = collection(db, 'buses');
      const q = query(busesRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);
      
      const buses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Cache for offline use
      OfflineStorage.cacheRoutes(buses);
      
      return buses;
    } catch (error) {
      console.error('Error getting active buses:', error);
      // Try offline cache
      return OfflineStorage.getCachedRoutes() || [];
    }
  }

  /**
   * Get bus by ID
   */
  async getBus(busId) {
    try {
      const busRef = doc(db, 'buses', busId);
      const busDoc = await getDoc(busRef);
      
      if (busDoc.exists()) {
        return { id: busDoc.id, ...busDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting bus:', error);
      return null;
    }
  }

  /**
   * Subscribe to bus location updates
   */
  subscribeToBus(busId, callback) {
    const busRef = doc(db, 'buses', busId);
    
    return onSnapshot(busRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      }
    }, (error) => {
      console.error('Error subscribing to bus:', error);
    });
  }

  /**
   * Get all routes
   */
  async getRoutes() {
    try {
      const routesRef = collection(db, 'routes');
      const snapshot = await getDocs(routesRef);
      
      const routes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      OfflineStorage.cacheRoutes(routes);
      
      return routes;
    } catch (error) {
      console.error('Error getting routes:', error);
      return OfflineStorage.getCachedRoutes() || [];
    }
  }

  /**
   * Get route by ID
   */
  async getRoute(routeId) {
    try {
      const routeRef = doc(db, 'routes', routeId);
      const routeDoc = await getDoc(routeRef);
      
      if (routeDoc.exists()) {
        return { id: routeDoc.id, ...routeDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  /**
   * Get all stops for a route
   */
  async getStopsForRoute(routeId) {
    try {
      const stopsRef = collection(db, 'stops');
      const q = query(stopsRef, where('routeId', '==', routeId));
      const snapshot = await getDocs(q);
      
      const stops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.order - b.order);
      
      OfflineStorage.cacheStops(stops);
      
      return stops;
    } catch (error) {
      console.error('Error getting stops:', error);
      return OfflineStorage.getCachedStops() || [];
    }
  }

  /**
   * Get all stops
   */
  async getAllStops() {
    try {
      const stopsRef = collection(db, 'stops');
      const snapshot = await getDocs(stopsRef);
      
      const stops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      OfflineStorage.cacheStops(stops);
      
      return stops;
    } catch (error) {
      console.error('Error getting all stops:', error);
      return OfflineStorage.getCachedStops() || [];
    }
  }
}

