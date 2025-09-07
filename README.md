# 🎓 Campus Event Management System

A comprehensive, modern event management platform designed for educational institutions. This system provides separate applications for staff and students, enabling efficient event creation, registration, attendance tracking, and feedback collection.

## 🏗️ Project Architecture

```
event-management/
├── backend/              # Flask API Server
├── staff-web/           # Staff Web Portal (Next.js)
├── student-mobile/      # Student Mobile App (Next.js + Capacitor)
├── campus-events-apk/   # Cordova Android App
└── Task-Management/     # Legacy Backend (Reference)
```

## ✨ Features

### 🎯 Staff Web Portal
- **Event Management**: Create, view, and delete campus events
- **Registration Tracking**: Monitor student registrations for each event
- **Attendance Management**: Mark and track student attendance
- **Analytics Dashboard**: Comprehensive reports and statistics
- **Feedback Review**: View all student feedback and ratings

### 📱 Student Mobile App
- **Event Discovery**: Browse available campus events
- **Easy Registration**: Simple one-tap event registration
- **My Events**: Track registered events and participation status
- **Feedback System**: Rate events and provide written feedback
- **Attendance Tracking**: View personal attendance records

### 🔧 Backend API
- **RESTful Design**: Clean, well-documented API endpoints
- **Database Flexibility**: Supports both SQLite and MySQL
- **CORS Enabled**: Cross-origin resource sharing for web apps
- **Comprehensive Reports**: Advanced analytics and reporting features

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- MySQL (optional, SQLite is default)

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install Flask Flask-CORS PyMySQL
python app.py
```

The backend will run on `http://localhost:5001`

### 2. Staff Web Portal

```bash
cd staff-web
npm install
npm run dev
```

Access the staff portal at `http://localhost:3000`

### 3. Student Mobile App

```bash
cd student-mobile
npm install
npm run dev
```

Access the student app at `http://localhost:3001`

### 4. Android APK (Optional)

```bash
cd campus-events-apk
npm install
cordova platform add android
cordova build android
```

## 🗄️ Database Configuration

### SQLite (Default)
The system uses SQLite by default. No additional setup required.

### MySQL (Optional)
Edit `backend/config.py`:

```python
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'your_username',
    'password': 'your_password',
    'database': 'campus_events',
    'charset': 'utf8mb4'
}
USE_MYSQL = True
```

## 📊 Database Schema

### Core Tables
- **Events**: Event information (name, type, date, college_id)
- **Students**: Student information (name, email, college_id)
- **Registrations**: Student event registrations
- **Attendance**: Event attendance tracking
- **Feedback**: Student feedback and ratings

### Relationships
- Students can register for multiple events
- Each registration can have attendance records
- Each registration can have feedback entries
- Cascade deletion maintains data integrity

## 🔌 API Endpoints

### Event Management
- `GET /events` - Get all events
- `POST /events` - Create new event
- `DELETE /events/<id>` - Delete event

### Student Management
- `POST /students` - Create student
- `POST /students/find-or-create` - Find or create student
- `POST /register` - Register student for event

### Attendance & Feedback
- `POST /attendance` - Mark attendance
- `POST /feedback` - Submit feedback
- `GET /attendance` - Get attendance records

### Staff Endpoints
- `GET /staff/events` - Get events with registration counts
- `GET /staff/registrations/<event_id>` - Get event registrations
- `POST /staff/attendance` - Mark attendance (staff)
- `GET /staff/feedback` - Get all feedback

### Reports & Analytics
- `GET /reports/registrations` - Registration statistics
- `GET /reports/attendance` - Attendance percentages
- `GET /reports/feedback` - Feedback analytics
- `GET /reports/event_analysis` - Comprehensive event analysis
- `GET /reports/student_analysis/<student_id>` - Student participation report

## 🎨 Technology Stack

### Backend
- **Python 3.8+**: Core language
- **Flask**: Web framework
- **SQLite/MySQL**: Database
- **Flask-CORS**: Cross-origin support
- **PyMySQL**: MySQL connector

### Frontend Applications
- **Next.js 13**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React 18**: Modern React features

### Mobile Development
- **Capacitor**: Native mobile app framework
- **Cordova**: Alternative mobile framework
- **PWA Support**: Progressive Web App features

## 📱 Mobile App Features

### Progressive Web App (PWA)
- Offline capability
- App-like experience
- Push notifications support
- Installable on mobile devices

### Native App (Capacitor)
- Full native functionality
- Access to device features
- App store distribution ready
- Cross-platform compatibility

## 🔧 Development

### Project Structure
```
staff-web/
├── app/                 # Next.js App Router pages
│   ├── events/         # Event management pages
│   ├── create-event/   # Event creation
│   ├── reports/        # Analytics dashboard
│   └── feedback/       # Feedback management
├── components/         # Reusable components
└── globals.css        # Global styles

student-mobile/
├── app/               # Mobile-optimized pages
│   ├── events/       # Event browsing
│   ├── my-events/    # Personal events
│   ├── feedback/     # Feedback submission
│   └── attendance/   # Attendance tracking
├── components/       # Mobile components
└── public/          # PWA assets
```

### Environment Configuration
- Backend runs on port 5001
- Staff web runs on port 3000
- Student mobile runs on port 3001
- All apps support hot reloading

## 🚀 Deployment

### Production Setup
1. **Backend**: Deploy Flask app with Gunicorn
2. **Frontend**: Build and serve static files
3. **Database**: Use MySQL for production
4. **Mobile**: Build APK/IPA for app stores

### Docker Support (Future)
- Containerized deployment
- Environment isolation
- Easy scaling

## 📈 Analytics & Reporting

### Staff Dashboard
- Total events created
- Registration statistics
- Attendance tracking
- Feedback analytics

### Student Analytics
- Personal event history
- Attendance records
- Feedback given
- Participation trends

### Advanced Reports
- Event popularity analysis
- Student engagement metrics
- Attendance patterns
- Feedback sentiment analysis

## 🔒 Security Considerations

### Current Implementation
- CORS enabled for development
- Input validation on API endpoints
- SQL injection protection
- Error handling and logging

### Production Recommendations
- Implement authentication/authorization
- Add rate limiting
- Use HTTPS in production
- Regular security audits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
- **Port conflicts**: Ensure ports 3000, 3001, and 5001 are available
- **Database errors**: Check database configuration in `config.py`
- **CORS issues**: Verify Flask-CORS is properly configured
- **Mobile app issues**: Check Capacitor configuration

### Getting Help
- Check the API documentation
- Review the database schema
- Test individual endpoints
- Check browser console for errors

## 🎯 Future Enhancements

### Planned Features
- [ ] User authentication system
- [ ] Email notifications
- [ ] Event calendar integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Real-time updates
- [ ] Mobile push notifications
- [ ] Event photo galleries
- [ ] QR code attendance
- [ ] Integration with learning management systems

### Technical Improvements
- [ ] API rate limiting
- [ ] Caching implementation
- [ ] Database optimization
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Microservices architecture

## 📞 Contact

For questions, suggestions, or support, please contact the development team.

---

**Built with ❤️ for educational institutions worldwide**