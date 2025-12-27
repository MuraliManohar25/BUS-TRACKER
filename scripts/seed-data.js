/**
 * Seed script for initial Firestore data
 * Run with: node scripts/seed-data.js
 * 
 * Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * or use Firebase Admin SDK with service account
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Download from Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample data
const routes = [
  {
    id: 'route-1',
    name: 'Campus Loop',
    description: 'Main campus circular route',
    color: '#667eea'
  },
  {
    id: 'route-2',
    name: 'North-South Express',
    description: 'Direct route from north to south campus',
    color: '#10b981'
  }
];

const stops = [
  // Route 1 stops
  {
    id: 'stop-1-1',
    routeId: 'route-1',
    name: 'Main Entrance',
    latitude: 37.7749,
    longitude: -122.4194,
    order: 1
  },
  {
    id: 'stop-1-2',
    routeId: 'route-1',
    name: 'Library',
    latitude: 37.7849,
    longitude: -122.4094,
    order: 2
  },
  {
    id: 'stop-1-3',
    routeId: 'route-1',
    name: 'Student Center',
    latitude: 37.7949,
    longitude: -122.3994,
    order: 3
  },
  {
    id: 'stop-1-4',
    routeId: 'route-1',
    name: 'Science Building',
    latitude: 37.8049,
    longitude: -122.3894,
    order: 4
  },
  // Route 2 stops
  {
    id: 'stop-2-1',
    routeId: 'route-2',
    name: 'North Campus',
    latitude: 37.8149,
    longitude: -122.3794,
    order: 1
  },
  {
    id: 'stop-2-2',
    routeId: 'route-2',
    name: 'South Campus',
    latitude: 37.7649,
    longitude: -122.4294,
    order: 2
  }
];

const buses = [
  {
    id: 'bus-1',
    routeId: 'route-1',
    name: 'Bus 1',
    isActive: true,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10,
      timestamp: Date.now()
    },
    beaconCount: 0,
    speed: 0,
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'bus-2',
    routeId: 'route-2',
    name: 'Bus 2',
    isActive: true,
    location: {
      latitude: 37.8149,
      longitude: -122.3794,
      accuracy: 10,
      timestamp: Date.now()
    },
    beaconCount: 0,
    speed: 0,
    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Seed routes
    console.log('Seeding routes...');
    for (const route of routes) {
      const { id, ...routeData } = route;
      await db.collection('routes').doc(id).set(routeData);
      console.log(`✓ Created route: ${route.name}`);
    }

    // Seed stops
    console.log('Seeding stops...');
    for (const stop of stops) {
      const { id, ...stopData } = stop;
      await db.collection('stops').doc(id).set(stopData);
      console.log(`✓ Created stop: ${stop.name}`);
    }

    // Seed buses
    console.log('Seeding buses...');
    for (const bus of buses) {
      const { id, ...busData } = bus;
      await db.collection('buses').doc(id).set(busData);
      console.log(`✓ Created bus: ${bus.name}`);
    }

    console.log('\n✅ Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run seeding
seedData();

