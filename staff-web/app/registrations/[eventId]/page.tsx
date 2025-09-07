'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Registration {
  reg_id: number;
  student_id: number;
  event_id: number;
  name: string;
  email: string;
  registration_date: string;
  college_id: string;
}

interface Event {
  event_id: number;
  name: string;
  type: string;
  date: string;
  college_id: string;
}

const EventRegistrationsPage: React.FC = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchRegistrations();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5001/events`);
      if (response.ok) {
        const events = await response.json();
        const currentEvent = events.find((e: Event) => e.event_id === parseInt(eventId));
        setEvent(currentEvent || null);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/staff/registrations/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Registration[] = await response.json();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hackathon': return '💻';
      case 'workshop': return '🔧';
      case 'seminar': return '🎓';
      case 'fest': return '🎉';
      case 'tech talk': return '📡';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">👥</div>
          <h2 className="text-2xl font-bold text-gray-700">Loading registrations...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Registrations</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/events" className="btn-primary">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Link href="/events" className="text-blue-600 hover:text-blue-800 transition-colors">
              ← Back to Events
            </Link>
          </div>
          <h1 className="text-5xl font-bold text-gradient mb-4">👥 Event Registrations</h1>
          {event && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto shadow-lg">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="text-3xl">{getEventTypeIcon(event.type)}</span>
                <h2 className="text-2xl font-bold text-gray-800">{event.name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="font-semibold text-blue-800">Type:</span>
                  <p className="text-blue-600">{event.type}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <span className="font-semibold text-green-800">Date:</span>
                  <p className="text-green-600">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="font-semibold text-purple-800">Total Registrations:</span>
                  <p className="text-purple-600 font-bold text-lg">{registrations.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Registrations List */}
        <div className="max-w-6xl mx-auto">
          {registrations.length > 0 ? (
            <div className="card p-8 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                📋 Registered Students ({registrations.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">Student</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">Student ID</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">Registration Date</th>
                      <th className="text-center py-4 px-2 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration, index) => (
                      <tr key={registration.reg_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {registration.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{registration.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-gray-600">{registration.email}</td>
                        <td className="py-4 px-2">
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {registration.student_id}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-600">
                          {new Date(registration.registration_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-2 text-center">
                          <Link
                            href={`/attendance/${eventId}?student=${registration.student_id}`}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-green-200 transition-colors"
                          >
                            ✅ Mark Attendance
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-8xl mb-6">👥</div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">No Registrations Yet</h3>
              <p className="text-lg text-gray-500 mb-8">
                Students haven't registered for this event yet. Share the event with students to get registrations!
              </p>
              <Link href="/events" className="btn-primary">
                ← Back to Events
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationsPage;
