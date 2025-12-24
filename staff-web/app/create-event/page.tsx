'use client';

import React, { useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const CreateEventPage: React.FC = () => {
  const [collegeId, setCollegeId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      if (!BACKEND_URL) {
        throw new Error('Backend URL is not configured');
      }

      const response = await fetch(`${BACKEND_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college_id: collegeId,
          name,
          type,
          date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      setMessage(data.message || 'Event created successfully!');
      setCollegeId('');
      setName('');
      setType('');
      setDate('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-animated">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">🎉 Create Event</h1>
            <p className="text-xl text-gray-600">
              Bring your campus community together
            </p>
          </div>

          <div className="card-modern p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">College ID</label>
                <input
                  type="text"
                  className="input-modern"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Event Name</label>
                <input
                  type="text"
                  className="input-modern"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Event Type</label>
                <select
                  className="input-modern"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Tech Talk">Tech Talk</option>
                  <option value="Fest">Fest</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Event Date</label>
                <input
                  type="date"
                  className="input-modern"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-modern w-full">
                Create Event
              </button>

              {message && (
                <div className="text-green-700 bg-green-100 p-3 rounded">
                  ✅ {message}
                </div>
              )}
              {error && (
                <div className="text-red-700 bg-red-100 p-3 rounded">
                  ❌ {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
