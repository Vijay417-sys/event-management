

import pymysql
import sqlite3
from flask import Flask, request, jsonify, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Try to import config, fallback to defaults
try:
    from config import MYSQL_CONFIG, USE_MYSQL
except ImportError:
    MYSQL_CONFIG = {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'campus_events',
        'charset': 'utf8mb4'
    }
    USE_MYSQL = False  # Default to SQLite if config not found

# Database type
DB_TYPE = 'mysql' if USE_MYSQL else 'sqlite'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        if USE_MYSQL:
            try:
                db = g._database = pymysql.connect(**MYSQL_CONFIG)
            except Exception as e:
                print(f"MySQL connection failed: {e}")
                print("Falling back to SQLite...")
                db = g._database = sqlite3.connect('events.db')
        else:
            db = g._database = sqlite3.connect('events.db')
    return db

def execute_query(query, params=None, fetch=False):
    """Execute a query and return results as dictionaries"""
    db = get_db()
    cursor = db.cursor()
    
    try:
        if params:
            # Convert MySQL placeholders to SQLite placeholders if using SQLite
            if not USE_MYSQL and '%s' in query:
                query = query.replace('%s', '?')
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch:
            # Get column names
            columns = [description[0] for description in cursor.description]
            # Fetch all rows and convert to dictionaries
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
        else:
            db.commit()
            return cursor.lastrowid
    except Exception as e:
        db.rollback()
        raise e
    finally:
        cursor.close()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        try:
            # Try MySQL first, fallback to SQLite
            db = None
            cursor = None
            current_db_tyask
            pe = 'sqlite'  # Default to SQLite
            
            if USE_MYSQL:
                try:
                    db = pymysql.connect(**MYSQL_CONFIG)
                    cursor = db.cursor()
                    cursor.execute("CREATE DATABASE IF NOT EXISTS campus_events")
                    cursor.execute("USE campus_events")
                    current_db_type = 'mysql'
                    print("Connected to MySQL successfully!")
                except Exception as e:
                    print(f"MySQL connection failed: {e}")
                    print("Falling back to SQLite...")
                    db = sqlite3.connect('events.db')
                    db.row_factory = sqlite3.Row
                    cursor = db.cursor()
                    current_db_type = 'sqlite'
            
            # Create tables based on database type
            if current_db_type == 'mysql':
                # MySQL table creation
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Events (
                        event_id INT AUTO_INCREMENT PRIMARY KEY,
                        college_id VARCHAR(100) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        type VARCHAR(100) NOT NULL,
                        date DATE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Students (
                        student_id INT AUTO_INCREMENT PRIMARY KEY,
                        college_id VARCHAR(100) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Registrations (
                        reg_id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        event_id INT NOT NULL,
                        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(student_id, event_id),
                        FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
                        FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Attendance (
                        att_id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        event_id INT NOT NULL,
                        status ENUM('present', 'absent') NOT NULL,
                        attendance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(student_id, event_id),
                        FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
                        FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Feedback (
                        feedback_id INT AUTO_INCREMENT PRIMARY KEY,
                        student_id INT NOT NULL,
                        event_id INT NOT NULL,
                        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                        feedback_text TEXT,
                        feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(student_id, event_id),
                        FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
                        FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE
                    );
                """)
            else:
                # SQLite table creation
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Events (
                        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        college_id TEXT NOT NULL,
                        name TEXT NOT NULL,
                        type TEXT NOT NULL,
                        date TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Students (
                        student_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        college_id TEXT NOT NULL,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Registrations (
                        reg_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        event_id INTEGER NOT NULL,
                        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(student_id, event_id),
                        FOREIGN KEY (student_id) REFERENCES Students(student_id),
                        FOREIGN KEY (event_id) REFERENCES Events(event_id)
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Attendance (
                        att_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        event_id INTEGER NOT NULL,
                        status TEXT NOT NULL,
                        attendance_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(student_id, event_id),
                        FOREIGN KEY (student_id) REFERENCES Students(student_id),
                        FOREIGN KEY (event_id) REFERENCES Events(event_id)
                    );
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS Feedback (
                        feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        event_id INTEGER NOT NULL,
                        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                        feedback_text TEXT,
                        feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(student_id, event_id),
                        FOREIGN KEY (student_id) REFERENCES Students(student_id),
                        FOREIGN KEY (event_id) REFERENCES Events(event_id)
                    );
                """)
            
            db.commit()
            print(f"Database initialized successfully using {current_db_type.upper()}!")
            
        except Exception as e:
            print(f"Database initialization error: {e}")
            print("Please check your database configuration.")

# Initialize the database when the app starts
with app.app_context():
    init_db()

# API Endpoints

# Get All Events
@app.route('/events', methods=['GET'])
def get_events():
    try:
        events = execute_query("SELECT * FROM Events ORDER BY date", fetch=True)
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create Event
@app.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    college_id = data.get('college_id')
    name = data.get('name')
    event_type = data.get('type')
    date = data.get('date')

    if not all([college_id, name, event_type, date]):
        return jsonify({'error': 'Missing data'}), 400

    try:
        event_id = execute_query(
            "INSERT INTO Events (college_id, name, type, date) VALUES (?, ?, ?, ?)",
            (college_id, name, event_type, date)
        )
        return jsonify({'message': 'Event created successfully', 'event_id': event_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create Student
@app.route('/students', methods=['POST'])
def create_student():
    data = request.get_json()
    college_id = data.get('college_id')
    name = data.get('name')
    email = data.get('email')

    if not all([college_id, name, email]):
        return jsonify({'error': 'Missing data'}), 400

    try:
        student_id = execute_query(
            "INSERT INTO Students (college_id, name, email) VALUES (?, ?, ?)",
            (college_id, name, email)
        )
        return jsonify({'message': 'Student created successfully', 'student_id': student_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Register Student to an Event
@app.route('/register', methods=['POST'])
def register_student():
    data = request.get_json()
    student_id = data.get('student_id')
    event_id = data.get('event_id')

    if not all([student_id, event_id]):
        return jsonify({'error': 'Missing data'}), 400

    try:
        if USE_MYSQL:
            execute_query(
                "INSERT INTO Registrations (student_id, event_id) VALUES (%s, %s)",
                (student_id, event_id)
            )
        else:
            execute_query(
                "INSERT INTO Registrations (student_id, event_id) VALUES (?, ?)",
                (student_id, event_id)
            )
        return jsonify({'message': 'Student registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Mark Attendance (Student endpoint)
@app.route('/attendance', methods=['POST'])
def mark_attendance_student():
    data = request.get_json()
    student_id = data.get('student_id')
    event_id = data.get('event_id')
    status = data.get('status') # 'present' or 'absent'

    if not all([student_id, event_id, status]):
        return jsonify({'error': 'Missing data'}), 400

    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO Attendance (student_id, event_id, status) VALUES (?, ?, ?)",
            (student_id, event_id, status)
        )
        db.commit()
        return jsonify({'message': 'Attendance marked successfully'}), 201
    except sqlite3.IntegrityError as e:
        return jsonify({'error': 'Attendance already marked for this student and event'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Collect Feedback
@app.route('/feedback', methods=['POST'])
def collect_feedback():
    data = request.get_json()
    student_id = data.get('student_id')
    event_id = data.get('event_id')
    rating = data.get('rating')
    feedback_text = data.get('feedback_text', None)

    if not all([student_id, event_id, rating]):
        return jsonify({'error': 'Missing data'}), 400
    if not (1 <= rating <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO Feedback (student_id, event_id, rating, feedback_text) VALUES (?, ?, ?, ?)",
            (student_id, event_id, rating, feedback_text)
        )
        db.commit()
        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except sqlite3.IntegrityError as e:
        return jsonify({'error': 'Feedback already submitted for this student and event'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Report Endpoints

# Total registrations per event
@app.route('/reports/registrations', methods=['GET'])
def get_registrations_report():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT
            E.name AS event_name,
            COUNT(R.reg_id) AS total_registrations
        FROM
            Events E
        LEFT JOIN
            Registrations R ON E.event_id = R.event_id
        GROUP BY
            E.event_id, E.name
        ORDER BY
            total_registrations DESC;
    """)
    report = cursor.fetchall()
    return jsonify([dict(row) for row in report])

# Attendance percentage per event
@app.route('/reports/attendance', methods=['GET'])
def get_attendance_report():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT
            E.name AS event_name,
            COUNT(DISTINCT R.student_id) AS total_registered,
            SUM(CASE WHEN A.status = 'present' THEN 1 ELSE 0 END) AS total_present,
            CAST(SUM(CASE WHEN A.status = 'present' THEN 1 ELSE 0 END) * 100.0 AS REAL) / COUNT(DISTINCT R.student_id) AS attendance_percentage
        FROM
            Events E
        LEFT JOIN
            Registrations R ON E.event_id = R.event_id
        LEFT JOIN
            Attendance A ON R.student_id = A.student_id AND R.event_id = A.event_id
        GROUP BY
            E.event_id, E.name
        ORDER BY
            attendance_percentage DESC;
    """)
    report = cursor.fetchall()
    return jsonify([dict(row) for row in report])

# Average feedback score per event
@app.route('/reports/feedback', methods=['GET'])
def get_feedback_report():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT
            E.name AS event_name,
            AVG(F.rating) AS average_feedback_score
        FROM
            Events E
        LEFT JOIN
            Feedback F ON E.event_id = F.event_id
        GROUP BY
            E.event_id, E.name
        ORDER BY
            average_feedback_score DESC;
    """)
    report = cursor.fetchall()
    return jsonify([dict(row) for row in report])

# Student Participation Report
@app.route('/reports/student_participation/<int:student_id>', methods=['GET'])
def get_student_participation_report(student_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT
            S.name AS student_name,
            S.email,
            GROUP_CONCAT(E.name) AS events_attended
        FROM
            Students S
        JOIN
            Attendance A ON S.student_id = A.student_id
        JOIN
            Events E ON A.event_id = E.event_id
        WHERE
            A.status = 'present' AND S.student_id = ?
        GROUP BY
            S.student_id, S.name, S.email
        ORDER BY
            S.name;
    """, (student_id,))
    report = cursor.fetchone()
    if report:
        return jsonify(dict(report))
    return jsonify({'message': 'No participation found for this student'}), 404

# Top 3 most active students
@app.route('/reports/top_students', methods=['GET'])
def get_top_students_report():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT
            S.name AS student_name,
            S.email,
            COUNT(A.att_id) AS events_attended_count
        FROM
            Students S
        JOIN
            Attendance A ON S.student_id = A.student_id
        WHERE
            A.status = 'present'
        GROUP BY
            S.student_id, S.name, S.email
        ORDER BY
            events_attended_count DESC
        LIMIT 3;
    """)
    report = cursor.fetchall()
    return jsonify([dict(row) for row in report])

# Filter events by type
@app.route('/reports/events_by_type/<string:event_type>', methods=['GET'])
def get_events_by_type_report(event_type):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT
            E.name AS event_name,
            E.type,
            E.date
        FROM
            Events E
        WHERE
            E.type = ?
        ORDER BY
            E.date;
    """, (event_type,))
    report = cursor.fetchall()
    return jsonify([dict(row) for row in report])

# Staff Endpoints

# Get all registrations for an event
@app.route('/staff/registrations/<int:event_id>', methods=['GET'])
def get_event_registrations(event_id):
    try:
        db = get_db()
        cursor = db.cursor(pymysql.cursors.DictCursor)
        cursor.execute("""
            SELECT r.reg_id, s.student_id, s.name, s.email, s.college_id, r.registration_date
            FROM Registrations r
            JOIN Students s ON r.student_id = s.student_id
            WHERE r.event_id = %s
            ORDER BY r.registration_date
        """, (event_id,))
        registrations = cursor.fetchall()
        return jsonify(registrations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get all events with registration counts
@app.route('/staff/events', methods=['GET'])
def get_events_with_registrations():
    try:
        db = get_db()
        cursor = db.cursor(pymysql.cursors.DictCursor)
        cursor.execute("""
            SELECT e.*, COUNT(r.reg_id) as registration_count
            FROM Events e
            LEFT JOIN Registrations r ON e.event_id = r.event_id
            GROUP BY e.event_id
            ORDER BY e.date
        """)
        events = cursor.fetchall()
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Mark attendance for a student (Staff endpoint)
@app.route('/staff/attendance', methods=['POST'])
def mark_attendance_staff():
    data = request.get_json()
    student_id = data.get('student_id')
    event_id = data.get('event_id')
    status = data.get('status')  # 'present' or 'absent'

    if not all([student_id, event_id, status]):
        return jsonify({'error': 'Missing data'}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO Attendance (student_id, event_id, status) 
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE status = VALUES(status)
        """, (student_id, event_id, status))
        db.commit()
        return jsonify({'message': 'Attendance marked successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get attendance for an event
@app.route('/staff/attendance/<int:event_id>', methods=['GET'])
def get_event_attendance(event_id):
    try:
        db = get_db()
        cursor = db.cursor(pymysql.cursors.DictCursor)
        cursor.execute("""
            SELECT a.*, s.name, s.email, s.college_id
            FROM Attendance a
            JOIN Students s ON a.student_id = s.student_id
            WHERE a.event_id = %s
            ORDER BY a.attendance_date
        """, (event_id,))
        attendance = cursor.fetchall()
        return jsonify(attendance)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
