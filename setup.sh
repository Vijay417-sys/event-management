#!/bin/bash

# Campus Event Management System Setup Script
echo "🎓 Campus Event Management System Setup"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete"
cd ..

# Setup Staff Web Portal
echo ""
echo "🌐 Setting up Staff Web Portal..."
cd staff-web

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Staff Web Portal setup complete"
cd ..

# Setup Student Mobile App
echo ""
echo "📱 Setting up Student Mobile App..."
cd student-mobile

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Student Mobile App setup complete"
cd ..

# Setup Cordova APK (Optional)
echo ""
echo "📦 Setting up Cordova APK (Optional)..."
cd campus-events-apk

# Install dependencies
echo "Installing Cordova dependencies..."
npm install

echo "✅ Cordova APK setup complete"
cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the system:"
echo ""
echo "1. Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "2. Start Staff Portal (in new terminal):"
echo "   cd staff-web"
echo "   npm run dev"
echo ""
echo "3. Start Student App (in new terminal):"
echo "   cd student-mobile"
echo "   npm run dev"
echo ""
echo "Access URLs:"
echo "• Backend API: http://localhost:5001"
echo "• Staff Portal: http://localhost:3000"
echo "• Student App: http://localhost:3001"
echo ""
echo "📚 For detailed instructions, see README.md"
