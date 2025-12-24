'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001').replace(/\/$/, '');

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
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/staff/events`);
      if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
      const data: Event[] = await res.json();

      const eventsWithAttendance = await Promise.all(
        data.map(async (event) => {
          try {
            const attRes = await fetch(`${BACKEND_URL}/staff/attendance/${event.event_id}`);
            if (!attRes.ok) return { ...event, attendance_count: 0, attendance_percentage: 0 };
            const attendanceData = await attRes.json();
            const presentCount = attendanceData.filter((att: any) => att.status === 'present').length;
            const attendancePercentage = event.registration_count > 0
              ? Math.round((presentCount / event.registration_count) * 100)
              : 0;
            return { ...event, attendance_count: presentCount, attendance_percentage: attendancePercentage };
          } catch (err) {
            console.error(`Error fetching attendance for event ${event.event_id}:`, err);
            return { ...event, attendance_count: 0, attendance_percentage: 0 };
          }
        })
      );

      setEvents(eventsWithAttendance);
    } catch (err: any) {
      console.error('Fetch events error:', err);
      setError(err.message || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone and will also delete all related registrations and attendance records.`)) return;

    setDeletingEvent(eventId);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/events/${eventId}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to delete event');
      setMessage(`Event "${eventName}" deleted successfully!`);
      await fetchEvents();
    } catch (err: any) {
      console.error('Delete event error:', err);
      setError(err.message || 'Failed to delete event');
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">View all events and their registration details.</p>
        </div>

        {message && <div className="max-w-2xl mx-auto mb-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">✅ {message}</div>}
        {error && <div className="max-w-2xl mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">❌ {error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div key={event.event_id} className="card p-6 animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{event.name}</h3>
                <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">{event.type}</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold">{event.date}</span>
                </div>

                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold">College: {event.college_id}</span>
                </div>

                <div className="flex items-center text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <span className="font-semibold">{event.registration_count} Students Registered</span>
                </div>

                <div className="flex items-center text-gray-600 bg-green-50 p-3 rounded-lg">
                  <span className="font-semibold">{event.attendance_count || 0} Students Attended ({event.attendance_percentage || 0}%)</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Link href={`/registrations/${event.event_id}`} className="btn-primary flex-1 text-center text-sm">👥 View Registrations</Link>
                  <Link href={`/attendance/${event.event_id}`} className="btn-secondary flex-1 text-center text-sm">✅ Mark Attendance</Link>
                </div>
                <button onClick={() => handleDeleteEvent(event.event_id, event.name)} disabled={deletingEvent === event.event_id} className="btn-danger w-full text-sm">
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
            <Link href="/create-event" className="btn-primary inline-block">Create New Event</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffEventsPage;
