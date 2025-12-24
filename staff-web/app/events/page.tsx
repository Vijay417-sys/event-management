'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// ✅ Backend URL (env-based, deployment ready)
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

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
        // ✅ FIXED
        const response = await fetch(`${BACKEND_URL}/staff/events`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Event[] = await response.json();

        // Fetch attendance per event
        const eventsWithAttendance = await Promise.all(
          data.map(async (event) => {
            try {
              // ✅ FIXED
              const attendanceResponse = await fetch(
                `${BACKEND_URL}/staff/attendance/${event.event_id}`
              );

              if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                const presentCount = attendanceData.filter(
                  (att: any) => att.status === 'present'
                ).length;

                const attendancePercentage =
                  event.registration_count > 0
                    ? Math.round(
                        (presentCount / event.registration_count) * 100
                      )
                    : 0;

                return {
                  ...event,
                  attendance_count: presentCount,
                  attendance_percentage: attendancePercentage,
                };
              }
            } catch (err) {
              console.error(
                `Error fetching attendance for event ${event.event_id}:`,
                err
              );
            }

            return {
              ...event,
              attendance_count: 0,
              attendance_percentage: 0,
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
    if (
      !confirm(
        `Are you sure you want to delete "${eventName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingEvent(eventId);
    setMessage(null);
    setError(null);

    try {
      // ✅ FIXED
      const response = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete event');
      }

      setMessage(`Event "${eventName}" deleted successfully!`);

      // ✅ Refresh list
      const eventsResponse = await fetch(`${BACKEND_URL}/staff/events`);
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
          <h2 className="text-2xl font-bold text-gray-700">
            Loading events...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Events
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            📋 Manage Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View all events and their registration details.
          </p>
        </div>

        {message && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            ✅ {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div
              key={event.event_id}
              className="card p-6 hover:scale-105 transition-transform"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
              <p className="text-gray-600">{event.type}</p>

              <p className="mt-2">
                👥 {event.registration_count} Registered
              </p>
              <p>
                ✅ {event.attendance_count || 0} Attended (
                {event.attendance_percentage || 0}%)
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href={`/registrations/${event.event_id}`}
                  className="btn-primary block text-center"
                >
                  View Registrations
                </Link>

                <Link
                  href={`/attendance/${event.event_id}`}
                  className="btn-secondary block text-center"
                >
                  Mark Attendance
                </Link>

                <button
                  onClick={() =>
                    handleDeleteEvent(event.event_id, event.name)
                  }
                  disabled={deletingEvent === event.event_id}
                  className="btn-danger w-full"
                >
                  {deletingEvent === event.event_id
                    ? 'Deleting...'
                    : 'Delete Event'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-3xl font-bold">No Events Yet</h3>
            <Link href="/create-event" className="btn-primary mt-6 inline-block">
              Create New Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffEventsPage;
