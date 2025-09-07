'use client';

import React, { useEffect, useState } from 'react';
import ClientOnly from '@/components/ClientOnly';

interface Event {
  event_id: number;
  name: string;
  type: string;
  date: string;
  college_id: string;
}

const FeedbackPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://10.30.179.189:5001/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (err: any) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedEvent) {
      setError('Please select an event');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }

    if (!studentEmail.trim()) {
      setError('Please enter your email');
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      // First, find or create the student
      const studentResponse = await fetch('http://10.30.179.189:5001/students/find-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college_id: studentId,
          name: studentName,
          email: studentEmail
        }),
      });

      const studentData = await studentResponse.json();

      if (!studentResponse.ok) {
        throw new Error(studentData.error || 'Failed to find or create student');
      }

      // Then submit the feedback
      const feedbackResponse = await fetch('http://10.30.179.189:5001/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentData.student_id,
          event_id: selectedEvent,
          rating: rating,
          feedback_text: feedbackText
        }),
      });

      const feedbackData = await feedbackResponse.json();

      if (!feedbackResponse.ok) {
        throw new Error(feedbackData.error || 'Failed to submit feedback');
      }

      setMessage('✅ Feedback submitted successfully!');
      setRating(0);
      setFeedbackText('');
      setStudentName('');
      setStudentId('');
      setStudentEmail('');
      setSelectedEvent(null);
    } catch (err: any) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="mobile-spinner"></div>
        <p>Loading events...</p>
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
      <div className="mobile-form">
        <h2 className="mobile-form-title">💬 Give Feedback</h2>
        
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

        {events.length === 0 ? (
          <div className="mobile-card mobile-text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="mobile-text-large mobile-mb-4">No Events Available</h3>
            <p className="mobile-text-muted">
              There are no events available for feedback yet. Check back later when staff creates events!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback}>
            <div className="mobile-mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Select Event</label>
              <select
                className="mobile-input"
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(parseInt(e.target.value))}
                required
              >
                <option value="">Choose an event to give feedback for</option>
                {events.map((event) => (
                  <option key={event.event_id} value={event.event_id}>
                    {event.name} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Information */}
            <div className="mobile-mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
              <input
                type="text"
                className="mobile-input"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mobile-mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Student ID</label>
              <input
                type="text"
                className="mobile-input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
                required
              />
            </div>

            <div className="mobile-mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                className="mobile-input"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

          <div className="mobile-mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Rating (1-5 stars)</label>
            <div className="mobile-star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`mobile-star ${star <= rating ? 'active' : ''}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="mobile-text-center mobile-text-small mobile-text-muted">
              Selected: {rating} star{rating !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="mobile-mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Your Feedback</label>
            <textarea
              className="mobile-input"
              style={{ height: '120px', resize: 'none' }}
              placeholder="Share your thoughts about the event..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
            />
          </div>

            <button
              type="submit"
              className="mobile-btn"
              disabled={submitting || !selectedEvent || rating === 0 || !studentName.trim() || !studentId.trim() || !studentEmail.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
    </ClientOnly>
  );
};

export default FeedbackPage;