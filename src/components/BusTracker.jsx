import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { LocationTracker } from '../utils/locationTracker';
import { BeaconService } from '../services/beaconService';
import { BusService } from '../services/busService';
import { ETAService } from '../services/etaService';
import { OfflineStorage } from '../utils/offlineStorage';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const BusTracker = ({ userId }) => {
  // State management
  const [selectedBus, setSelectedBus] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [stops, setStops] = useState([]);
  const [etas, setEtas] = useState([]);
  const [buses, setBuses] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [busData, setBusData] = useState(null);
  const [beaconCount, setBeaconCount] = useState(0);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  // Refs
  const locationTrackerRef = useRef(null);
  const beaconServiceRef = useRef(null);
  const busServiceRef = useRef(null);
  const mapRef = useRef(null);
  const mountedRef = useRef(true);

  // Initialize services and data
  useEffect(() => {
    if (!userId) return;

    mountedRef.current = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Setting up services...');

        // Initialize services
        beaconServiceRef.current = new BeaconService(userId);
        busServiceRef.current = new BusService();

        setLoadingMessage('Loading data...');

        // Load data in parallel
        await Promise.all([
          checkActiveSession(),
          loadBuses()
        ]);

        if (mountedRef.current) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (mountedRef.current) {
          setIsLoading(false);
          setLocationError('Failed to initialize. Please refresh the page.');
        }
      }
    };

    initialize();

    // Online/offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (locationTrackerRef.current) {
        locationTrackerRef.current.stop();
      }
    };
  }, [userId]);

  const checkActiveSession = async () => {
    if (!beaconServiceRef.current) return;
  
    try {
      const session = await beaconServiceRef.current.getActiveSession();
      if (session && mountedRef.current) {
        setIsBeaconActive(true);
        setSelectedBus(session.busId);
        startLocationTracking();
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };
  
  const loadBuses = async () => {
    if (!busServiceRef.current) return;
    
    try {
      const activeBuses = await busServiceRef.current.getActiveBuses();
      
      if (mountedRef.current) {
        setBuses(activeBuses);
        
        if (activeBuses.length > 0 && !selectedBus) {
          setSelectedBus(activeBuses[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading buses:', error);
    }
  };

  // Subscribe to bus location updates
  useEffect(() => {
    if (!selectedBus || !beaconServiceRef.current) return;

    let isMounted = true;

    loadStops();

    const unsubscribe = beaconServiceRef.current.subscribeToBusLocation(
      selectedBus,
      (locationData) => {
        if (!isMounted) return;
        
        if (locationData.location) {
          setBusLocation({
            lat: locationData.location.latitude,
            lng: locationData.location.longitude
          });
          setBusData(locationData);
          setBeaconCount(locationData.beaconCount || 0);
        }
      }
    );

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [selectedBus]);

  const loadStops = async () => {
    if (!busServiceRef.current || !selectedBus) return;

    try {
      const bus = await busServiceRef.current.getBus(selectedBus);
      if (bus && bus.routeId && mountedRef.current) {
        const routeStops = await busServiceRef.current.getStopsForRoute(bus.routeId);
        setStops(routeStops);
      }
    } catch (error) {
      console.error('Error loading stops:', error);
    }
  };

  // Calculate ETAs when bus location or stops change
  useEffect(() => {
    if (busLocation && stops.length > 0) {
      const calculatedEtas = ETAService.calculateETAsForStops(
        { latitude: busLocation.lat, longitude: busLocation.lng },
        stops
      );
      setEtas(calculatedEtas);
    }
  }, [busLocation, stops]);

  const startLocationTracking = () => {
    if (locationTrackerRef.current) {
      locationTrackerRef.current.stop();
    }

    setLocationError(null);

    locationTrackerRef.current = new LocationTracker({
      onLocationUpdate: (location) => {
        if (!mountedRef.current) return;
        
        setUserLocation({
          lat: location.latitude,
          lng: location.longitude
        });

        if (isBeaconActive && beaconServiceRef.current) {
          beaconServiceRef.current.updateLocation(location);
        }
      },
      onError: (error) => {
        console.error('Location error:', error);
        if (mountedRef.current) {
          setLocationError('Unable to access your location. Please check permissions.');
        }
      },
      updateInterval: 10000,
      highAccuracy: true
    });

    locationTrackerRef.current.start();
  };

  const handleBeaconToggle = async (active) => {
    if (!beaconServiceRef.current || !selectedBus) return;

    if (active) {
      if (!userLocation) {
        setLocationError('Please allow location access to start beacon');
        startLocationTracking();
        return;
      }

      try {
        await beaconServiceRef.current.startBeacon(selectedBus, {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          accuracy: 10
        });
        setIsBeaconActive(true);
        startLocationTracking();
        setLocationError(null);
      } catch (error) {
        console.error('Error starting beacon:', error);
        setLocationError('Failed to start beacon. Please try again.');
      }
    } else {
      try {
        await beaconServiceRef.current.stopBeacon();
        setIsBeaconActive(false);
        if (locationTrackerRef.current) {
          locationTrackerRef.current.stop();
        }
      } catch (error) {
        console.error('Error stopping beacon:', error);
        setLocationError('Failed to stop beacon.');
      }
    }
  };

  // Map control functions
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleCenterOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(16);
    } else if (!userLocation) {
      setLocationError('Location not available');
      startLocationTracking();
    }
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const nextStop = etas.length > 0 ? etas[0] : null;
  const currentBus = buses.find(b => b.id === selectedBus);

  // Check if Google Maps API key is set
  const apiKey = import.meta.env.AIzaSyAI-igBUNSqOXz6aouzNTbL76uhBbttn_U;
  
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg max-w-md">
          <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configuration Error</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-600 mb-4"></div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Map Background Container */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={busLocation || userLocation || defaultCenter}
            zoom={15}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              streetViewControl: false
            }}
          >
            {/* Bus location marker */}
            {busLocation && (
              <Marker
                position={busLocation}
                title="Bus Location"
                icon={{
                  url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="24" r="20" fill="#2b8cee" opacity="0.3"/>
                      <circle cx="24" cy="24" r="16" fill="#2b8cee"/>
                      <text x="24" y="30" font-size="20" fill="white" text-anchor="middle">🚌</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(48, 48),
                  anchor: new window.google.maps.Point(24, 24)
                }}
              />
            )}

            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="Your Location"
                icon={{
                  url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#4285f4" opacity="0.2"/>
                      <circle cx="12" cy="12" r="6" fill="#4285f4" stroke="white" stroke-width="3"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(24, 24),
                  anchor: new window.google.maps.Point(12, 12)
                }}
              />
            )}

            {/* Stop markers */}
            {stops.map((stop) => (
              <Marker
                key={stop.id}
                position={{ lat: stop.latitude, lng: stop.longitude }}
                title={stop.name}
                icon={{
                  url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="6" fill="white" stroke="#64748b" stroke-width="2"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(16, 16)
                }}
              />
            ))}

            {/* Route polyline */}
            {stops.length > 1 && (
              <Polyline
                path={stops.map(s => ({ lat: s.latitude, lng: s.longitude }))}
                options={{
                  strokeColor: '#2b8cee',
                  strokeWeight: 4,
                  strokeOpacity: 0.6
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* UI Overlay Layer */}
      <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
        {/* Top App Bar */}
        <div className="pointer-events-auto p-4 pt-10 sm:pt-6">
          <div className="flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-blue-600 rounded-full w-10 h-10 border-2 border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl" role="img" aria-label="User">person</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 dark:text-white text-sm font-bold leading-tight">Smart Bus Tracker</h1>
                <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">{currentBus?.name || 'Campus Loop A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900/50">
              <div className="relative w-2.5 h-2.5 bg-green-500 rounded-full">
                <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
              </div>
              <span className="text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide">Live</span>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button 
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="flex w-10 h-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg active:scale-95 transition-transform border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">add</span>
          </button>
          <button 
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="flex w-10 h-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg active:scale-95 transition-transform border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">remove</span>
          </button>
          <button 
            onClick={handleCenterOnUser}
            aria-label="Center on my location"
            className="flex w-10 h-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg mt-2 active:scale-95 transition-transform hover:bg-blue-700"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">my_location</span>
          </button>
        </div>

        {/* Bottom Action Sheet */}
        <div className="pointer-events-auto mt-auto w-full">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-slate-100 dark:border-slate-800 pb-8">
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" role="presentation"></div>
            </div>

            {/* Content Container */}
            <div className="px-5 pt-2 flex flex-col gap-5">
              {/* Error Message */}
              {locationError && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4" role="alert">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl" aria-hidden="true">error</span>
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium flex-1">{locationError}</p>
                  <button 
                    onClick={() => setLocationError(null)}
                    aria-label="Dismiss error"
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
                  </button>
                </div>
              )}

              {/* Next Stop Card */}
              {nextStop && (
                <div className="flex items-stretch justify-between gap-4 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col justify-center gap-1 flex-[2_2_0px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg" aria-hidden="true">directions_bus</span>
                      <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">
                        Arriving in {nextStop.etaMinutes} {nextStop.etaMinutes === 1 ? 'min' : 'mins'}
                      </p>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                      Next Stop: <span className="text-slate-800 dark:text-slate-200 font-medium">{nextStop.stopName}</span>
                    </p>
                  </div>
                  <div className="w-20 bg-slate-100 dark:bg-slate-700 aspect-square rounded-xl shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-2xl" aria-hidden="true">place</span>
                  </div>
                </div>
              )}

              {/* "I'm on the Bus" Action Panel */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-slate-800/50 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Riding this bus?</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">Tap to improve tracking accuracy</p>
                </div>
                {/* Custom Toggle Switch */}
                <label className="relative flex h-8 w-14 cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-slate-600 p-1 transition-colors duration-200 has-[:checked]:bg-blue-600 has-[:checked]:justify-end">
                  <input 
                    className="peer sr-only" 
                    type="checkbox"
                    checked={isBeaconActive}
                    onChange={(e) => handleBeaconToggle(e.target.checked)}
                    aria-label="Toggle beacon tracking"
                  />
                  <div className="h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-200 peer-checked:translate-x-6"></div>
                </label>
              </div>

              {/* Profile Stats / Trip Metrics */}
              <div className="flex flex-wrap gap-3" role="region" aria-label="Bus statistics">
                {/* Speed */}
                <div className="flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 items-center text-center">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mb-1 text-xl" aria-hidden="true">speed</span>
                  <p className="text-slate-900 dark:text-white tracking-tight text-xl font-bold leading-tight">
                    {busData?.speed ? Math.round(busData.speed * 2.237) : '--'} <span className="text-sm font-medium text-slate-500">mph</span>
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Speed</p>
                </div>

                {/* ETA Destination */}
                <div className="flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 items-center text-center">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mb-1 text-xl" aria-hidden="true">schedule</span>
                  <p className="text-slate-900 dark:text-white tracking-tight text-xl font-bold leading-tight">
                    {etas.length > 0 ? etas[etas.length - 1].etaMinutes : '--'} <span className="text-sm font-medium text-slate-500">min</span>
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">To Dest</p>
                </div>

                {/* Beacon Count */}
                <div className="flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 items-center text-center">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mb-1 text-xl" aria-hidden="true">group</span>
                  <p className="text-slate-900 dark:text-white tracking-tight text-xl font-bold leading-tight">
                    {beaconCount}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Riders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="absolute top-20 right-4 z-20 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>Offline Mode</span>
        </div>
      )}
    </div>
  );
};

export default BusTracker;
