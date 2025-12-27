const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

/**
 * Aggregate bus locations from active beacons
 * Runs every 10 seconds to update bus positions
 */
exports.aggregateBusLocations = functions.pubsub
  .schedule('every 10 seconds')
  .onRun(async (context) => {
    try {
      // Get all active sessions (beacons)
      const sessionsRef = db.collection('sessions');
      const activeSessions = await sessionsRef
        .where('isActive', '==', true)
        .get();

      if (activeSessions.empty) {
        console.log('No active beacons found');
        return null;
      }

      // Group sessions by busId
      const busGroups = {};
      activeSessions.forEach(doc => {
        const data = doc.data();
        const busId = data.busId;
        
        if (!busGroups[busId]) {
          busGroups[busId] = [];
        }
        
        if (data.lastLocation && data.lastLocation.timestamp) {
          // Only include recent locations (within last 2 minutes)
          const locationAge = Date.now() - data.lastLocation.timestamp;
          if (locationAge < 120000) { // 2 minutes
            busGroups[busId].push({
              location: data.lastLocation,
              accuracy: data.lastLocation.accuracy || 50
            });
          }
        }
      });

      // Calculate aggregated location for each bus
      for (const [busId, locations] of Object.entries(busGroups)) {
        if (locations.length === 0) continue;

        const aggregatedLocation = calculateAggregatedLocation(locations);
        
        // Get bus document
        const busRef = db.collection('buses').doc(busId);
        const busDoc = await busRef.get();
        
        if (busDoc.exists) {
          const busData = busDoc.data();
          
          // Calculate speed if we have previous location
          let speed = null;
          if (busData.location && busData.lastUpdate) {
            const timeDiff = (Date.now() - busData.lastUpdate.toMillis()) / 1000; // seconds
            if (timeDiff > 0) {
              const distance = calculateDistance(
                busData.location.latitude,
                busData.location.longitude,
                aggregatedLocation.latitude,
                aggregatedLocation.longitude
              );
              speed = distance / timeDiff; // m/s
            }
          }

          // Update bus location
          await busRef.update({
            location: {
              latitude: aggregatedLocation.latitude,
              longitude: aggregatedLocation.longitude,
              accuracy: aggregatedLocation.accuracy,
              timestamp: Date.now()
            },
            beaconCount: locations.length,
            lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
            speed: speed,
            isActive: true
          });

          console.log(`Updated bus ${busId} with ${locations.length} beacons`);
        }
      }

      return null;
    } catch (error) {
      console.error('Error aggregating bus locations:', error);
      return null;
    }
  });

/**
 * Calculate aggregated location from multiple beacons
 * Uses weighted average based on accuracy
 */
function calculateAggregatedLocation(locations) {
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
function calculateDistance(lat1, lon1, lat2, lon2) {
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
 * Clean up inactive sessions
 * Runs every hour
 */
exports.cleanupInactiveSessions = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const cutoffTime = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
      
      const sessionsRef = db.collection('sessions');
      const inactiveSessions = await sessionsRef
        .where('isActive', '==', false)
        .get();

      const batch = db.batch();
      let deleteCount = 0;

      inactiveSessions.forEach(doc => {
        const data = doc.data();
        const lastUpdate = (data.lastUpdate && data.lastUpdate.toMillis) ? data.lastUpdate.toMillis() : 0;
        
        if (lastUpdate < cutoffTime) {
          batch.delete(doc.ref);
          deleteCount++;
        }
      });

      if (deleteCount > 0) {
        await batch.commit();
        console.log(`Deleted ${deleteCount} inactive sessions`);
      }

      return null;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return null;
    }
  });

/**
 * Calculate ETAs for all stops when bus location updates
 */
