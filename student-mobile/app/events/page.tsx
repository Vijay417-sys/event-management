'use client';

import React, { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import ClientOnly from '@/components/ClientOnly';

interface Event {
  event_id: number;
  college_id: string;
  name: string;
  type: string;
  date: string;
}

const StudentEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const fetchEvents = async () => {
      try {
        console.log('Fetching events from: http://10.30.179.189:5001/events');
        const response = await fetch('http://10.30.179.189:5001/events');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Event[] = await response.json();
        console.log('Events data:', data);
        setEvents(data);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="mobile-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-message error">
        <h3>Error Loading Events</h3>
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
      {/* Events List */}
      {events.length === 0 ? (
        <div className="mobile-card mobile-text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="mobile-text-large mobile-mb-4">No Events Available</h2>
          <p className="mobile-text-muted">
            Check back later for new events!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}
    </div>
    </ClientOnly>
  );
};

export default StudentEventsPage;