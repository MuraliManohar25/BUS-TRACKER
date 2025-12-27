import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl">
          <div className="mb-8">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">directions_bus</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Smart Bus Tracker
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
              Real-time campus shuttle tracking
            </p>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Powered by students, for students
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/tracker"
              className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">map</span>
              Track Buses
            </Link>
            <Link
              to="/admin"
              className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-4 px-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">location_on</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Real-Time</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">privacy_tip</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Private</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">battery_saver</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Efficient</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary text-2xl mb-2">schedule</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Accurate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
