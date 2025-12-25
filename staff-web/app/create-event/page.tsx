'use client';

import React, { useState } from 'react';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '');


const CreateEventPage: React.FC = () => {
  const [collegeId, setCollegeId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_id: collegeId, name, type, date }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to create event');
      setMessage(body.message || 'Event created successfully!');
      setCollegeId('');
      setName('');
      setType('');
      setDate('');
    } catch (err: any) {
      console.error('Create event error:', err);
      setError(err.message || 'Error creating event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-block p-6 bg-white/20 backdrop-blur-md rounded-3xl mb-6">
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">🎉 Create Event</h1>
            </div>
            <p className="text-xl text-white/90 font-medium drop-shadow-md">Bring your campus community together with amazing events!</p>
          </div>

          <div className="card-modern p-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="collegeId" className="block text-gray-700 text-lg font-semibold mb-3">🏫 College ID</label>
                <input type="text" id="collegeId" className="input-modern" placeholder="Enter college identifier" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required />
              </div>

              <div>
                <label htmlFor="name" className="block text-gray-700 text-lg font-semibold mb-3">📝 Event Name</label>
                <input type="text" id="name" className="input-modern" placeholder="Enter event name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <label htmlFor="type" className="block text-gray-700 text-lg font-semibold mb-3">🏷️ Event Type</label>
                <select id="type" className="input-modern" value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="">Select Event Type</option>
                  <option value="Hackathon">🚀 Hackathon</option>
                  <option value="Workshop">🛠️ Workshop</option>
                  <option value="Tech Talk">💡 Tech Talk</option>
                  <option value="Fest">🎪 Fest</option>
                  <option value="Seminar">🎓 Seminar</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-gray-700 text-lg font-semibold mb-3">📅 Event Date</label>
                <input type="date" id="date" className="input-modern" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <button type="submit" className="btn-modern w-full text-lg" disabled={submitting}>
                {submitting ? 'Creating...' : '✨ Create Event'}
              </button>

              {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-fade-in">✅ {message}</div>}
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in">❌ Error: {error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