exports.calculateETAs = functions.firestore
  .document('buses/{busId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Only calculate if location actually changed
    if (!newData.location || 
        (oldData.location && 
         oldData.location.latitude === newData.location.latitude &&
         oldData.location.longitude === newData.location.longitude)) {
      return null;
    }

    try {
      if (!newData.routeId) {
        return null;
      }

      // Get all stops for this route
      const stopsRef = db.collection('stops');
      const stopsSnapshot = await stopsRef
        .where('routeId', '==', newData.routeId)
        .get();

      if (stopsSnapshot.empty) {
        return null;
      }

      const stops = stopsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.order - b.order);

      // Calculate ETAs
      const etas = stops.map(stop => {
        const distance = calculateDistance(
          newData.location.latitude,
          newData.location.longitude,
          stop.latitude,
          stop.longitude
        );

        // Use current speed if available, otherwise use average
        const speed = newData.speed || 8.33; // 30 km/h default
        const timeInSeconds = distance / speed;
        const adjustedTime = timeInSeconds * 1.2; // 20% buffer

        return {
          stopId: stop.id,
          stopName: stop.name,
          distance: Math.round(distance),
          eta: Math.round(adjustedTime),
          etaMinutes: Math.round(adjustedTime / 60),
          estimatedArrival: admin.firestore.Timestamp.fromMillis(
            Date.now() + adjustedTime * 1000
          )
        };
      });

      // Update bus document with ETAs
      await change.after.ref.update({
        etas: etas,
        etasLastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });

      // Check if any stop is approaching (within 5 minutes) and send notifications
      const approachingStops = etas.filter(eta => eta.etaMinutes <= 5);
      
      if (approachingStops.length > 0) {
        await sendApproachingNotifications(context.params.busId, approachingStops);
      }

      return null;
    } catch (error) {
      console.error('Error calculating ETAs:', error);
      return null;
    }
  });

/**
 * Send notifications to users when bus is approaching their selected stop
 */
async function sendApproachingNotifications(busId, approachingStops) {
  try {
    // Get users who have selected these stops
    const preferencesRef = db.collection('userPreferences');
    const preferencesSnapshot = await preferencesRef.get();

    const notifications = [];

    preferencesSnapshot.forEach(doc => {
      const prefs = doc.data();
      const selectedStopId = prefs.selectedStopId;
      const fcmToken = prefs.fcmToken;

      if (selectedStopId && fcmToken) {
        const approachingStop = approachingStops.find(
          stop => stop.stopId === selectedStopId
        );

        if (approachingStop) {
          notifications.push({
            token: fcmToken,
            notification: {
              title: '🚌 Bus Approaching',
              body: `${approachingStop.stopName} in ${approachingStop.etaMinutes} minute(s)`
            },
            data: {
              busId: busId,
              stopId: selectedStopId,
              etaMinutes: approachingStop.etaMinutes.toString()
            }
          });
        }
      }
    });

    // Send notifications in batches
    if (notifications.length > 0) {
      const messaging = admin.messaging();
      const batchSize = 500; // FCM batch limit

      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        await messaging.sendAll(batch);
      }

      console.log(`Sent ${notifications.length} approaching notifications`);
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

/**
 * Update admin statistics
 * Runs every 5 minutes
 */
exports.updateAdminStats = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      // Get active beacons count
      const sessionsRef = db.collection('sessions');
      const activeSessions = await sessionsRef
        .where('isActive', '==', true)
        .get();

      // Get active buses count
      const busesRef = db.collection('buses');
      const activeBuses = await busesRef
        .where('isActive', '==', true)
        .get();

      // Calculate peak hours (simplified - in production, aggregate by hour)
      const hour = new Date().getHours();
      const statsRef = db.collection('admin').doc('stats');
      
      await statsRef.set({
        activeBeacons: activeSessions.size,
        activeBuses: activeBuses.size,
        lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
        currentHour: hour,
        timestamp: Date.now()
      }, { merge: true });

      return null;
    } catch (error) {
      console.error('Error updating admin stats:', error);
      return null;
    }
  });

/**
 * HTTP endpoint to get bus ETAs (for external integrations)
 */
exports.getBusETAs = functions.https.onRequest(async (req, res) => {
  try {
    const busId = req.query.busId;

    if (!busId) {
      return res.status(400).json({ error: 'busId is required' });
    }

    const busRef = db.collection('buses').doc(busId);
    const busDoc = await busRef.get();

    if (!busDoc.exists) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const busData = busDoc.data();
    return res.json({
      busId: busId,
      etas: busData.etas || [],
      location: busData.location,
      lastUpdate: busData.lastUpdate
    });
  } catch (error) {
    console.error('Error getting bus ETAs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

