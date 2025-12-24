'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/events`);
      if (response.ok) {
        const events = await response.json();
        const currentEvent = events.find(
          (e: Event) => e.event_id === parseInt(eventId)
        );
        setEvent(currentEvent || null);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/staff/registrations/${eventId}`
      );
      if (response.ok) {
        const data: Registration[] = await response.json();
        setRegistrations(data);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/staff/attendance/${eventId}`
      );
      if (response.ok) {
        const data: AttendanceRecord[] = await response.json();
        setAttendanceRecords(data);
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (
    studentId: number,
    status: 'present' | 'absent'
  ) => {
    setMarkingAttendance(studentId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/staff/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          event_id: parseInt(eventId),
          status
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark attendance');
      }

      setMessage(`Attendance marked as ${status} successfully!`);
      fetchAttendanceRecords();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMarkingAttendance(null);
    }
  };

  const getAttendanceStatus = (studentId: number) => {
    const record = attendanceRecords.find(
      r => r.student_id === studentId
    );
    return record ? record.status : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">Loading attendance...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <Link href="/events" className="text-blue-600 mb-6 inline-block">
        ← Back to Events
      </Link>

      {event && (
        <h1 className="text-3xl font-bold mb-6">
          Mark Attendance – {event.name}
        </h1>
      )}

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registrations.map(reg => {
          const status = getAttendanceStatus(reg.student_id);
          return (
            <div key={reg.reg_id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{reg.name}</h3>
              <p className="text-sm text-gray-600">{reg.email}</p>
              <p className="text-sm mb-2">
                Status: {status || 'Not marked'}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    markAttendance(reg.student_id, 'present')
                  }
                  disabled={markingAttendance === reg.student_id}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Present
                </button>
                <button
                  onClick={() =>
                    markAttendance(reg.student_id, 'absent')
                  }
                  disabled={markingAttendance === reg.student_id}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventAttendancePage;
