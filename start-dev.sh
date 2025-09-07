#!/bin/bash

# Campus Event Management System - Development Start Script
echo "🚀 Starting Campus Event Management System"
echo "=========================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if ports are available
echo "🔍 Checking port availability..."
if ! check_port 5001; then
    echo "❌ Backend port 5001 is in use. Please stop the existing service."
    exit 1
fi

if ! check_port 3000; then
    echo "❌ Staff portal port 3000 is in use. Please stop the existing service."
    exit 1
fi

if ! check_port 3001; then
    echo "❌ Student app port 3001 is in use. Please stop the existing service."
    exit 1
fi

echo "✅ All ports are available"

# Start Backend
echo ""
echo "🔧 Starting Backend Server..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Staff Portal
echo ""
echo "🌐 Starting Staff Portal..."
cd staff-web
npm run dev &
STAFF_PID=$!
cd ..

# Start Student App
echo ""
echo "📱 Starting Student Mobile App..."
cd student-mobile
npm run dev &
STUDENT_PID=$!
cd ..

echo ""
echo "🎉 All services started!"
echo "========================"
echo ""
echo "📊 Backend API: http://localhost:5001"
echo "👨‍🏫 Staff Portal: http://localhost:3000"
echo "🎓 Student App: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    kill $STAFF_PID 2>/dev/null
    kill $STUDENT_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
