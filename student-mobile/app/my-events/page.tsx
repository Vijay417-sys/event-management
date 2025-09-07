'use client';

import React, { useEffect, useState } from 'react';
import ClientOnly from '@/components/ClientOnly';

interface MyEvent {
  event_id: number;
  name: string;
  type: string;
  date: string;
  college_id: string;
  registration_date: string;
}

interface FeedbackForm {
  eventId: number;
  eventName: string;
  rating: number;
  feedbackText: string;
}

const MyEventsPage: React.FC = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    eventId: 0,
    eventName: '',
    rating: 0,
    feedbackText: ''
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    
    const fetchMyEvents = async () => {
      try {
        const response = await fetch('http://10.30.179.189:5001/registrations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const openFeedbackForm = (event: MyEvent) => {
    setFeedbackForm({
      eventId: event.event_id,
      eventName: event.name,
      rating: 0,
      feedbackText: ''
    });
    setShowFeedbackForm(true);
    setFeedbackMessage(null);
  };

  const closeFeedbackForm = () => {
    setShowFeedbackForm(false);
    setFeedbackForm({
      eventId: 0,
      eventName: '',
      rating: 0,
      feedbackText: ''
    });
    setFeedbackMessage(null);
  };

  const handleRatingClick = (rating: number) => {
    setFeedbackForm(prev => ({ ...prev, rating }));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (feedbackForm.rating === 0) {
      setFeedbackMessage('Please select a rating');
      return;
    }

    try {
      const response = await fetch('http://10.30.179.189:5001/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: 1, // This should be dynamic in a real app
          event_id: feedbackForm.eventId,
          rating: feedbackForm.rating,
          feedback_text: feedbackForm.feedbackText
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setFeedbackMessage('✅ Feedback submitted successfully!');
      setTimeout(() => {
        closeFeedbackForm();
      }, 2000);
    } catch (err: any) {
      setFeedbackMessage(`❌ Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mobile-animated flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">⏳</div>
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Loading your events...</h2>
          <div className="w-16 h-1 bg-white/30 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mobile-animated flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">❌</div>
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Error Loading Events</h2>
          <p className="text-white/80 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-mobile-animated flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">⏳</div>
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Loading...</h2>
          <div className="w-16 h-1 bg-white/30 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-mobile-animated">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 w-16 h-16 bg-white/10 rounded-full float-mobile"></div>
        <div className="absolute top-40 right-6 w-12 h-12 bg-white/10 rounded-full float-mobile" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-white/10 rounded-full float-mobile" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-white/10 rounded-full float-mobile" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up-mobile">
          <div className="inline-block p-4 glass-mobile mb-4">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              📋 My Events
            </h1>
          </div>
          <p className="text-lg text-white/90 font-medium drop-shadow-md max-w-sm mx-auto">
            Events you have registered for
          </p>
        </div>
        
        <div className="space-y-6">
          {events.map((event, index) => (
            <div 
              key={event.event_id} 
              className="card-mobile-interactive animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex-1">{event.name}</h3>
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  {event.type}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📅</span>
                  </div>
                  <span className="font-semibold">{event.date}</span>
                </div>
                
                <div className="flex items-center text-gray-600 bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🏫</span>
                  </div>
                  <span className="font-semibold">College: {event.college_id}</span>
                </div>
                
                <div className="flex items-center text-gray-600 bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✅</span>
                  </div>
                  <span className="font-semibold">Registered: {new Date(event.registration_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => openFeedbackForm(event)}
                  className="btn-mobile flex-1 text-center group"
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">💬</span>
                  <span className="ml-2">Give Feedback</span>
                </button>
                <button className="btn-mobile-secondary flex-1 text-center group">
                  <span className="group-hover:scale-110 transition-transform duration-200">📊</span>
                  <span className="ml-2">View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-8xl mb-6 animate-bounce">📅</div>
            <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">No Events Registered</h3>
            <p className="text-white/80 text-lg mb-8">You haven't registered for any events yet.</p>
            <a href="/events" className="btn-mobile inline-block">
              Browse Available Events
            </a>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-slide-up-mobile">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">💬 Give Feedback</h2>
              <button 
                onClick={closeFeedbackForm}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Event: {feedbackForm.eventName}</p>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
                        star <= feedbackForm.rating
                          ? 'bg-yellow-400 text-white scale-110'
                          : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Comments (Optional)</label>
                <textarea
                  value={feedbackForm.feedbackText}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedbackText: e.target.value }))}
                  className="input-mobile w-full h-24 resize-none"
                  placeholder="Share your experience..."
                />
              </div>
              
              {feedbackMessage && (
                <div className={`p-3 rounded-xl text-center font-medium ${
                  feedbackMessage.includes('✅') 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {feedbackMessage}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeFeedbackForm}
                  className="btn-mobile-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-mobile flex-1"
                  disabled={feedbackForm.rating === 0}
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ClientOnly>
  );
};

export default MyEventsPage;

