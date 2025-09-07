'use client';

import React, { useState, useEffect } from 'react';

interface EventReport {
  event_name: string;
  total_registrations: number;
}

interface StudentReport {
  student_id: number;
  name: string;
  email: string;
  events_attended: number;
  total_registrations: number;
}

const ReportsPage: React.FC = () => {
  const [eventReports, setEventReports] = useState<EventReport[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [topStudents, setTopStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch event reports
      const eventResponse = await fetch('http://localhost:5001/reports/registrations');
      const eventData = await eventResponse.json();
      setEventReports(eventData);

      // Fetch top students
      const topStudentsResponse = await fetch('http://localhost:5001/reports/top_students');
      const topStudentsData = await topStudentsResponse.json();
      setTopStudents(topStudentsData);

      // Fetch student participation (mock data for now)
      setStudentReports([
        { student_id: 1, name: 'John Doe', email: 'john@example.com', events_attended: 5, total_registrations: 8 },
        { student_id: 2, name: 'Jane Smith', email: 'jane@example.com', events_attended: 4, total_registrations: 6 },
        { student_id: 3, name: 'Mike Johnson', email: 'mike@example.com', events_attended: 3, total_registrations: 5 },
      ]);

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hackathon': return '💻';
      case 'workshop': return '🔧';
      case 'seminar': return '🎓';
      case 'fest': return '🎉';
      case 'tech talk': return '📡';
      default: return '📅';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFeedbackColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">📊</div>
          <p className="text-xl text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-6xl font-bold text-gradient mb-4">📊 Reports & Analytics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive insights into campus events, student participation, and engagement metrics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50'
              }`}
            >
              📅 Event Reports
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'students'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-green-50'
              }`}
            >
              👥 Student Analytics
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'top'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              🏆 Top Performers
            </button>
          </div>

          {/* Event Reports Tab */}
          {activeTab === 'events' && (
            <div className="card p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                📅 Event Performance Report
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">Event</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-700">Date</th>
                      <th className="text-center py-4 px-2 font-semibold text-gray-700">Registrations</th>
                      <th className="text-center py-4 px-2 font-semibold text-gray-700">Attendance</th>
                      <th className="text-center py-4 px-2 font-semibold text-gray-700">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventReports.length > 0 ? (
                      eventReports.map((event, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2">
                            <div className="font-semibold text-gray-800">{event.event_name}</div>
                          </td>
                          <td className="py-4 px-2">
                            <span className="flex items-center space-x-2">
                              <span className="text-xl">📅</span>
                              <span className="text-gray-600">Event</span>
                            </span>
                          </td>
                          <td className="py-4 px-2 text-gray-600">N/A</td>
                          <td className="py-4 px-2 text-center">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {event.total_registrations}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold text-gray-600 bg-gray-100">
                              N/A
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold text-gray-600 bg-gray-100">
                              N/A
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <div className="text-4xl mb-2">📊</div>
                          <p>No event data available. Create some events to see reports!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Student Analytics Tab */}
          {activeTab === 'students' && (
            <div className="card p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                👥 Student Participation Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentReports.map((student, index) => (
                  <div key={student.student_id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Events Attended:</span>
                        <span className="font-semibold text-green-600">{student.events_attended}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Registrations:</span>
                        <span className="font-semibold text-blue-600">{student.total_registrations}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Participation Rate:</span>
                        <span className="font-semibold text-purple-600">
                          {Math.round((student.events_attended / student.total_registrations) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Performers Tab */}
          {activeTab === 'top' && (
            <div className="card p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                🏆 Top 3 Most Active Students
              </h2>
              <div className="space-y-6">
                {topStudents.length > 0 ? (
                  topStudents.map((student, index) => (
                    <div key={student.student_id} className={`p-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                      'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{student.name}</h3>
                            <p className="opacity-90">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{student.events_attended}</div>
                          <div className="text-sm opacity-90">Events Attended</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🏆</div>
                    <p className="text-gray-500">No student data available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
