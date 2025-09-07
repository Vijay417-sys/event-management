'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalFeedback: number;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttendance: 0,
    totalFeedback: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [eventsRes, registrationsRes, attendanceRes, feedbackRes] = await Promise.all([
        fetch('http://localhost:5001/events'),
        fetch('http://localhost:5001/registrations'),
        fetch('http://localhost:5001/attendance'),
        fetch('http://localhost:5001/staff/feedback')
      ]);

      const [events, registrations, attendance, feedback] = await Promise.all([
        eventsRes.json(),
        registrationsRes.json(),
        attendanceRes.json(),
        feedbackRes.json()
      ]);

      setStats({
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        totalAttendance: attendance.filter((a: any) => a.status === 'present').length,
        totalFeedback: feedback.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-white/10 rounded-full float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block p-6 bg-white/20 backdrop-blur-md rounded-3xl mb-6">
            <h1 className="text-6xl font-bold text-white mb-2 drop-shadow-lg">
              👨‍🏫 Staff Portal
            </h1>
          </div>
          <p className="text-xl text-white/90 font-medium drop-shadow-md max-w-3xl mx-auto">
            Modern Campus Event Management System
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Events', value: stats.totalEvents, icon: '📅', color: 'from-blue-500 to-blue-600' },
            { label: 'Registrations', value: stats.totalRegistrations, icon: '👥', color: 'from-green-500 to-green-600' },
            { label: 'Attendance', value: stats.totalAttendance, icon: '✅', color: 'from-purple-500 to-purple-600' },
            { label: 'Feedback', value: stats.totalFeedback, icon: '💬', color: 'from-orange-500 to-orange-600' }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="card-modern p-6 text-center hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {loading ? '...' : stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                href: '/create-event',
                icon: '➕',
                title: 'Create Event',
                description: 'Create new campus events including hackathons, workshops, tech talks, and fests.',
                features: ['Hackathons', 'Workshops', 'Tech Talks', 'Fests & Seminars'],
                color: 'from-emerald-500 to-teal-600',
                delay: '0s'
              },
              {
                href: '/events',
                icon: '🗓️',
                title: 'Manage Events',
                description: 'View all created events, manage registrations, and track student attendance.',
                features: ['View All Events', 'Track Registrations', 'Mark Attendance', 'Delete Events'],
                color: 'from-blue-500 to-indigo-600',
                delay: '0.1s'
              },
              {
                href: '/reports',
                icon: '📊',
                title: 'View Reports',
                description: 'Access comprehensive reports and analytics for all campus events.',
                features: ['Event Popularity', 'Attendance Reports', 'Student Participation', 'Feedback Analytics'],
                color: 'from-purple-500 to-pink-600',
                delay: '0.2s'
              },
              {
                href: '/feedback',
                icon: '💬',
                title: 'Student Feedback',
                description: 'View all student feedback and ratings for events.',
                features: ['View All Feedback', 'Rating Analytics', 'Student Comments', 'Feedback Trends'],
                color: 'from-orange-500 to-red-600',
                delay: '0.3s'
              }
            ].map((action, index) => (
              <Link 
                key={action.href}
                href={action.href}
                className="card-modern-interactive p-8 group"
                style={{ animationDelay: action.delay }}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r ${action.color} flex items-center justify-center text-4xl text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center group-hover:text-blue-600 transition-colors duration-300">
                  {action.title}
                </h2>
                <p className="text-gray-600 text-center leading-relaxed mb-6">
                  {action.description}
                </p>
                <div className="space-y-2 mb-6">
                  {action.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-gray-600 text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-16 text-center">
          <div className="inline-block p-6 bg-white/20 backdrop-blur-md rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="btn-modern-secondary">
                📈 View Analytics
              </button>
              <button className="btn-modern-secondary">
                📧 Send Notifications
              </button>
              <button className="btn-modern-secondary">
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

