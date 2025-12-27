import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBeacons: 0,
    activeBeacons: 0,
    totalBuses: 0,
    activeBuses: 0,
    peakHours: [],
    routeEfficiency: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get active beacons count
      const sessionsRef = collection(db, 'sessions');
      const activeSessionsQuery = query(
        sessionsRef,
        orderBy('isActive', 'desc'),
        limit(100)
      );
      const sessionsSnapshot = await getDocs(activeSessionsQuery);
      
      const allSessions = sessionsSnapshot.docs.map(doc => doc.data());
      const activeBeacons = allSessions.filter(s => s.isActive).length;

      // Get buses count
      const busesRef = collection(db, 'buses');
      const busesSnapshot = await getDocs(busesRef);
      const allBuses = busesSnapshot.docs.map(doc => doc.data());
      const activeBuses = allBuses.filter(b => b.isActive).length;

      // Calculate peak hours (mock data - in real app, aggregate from sessions)
      const peakHours = generatePeakHoursData();

      // Route efficiency (mock data - in real app, calculate from actual data)
      const routeEfficiency = generateRouteEfficiencyData();

      setStats({
        totalBeacons: allSessions.length,
        activeBeacons,
        totalBuses: allBuses.length,
        activeBuses,
        peakHours,
        routeEfficiency
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePeakHoursData = () => {
    // Mock data - replace with actual aggregation
    return [
      { hour: '6 AM', beacons: 5 },
      { hour: '7 AM', beacons: 15 },
      { hour: '8 AM', beacons: 45 },
      { hour: '9 AM', beacons: 38 },
      { hour: '10 AM', beacons: 22 },
      { hour: '11 AM', beacons: 18 },
      { hour: '12 PM', beacons: 35 },
      { hour: '1 PM', beacons: 42 },
      { hour: '2 PM', beacons: 28 },
      { hour: '3 PM', beacons: 32 },
      { hour: '4 PM', beacons: 48 },
      { hour: '5 PM', beacons: 52 },
      { hour: '6 PM', beacons: 25 }
    ];
  };

  const generateRouteEfficiencyData = () => {
    // Mock data - replace with actual calculations
    return [
      { route: 'Route A', avgTime: 25, passengers: 120 },
      { route: 'Route B', avgTime: 30, passengers: 95 },
      { route: 'Route C', avgTime: 20, passengers: 150 },
      { route: 'Route D', avgTime: 35, passengers: 80 }
    ];
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          Refresh Data
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeBeacons}</div>
            <div className="stat-label">Active Beacons</div>
            <div className="stat-sublabel">of {stats.totalBeacons} total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚌</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeBuses}</div>
            <div className="stat-label">Active Buses</div>
            <div className="stat-sublabel">of {stats.totalBuses} total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.peakHours.reduce((max, h) => Math.max(max, h.beacons), 0)}
            </div>
            <div className="stat-label">Peak Hour Beacons</div>
            <div className="stat-sublabel">Highest usage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">
              {Math.round((stats.activeBeacons / Math.max(stats.totalBuses, 1)) * 10) / 10}
            </div>
            <div className="stat-label">Avg Beacons/Bus</div>
            <div className="stat-sublabel">Coverage ratio</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Peak Hours Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="beacons" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Route Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.routeEfficiency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="#667eea" name="Avg Time (min)" />
              <Line yAxisId="right" type="monotone" dataKey="passengers" stroke="#10b981" name="Passengers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insights-card card">
        <h3>Key Insights</h3>
        <ul className="insights-list">
          <li>
            <strong>Peak Usage:</strong> Most active beacons occur during{' '}
            {stats.peakHours.reduce((max, h) => h.beacons > max.beacons ? h : max, stats.peakHours[0])?.hour}
          </li>
          <li>
            <strong>Coverage:</strong> {stats.activeBuses > 0 
              ? `${Math.round((stats.activeBeacons / stats.activeBuses) * 100)}%` 
              : '0%'} of active buses have beacon coverage
          </li>
          <li>
            <strong>Most Efficient Route:</strong>{' '}
            {stats.routeEfficiency.length > 0
              ? stats.routeEfficiency.reduce((min, r) => r.avgTime < min.avgTime ? r : min, stats.routeEfficiency[0]).route
              : 'N/A'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;

