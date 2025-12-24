'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/* ✅ BACKEND URL (works locally + deployed) */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

interface Feedback {
  feedback_id: number;
  student_id: number;
  event_id: number;
  rating: number;
  comment: string;
  feedback_date: string;
  event_name: string;
  event_type: string;
  event_date: string;
  student_name: string;
  student_email: string;
}

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  /* ✅ FIXED FETCH (NO localhost hardcoding) */
  const fetchFeedback = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/staff/feedback`);

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Error fetching feedback');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ⭐
      </span>
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchFeedback}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 Student Feedback
          </h1>
          <p className="text-gray-600 text-lg">
            View all student feedback for events
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-blue-600">
              {feedback.length}
            </div>
            <div className="text-gray-600">Total Feedback</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-600">
              {feedback.length > 0
                ? (
                    feedback.reduce((sum, f) => sum + f.rating, 0) /
                    feedback.length
                  ).toFixed(1)
                : '0.0'}
            </div>
            <div className="text-gray-600">Average Rating</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-2xl font-bold text-green-600">
              {feedback.filter((f) => f.rating >= 4).length}
            </div>
            <div className="text-gray-600">Positive</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl mb-2">😐</div>
            <div className="text-2xl font-bold text-orange-600">
              {feedback.filter((f) => f.rating < 3).length}
            </div>
            <div className="text-gray-600">Needs Improvement</div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {feedback.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500">No feedback yet.</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div
                key={item.feedback_id}
                className="p-6 border-b hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.student_name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.student_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.event_name}</p>
                    <p className="text-sm text-gray-500">{item.event_type}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {getRatingStars(item.rating)}
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getRatingColor(
                      item.rating
                    )}`}
                  >
                    {item.rating}/5
                  </span>
                </div>

                {item.comment && (
                  <p className="mt-3 italic text-gray-700">
                    “{item.comment}”
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
