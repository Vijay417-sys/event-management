'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// put near the top of the file (below imports)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';


interface Event {
  event_id: number;
  college_id: string;
  name: string;
  type: string;
  date: string;
  registration_count: number;
  attendance_count?: number;
  attendance_percentage?: number;
}

const StaffEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/staff/events`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Event[] = await response.json();
        
        // Fetch attendance data for each event
        const eventsWithAttendance = await Promise.all(
          data.map(async (event) => {
            try {
              const attendanceResponse = await fetch(`http://localhost:5001/staff/attendance/${event.event_id}`);
              if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                const presentCount = attendanceData.filter((att: any) => att.status === 'present').length;
                const attendancePercentage = event.registration_count > 0 
                  ? Math.round((presentCount / event.registration_count) * 100) 
                  : 0;
                
                return {
                  ...event,
                  attendance_count: presentCount,
                  attendance_percentage: attendancePercentage
                };
              }
            } catch (err) {
              console.error(`Error fetching attendance for event ${event.event_id}:`, err);
            }
            return {
              ...event,
              attendance_count: 0,
              attendance_percentage: 0
            };
          })
        );
        
        setEvents(eventsWithAttendance);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId: number, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone and will also delete all related registrations and attendance records.`)) {
      return;
    }

    setDeletingEvent(eventId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5001/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete event');
      }

      setMessage(`Event "${eventName}" deleted successfully!`);
      // Refresh the events list
      const eventsResponse = await fetch('http://localhost:5001/staff/events');
      if (eventsResponse.ok) {
        const updatedEvents = await eventsResponse.json();
        setEvents(updatedEvents);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-700">Loading events...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Events</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-5xl font-bold text-gradient mb-4">📋 Manage Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View all events and their registration details.
          </p>
        </div>

        {message && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
            ❌ {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div key={event.event_id} className="card p-6 animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{event.name}</h3>
                <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                  {event.type}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{event.date}</span>
                </div>
                
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-semibold">College: {event.college_id}</span>
                </div>
                
                <div className="flex items-center text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold">{event.registration_count} Students Registered</span>
                </div>
                
                <div className="flex items-center text-gray-600 bg-green-50 p-3 rounded-lg">
                  <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">
                    {event.attendance_count || 0} Students Attended 
                    ({event.attendance_percentage || 0}%)
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Link 
                    href={`/registrations/${event.event_id}`}
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    👥 View Registrations
                  </Link>
                  <Link 
                    href={`/attendance/${event.event_id}`}
                    className="btn-secondary flex-1 text-center text-sm"
                  >
                    ✅ Mark Attendance
                  </Link>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.event_id, event.name)}
                  disabled={deletingEvent === event.event_id}
                  className="btn-danger w-full text-sm"
                >
                  {deletingEvent === event.event_id ? '🗑️ Deleting...' : '🗑️ Delete Event'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-8xl mb-6">🎉</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No Events Yet</h3>
            <p className="text-lg text-gray-500 mb-8">Create your first event to get started!</p>
            <Link href="/create-event" className="btn-primary inline-block">
              Create New Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffEventsPage;

