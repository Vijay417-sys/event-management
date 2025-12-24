'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001').replace(/\/$/, '');

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

interface AttendanceRecord {
  att_id: number;
  student_id: number;
  event_id: number;
  status: string;
  marked_date: string;
}

const EventAttendancePage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const studentId = searchParams.get('student');

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [markingAttendance, setMarkingAttendance] = useState<number | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchRegistrations();
      fetchAttendanceRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/events`);
      if (response.ok) {
        const events = await response.json();
        const currentEvent = events.find((e: Event) => e.event_id === parseInt(eventId));
        setEvent(currentEvent || null);
      } else {
        console.error('Failed to fetch events for details:', response.status);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/staff/registrations/${eventId}`);
      if (response.ok) {
        const data: Registration[] = await response.json();
        setRegistrations(data);
      } else {
        console.error('Failed to fetch registrations:', response.status);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/staff/attendance/${eventId}`);
      if (response.ok) {
        const data: AttendanceRecord[] = await response.json();
        setAttendanceRecords(data);
      } else {
        console.error('Failed to fetch attendance records:', response.status);
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentIdNum: number, status: 'present' | 'absent') => {
    setMarkingAttendance(studentIdNum);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/staff/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentIdNum,
          event_id: parseInt(eventId, 10),
          status: status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark attendance');
      }

      setMessage(`Attendance marked as ${status} successfully!`);
      // Refresh attendance records
      await fetchAttendanceRecords();
    } catch (err: any) {
      setError(err.message || 'Error marking attendance');
    } finally {
      setMarkingAttendance(null);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'hackathon': return '💻';
      case 'workshop': return '🔧';
      case 'seminar': return '🎓';
      case 'fest': return '🎉';
      case 'tech talk': return '📡';
      default: return '📅';
    }
  };

  const getAttendanceStatus = (studentIdNum: number) => {
    const record = attendanceRecords.find(record => record.student_id === studentIdNum);
    return record ? record.status : null;
  };

  const getAttendanceIcon = (status: string | null) => {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      default: return '⏳';
    }
  };

  const getAttendanceColor = (status: string | null) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">✅</div>
          <h2 className="text-2xl font-bold text-gray-700">Loading attendance data...</h2>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
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
          <h1 className="text-5xl font-bold text-gradient mb-4">✅ Mark Attendance</h1>
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
                  <span className="font-semibold text-purple-800">Total Students:</span>
                  <p className="text-purple-600 font-bold text-lg">{registrations.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="max-w-4xl mx-auto mb-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
            ❌ {error}
          </div>
        )}

        {/* Attendance List */}
        <div className="max-w-6xl mx-auto">
          {registrations.length > 0 ? (
            <div className="card p-8 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                📋 Student Attendance ({registrations.length} students)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map((registration, index) => {
                  const attendanceStatus = getAttendanceStatus(registration.student_id);
                  return (
                    <div key={registration.reg_id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {registration.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{registration.name}</h4>
                          <p className="text-sm text-gray-600">{registration.email}</p>
                          <p className="text-xs text-gray-500">ID: {registration.student_id}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAttendanceColor(attendanceStatus)}`}>
                            {getAttendanceIcon(attendanceStatus)} {attendanceStatus || 'Not Marked'}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(registration.student_id, 'present')}
                          disabled={markingAttendance === registration.student_id}
                          className="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          {markingAttendance === registration.student_id ? '⏳' : '✅'} Present
                        </button>
                        <button
                          onClick={() => markAttendance(registration.student_id, 'absent')}
                          disabled={markingAttendance === registration.student_id}
                          className="flex-1 bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {markingAttendance === registration.student_id ? '⏳' : '❌'} Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-8xl mb-6">👥</div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">No Students Registered</h3>
              <p className="text-lg text-gray-500 mb-8">
                No students have registered for this event yet.
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

export default EventAttendancePage;
