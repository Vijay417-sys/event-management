'use client';

import React, { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://10.30.179.189:5001';

interface EventCardProps {
  event: {
    event_id: number;
    college_id: string;
    name: string;
    type: string;
    date: string;
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentCollegeId, setStudentCollegeId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setMessage(null);
    setError(null);

    try {
      const studentResponse = await fetch(`${API}/students/find-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college_id: studentCollegeId,
          name: studentName,
          email: studentEmail
        }),
      });

      const studentData = await studentResponse.json();

      if (!studentResponse.ok) {
        throw new Error(studentData.error || 'Failed to find or create student');
      }

      const registerResponse = await fetch(`${API}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentData.student_id,
          event_id: event.event_id
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error || 'Failed to register for event');
      }

      setMessage('Successfully registered for the event!');
      setShowRegistration(false);
      setStudentName('');
      setStudentEmail('');
      setStudentCollegeId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mobile-event-card">
      <div className="mobile-event-type">{event.type}</div>
      <h3 className="mobile-event-title">{event.name}</h3>
      <div className="mobile-event-details">
        <div className="mobile-flex-between">
          <span>📅 {formatDate(event.date)}</span>
          <span>🏫 {event.college_id}</span>
        </div>
      </div>

      {!showRegistration ? (
        <button onClick={() => setShowRegistration(true)} className="mobile-btn">Register for Event</button>
      ) : (
        <div className="mobile-form">
          <h4 className="mobile-form-title">Register for Event</h4>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Your Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="mobile-input" required />
            <input type="email" placeholder="Your Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="mobile-input" required />
            <input type="text" placeholder="College ID" value={studentCollegeId} onChange={(e) => setStudentCollegeId(e.target.value)} className="mobile-input" required />
            <div className="mobile-grid-2">
              <button type="submit" disabled={isRegistering} className="mobile-btn">{isRegistering ? 'Registering...' : 'Register'}</button>
              <button type="button" onClick={() => setShowRegistration(false)} className="mobile-btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className="mobile-message success">
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="mobile-message error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default EventCard;
