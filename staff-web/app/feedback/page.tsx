'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

  const fetchFeedback = async () => {
    try {
      const response = await fetch('http://localhost:5001/staff/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      } else {
        setError('Failed to fetch feedback');
      }
    } catch (err) {
      setError('Error fetching feedback');
      console.error('Error fetching feedback:', err);
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-blue-600">{feedback.length}</div>
              <div className="text-gray-600">Total Feedback</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-yellow-600">
                {feedback.length > 0 
                  ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-2">😊</div>
              <div className="text-2xl font-bold text-green-600">
                {feedback.filter(f => f.rating >= 4).length}
              </div>
              <div className="text-gray-600">Positive (4+ stars)</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-2">😐</div>
              <div className="text-2xl font-bold text-orange-600">
                {feedback.filter(f => f.rating < 3).length}
              </div>
              <div className="text-gray-600">Needs Improvement</div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">All Feedback</h2>
          </div>
          
          {feedback.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Feedback Yet</h3>
              <p className="text-gray-500">Students haven't submitted any feedback yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {feedback.map((item) => (
                <div key={item.feedback_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {item.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{item.student_name}</h3>
                        <p className="text-gray-600 text-sm">{item.student_email}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(item.feedback_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="lg:text-right">
                      <h4 className="font-semibold text-gray-800">{item.event_name}</h4>
                      <p className="text-gray-600 text-sm">{item.event_type}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(item.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Rating:</span>
                      <div className="flex space-x-1">
                        {getRatingStars(item.rating)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(item.rating)}`}>
                        {item.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  {item.comment && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 italic">"{item.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
