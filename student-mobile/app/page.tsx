'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  eventsRegistered: number;
  eventsAttended: number;
}

const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ eventsRegistered: 0, eventsAttended: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch registrations
        const registrationsResponse = await fetch('http://10.30.179.189:5001/registrations');
        const registrations = await registrationsResponse.json();
        
        // Fetch attendance
        const attendanceResponse = await fetch('http://10.30.179.189:5001/attendance');
      const attendance = await attendanceResponse.json();
      
      setStats({
        eventsRegistered: registrations.length,
        eventsAttended: attendance.filter((a: any) => a.status === 'present').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {/* Quick Stats */}
      <div className="mobile-stats">
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">
            {loading ? '...' : stats.eventsRegistered}
          </div>
          <div className="mobile-stat-label">Events Registered</div>
        </div>
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">
            {loading ? '...' : stats.eventsAttended}
          </div>
          <div className="mobile-stat-label">Events Attended</div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-4">
        {[
          {
            href: '/events',
            icon: '🎉',
            title: 'Browse Events',
            description: 'Discover hackathons, workshops, tech talks, and more campus events'
          },
          {
            href: '/my-events',
            icon: '📋',
            title: 'My Events',
            description: 'View all events you have registered for and track your participation'
          },
          {
            href: '/feedback',
            icon: '💬',
            title: 'Give Feedback',
            description: 'Share your experience and help improve future events'
          },
          {
            href: '/attendance',
            icon: '📊',
            title: 'My Attendance',
            description: 'Track your attendance records and participation history'
          }
        ].map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <div className="mobile-card">
              <div className="mobile-flex">
                <div className="text-3xl mr-4">{feature.icon}</div>
                <div className="flex-1">
                  <h2 className="mobile-event-title">{feature.title}</h2>
                  <p className="mobile-event-details">{feature.description}</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mobile-card mobile-text-center">
        <h3 className="mobile-text-large mobile-mb-4">Quick Actions</h3>
        <div className="mobile-grid-3">
          <button className="mobile-btn-secondary text-sm">🔔</button>
          <button className="mobile-btn-secondary text-sm">⚙️</button>
          <button className="mobile-btn-secondary text-sm">📞</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

