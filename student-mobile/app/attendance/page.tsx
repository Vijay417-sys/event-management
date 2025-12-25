'use client';

import React, { useEffect, useState } from 'react';
import ClientOnly from '@/components/ClientOnly';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://10.30.179.189:5001';

interface AttendanceRecord {
  attendance_id: number;
  student_id: number;
  event_id: number;
  status: string;
  marked_date: string;
  event_name: string;
  event_type: string;
  event_date: string;
}

const StudentAttendancePage: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`${API}/attendance`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAttendanceRecords(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present': return '✅';
      case 'absent': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="mobile-spinner"></div>
        <p>Loading attendance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-message error">
        <h3>Error Loading Attendance</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mobile-btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div className="mobile-loading">
        <div className="mobile-spinner"></div>
        <p>Loading...</p>
      </div>
    }>
      <div>
      {attendanceRecords.length > 0 ? (
        <div className="space-y-4">
          {attendanceRecords.map((record) => (
            <div key={record.attendance_id} className="mobile-event-card">
              <div className="mobile-flex-between mobile-mb-4">
                <div className="mobile-flex">
                  <span className="text-2xl mr-3">{getEventTypeIcon(record.event_type)}</span>
                  <div>
                    <h3 className="mobile-event-title">{record.event_name}</h3>
                    <p className="mobile-event-details">{record.event_type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(record.status)}`}>
                  {getStatusIcon(record.status)} {String(record.status).toUpperCase()}
                </span>
              </div>
              
              <div className="mobile-grid-2">
                <div className="mobile-text-center">
                  <span className="mobile-text-small mobile-text-muted">Event Date:</span>
                  <p className="mobile-text-large">
                    {record.event_date ? new Date(record.event_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="mobile-text-center">
                  <span className="mobile-text-small mobile-text-muted">Attendance Marked:</span>
                  <p className="mobile-text-large">
                    {record.marked_date ? new Date(record.marked_date).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mobile-card mobile-text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="mobile-text-large mobile-mb-4">No Attendance Records</h3>
          <p className="mobile-text-muted">
            Your attendance hasn't been marked for any events yet. Register for events and attend them to see your attendance records here.
          </p>
        </div>
      )}
    </div>
    </ClientOnly>
  );
};

export default StudentAttendancePage;
