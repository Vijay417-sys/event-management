
import os
import pymysql
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Read DB config from config.py (env variables will be used in Railway)
try:
    from config import MYSQL_CONFIG, USE_MYSQL
except Exception:
    # Fallback: simple defaults (only used if config.py missing)
    import os
    USE_MYSQL = False
    MYSQL_CONFIG = {
        "host": os.getenv("MYSQLHOST", "localhost"),
        "user": os.getenv("MYSQLUSER", "root"),
        "password": os.getenv("MYSQLPASSWORD", ""),
        "db": os.getenv("MYSQLDATABASE", "campus_events"),
        "database": os.getenv("MYSQLDATABASE", "campus_events"),
        "port": int(os.getenv("MYSQLPORT", 3306)),
        "charset": "utf8mb4"
    }

# Database type string used by health endpoint / logs
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
        print(f"Query error: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        raise e
    finally:
        cursor.close()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """
    Initialize DB connection and create tables.
    Tries MySQL first (using MYSQL_CONFIG + env vars). If MySQL fails,
    falls back to SQLite and continues. This function will NOT raise.
    """
    try:
        current_db_type = 'sqlite'
        db = None
        cursor = None

        if USE_MYSQL:
            try:
                # build params: accept either 'db' or 'database' key
                mysql_db = MYSQL_CONFIG.get("db") or MYSQL_CONFIG.get("database")
                conn_params = {
                    "host": MYSQL_CONFIG.get("host"),
                    "user": MYSQL_CONFIG.get("user"),
                    "password": MYSQL_CONFIG.get("password", ""),
                    "database": mysql_db,
                    "port": int(MYSQL_CONFIG.get("port", 3306)),
                    "charset": MYSQL_CONFIG.get("charset", "utf8mb4"),
                }
                # Import locally to avoid module-level import issues
                import pymysql
                conn_params_for_connect = {k: v for k, v in conn_params.items() if v is not None}
                db = pymysql.connect(**conn_params_for_connect, connect_timeout=5)
                cursor = db.cursor()
                # Ensure database exists (if permitted)
                try:
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{mysql_db}`")
                    cursor.execute(f"USE `{mysql_db}`")
                except Exception:
                    # Some managed DBs may not allow CREATE DATABASE — ignore
                    pass
                current_db_type = 'mysql'
                print("✅ Connected to MySQL (init_db)")
            except Exception as e:
                print("❌ MySQL connection failed in init_db():", e)
                print("ℹ️ Falling back to SQLite...")

        if current_db_type == 'sqlite' or db is None:
            import sqlite3
            db = sqlite3.connect('events.db', check_same_thread=False)
            # Use row factory so fetch results can be dict-like in some places
            try:
                db.row_factory = sqlite3.Row
            except Exception:
                pass
            cursor = db.cursor()
            current_db_type = 'sqlite'
            print("✅ Using SQLite fallback (events.db)")

        # CREATE TABLES (works for both MySQL and SQLite — uses compatible SQL)
        # Events
        try:
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
        except Exception:
            # Try MySQL-style schema (explicit INT AUTO_INCREMENT if needed)
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

        # Students
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Students (
                    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    college_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """)
        except Exception:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Students (
                    student_id INT AUTO_INCREMENT PRIMARY KEY,
                    college_id VARCHAR(100) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

        # Registrations
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Registrations (
                    reg_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    event_id INTEGER NOT NULL,
                    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, event_id)
                );
            """)
        except Exception:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Registrations (
                    reg_id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    event_id INT NOT NULL,
                    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, event_id)
                );
            """)

        # Attendance
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Attendance (
                    att_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    event_id INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    attendance_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, event_id)
                );
            """)
        except Exception:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Attendance (
                    att_id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    event_id INT NOT NULL,
                    status ENUM('present','absent') NOT NULL,
                    attendance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, event_id)
                );
            """)

        # Feedback
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Feedback (
                    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    event_id INTEGER NOT NULL,
                    rating INTEGER NOT NULL,
                    feedback_text TEXT,
                    feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, event_id)
                );
            """)
        except Exception:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Feedback (
                    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    event_id INT NOT NULL,
                    rating INT NOT NULL,
                    feedback_text TEXT,
                    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, event_id)
                );
            """)

        # commit if DB supports commit()
        try:
            db.commit()
        except Exception:
            pass

        print(f"Database initialized successfully using {current_db_type.upper()}!")

    except Exception as e:
        print("Database initialization error (unexpected):", e)
        print("Please check your database configuration.")


# Initialize the database when the app starts
with app.app_context():
    init_db()

# API Endpoints

# Health Check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': DB_TYPE,
        'timestamp': str(datetime.now())
    })

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
        if USE_MYSQL:
            event_id = execute_query(
                "INSERT INTO Events (college_id, name, type, date) VALUES (%s, %s, %s, %s)",
                (college_id, name, event_type, date)
            )
        else:
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
        if USE_MYSQL:
            student_id = execute_query(
                "INSERT INTO Students (college_id, name, email) VALUES (%s, %s, %s)",
                (college_id, name, email)
            )
        else:
            student_id = execute_query(
                "INSERT INTO Students (college_id, name, email) VALUES (?, ?, ?)",
                (college_id, name, email)
            )
        return jsonify({'message': 'Student created successfully', 'student_id': student_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Find or Create Student
@app.route('/students/find-or-create', methods=['POST'])
def find_or_create_student():
    data = request.get_json()
    college_id = data.get('college_id')
    name = data.get('name')
    email = data.get('email')

    if not all([college_id, name, email]):
        return jsonify({'error': 'Missing data'}), 400

    try:
        # First, try to find existing student by email
        if USE_MYSQL:
            existing_students = execute_query(
                "SELECT student_id, name, email FROM Students WHERE email = %s",
                (email,),
                fetch=True
            )
        else:
            existing_students = execute_query(
                "SELECT student_id, name, email FROM Students WHERE email = ?",
                (email,),
                fetch=True
            )
        
        if existing_students:
            # Student exists, return their info
            student = existing_students[0]
            return jsonify({
                'message': 'Student found',
                'student_id': student['student_id'],
                'name': student['name'],
                'email': student['email'],
                'is_new': False
            }), 200
        
        # Student doesn't exist, create new one
        if USE_MYSQL:
            student_id = execute_query(
                "INSERT INTO Students (college_id, name, email) VALUES (%s, %s, %s)",
                (college_id, name, email)
            )
        else:
            student_id = execute_query(
                "INSERT INTO Students (college_id, name, email) VALUES (?, ?, ?)",
                (college_id, name, email)
            )
        return jsonify({
            'message': 'Student created successfully',
            'student_id': student_id,
            'name': name,
            'email': email,
            'is_new': True
        }), 201
        
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
        # Check if student is already registered for this event
        if USE_MYSQL:
            existing_registrations = execute_query(
                "SELECT registration_id FROM Registrations WHERE student_id = %s AND event_id = %s",
                (student_id, event_id),
                fetch=True
            )
        else:
            existing_registrations = execute_query(
                "SELECT registration_id FROM Registrations WHERE student_id = ? AND event_id = ?",
                (student_id, event_id),
                fetch=True
            )
        
        if existing_registrations:
            return jsonify({'error': 'Student is already registered for this event'}), 400
        
        # Register the student
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

    try:
        if USE_MYSQL:
            execute_query(
                "INSERT INTO Feedback (student_id, event_id, rating, feedback_text) VALUES (%s, %s, %s, %s)",
                (student_id, event_id, rating, feedback_text)
            )
        else:
            execute_query(
                "INSERT INTO Feedback (student_id, event_id, rating, feedback_text) VALUES (?, ?, ?, ?)",
                (student_id, event_id, rating, feedback_text)
            )
        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except Exception as e:
        if 'UNIQUE constraint failed' in str(e) or 'Duplicate entry' in str(e):
            return jsonify({'error': 'Feedback already submitted for this student and event'}), 400
        return jsonify({'error': str(e)}), 500

# Report Endpoints

# Total registrations per event
@app.route('/reports/registrations', methods=['GET'])
def get_registrations_report():
    try:
        report = execute_query("""
            SELECT
                E.name AS event_name,
                COUNT(R.registration_id) AS total_registrations
            FROM
                Events E
            LEFT JOIN
                Registrations R ON E.event_id = R.event_id
            GROUP BY
                E.event_id, E.name
            ORDER BY
                total_registrations DESC;
        """, fetch=True)
        return jsonify(report)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

# Comprehensive event analysis report
@app.route('/reports/event_analysis', methods=['GET'])
def get_event_analysis_report():
    try:
        report = execute_query("""
            SELECT
                E.event_id,
                E.name AS event_name,
                E.type AS event_type,
                E.date AS event_date,
                COUNT(DISTINCT R.student_id) AS total_registered,
                SUM(CASE WHEN A.status = 'present' THEN 1 ELSE 0 END) AS total_present,
                SUM(CASE WHEN A.status = 'absent' THEN 1 ELSE 0 END) AS total_absent,
                CASE 
                    WHEN COUNT(DISTINCT R.student_id) > 0 
                    THEN CAST(SUM(CASE WHEN A.status = 'present' THEN 1 ELSE 0 END) * 100.0 AS REAL) / COUNT(DISTINCT R.student_id)
                    ELSE 0 
                END AS attendance_percentage,
                COUNT(DISTINCT F.feedback_id) AS total_feedback_count,
                AVG(F.rating) AS average_rating,
                MIN(F.rating) AS min_rating,
                MAX(F.rating) AS max_rating
            FROM
                Events E
            LEFT JOIN
                Registrations R ON E.event_id = R.event_id
            LEFT JOIN
                Attendance A ON R.student_id = A.student_id AND R.event_id = A.event_id
            LEFT JOIN
                Feedback F ON E.event_id = F.event_id
            GROUP BY
                E.event_id, E.name, E.type, E.date
            ORDER BY
                E.date DESC;
        """, fetch=True)
        return jsonify(report)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Detailed student attendance and feedback report
@app.route('/reports/student_analysis/<int:student_id>', methods=['GET'])
def get_student_analysis_report(student_id):
    try:
        # Get student info
        student_info = execute_query("""
            SELECT student_id, name, email, college_id
            FROM Students 
            WHERE student_id = %s
        """, (student_id,), fetch=True)
        
        if not student_info:
            return jsonify({'error': 'Student not found'}), 404
        
        # Get attendance summary
        attendance_summary = execute_query("""
            SELECT
                COUNT(*) AS total_events_registered,
                SUM(CASE WHEN A.status = 'present' THEN 1 ELSE 0 END) AS events_attended,
                SUM(CASE WHEN A.status = 'absent' THEN 1 ELSE 0 END) AS events_absent,
                CASE 
                    WHEN COUNT(*) > 0 
                    THEN CAST(SUM(CASE WHEN A.status = 'present' THEN 1 ELSE 0 END) * 100.0 AS REAL) / COUNT(*)
                    ELSE 0 
                END AS attendance_percentage
            FROM
                Registrations R
            LEFT JOIN
                Attendance A ON R.student_id = A.student_id AND R.event_id = A.event_id
            WHERE
                R.student_id = %s
        """, (student_id,), fetch=True)
        
        # Get feedback summary
        feedback_summary = execute_query("""
            SELECT
                COUNT(*) AS total_feedback_given,
                AVG(rating) AS average_rating,
                MIN(rating) AS min_rating,
                MAX(rating) AS max_rating
            FROM
                Feedback
            WHERE
                student_id = %s
        """, (student_id,), fetch=True)
        
        # Get detailed event participation
        event_details = execute_query("""
            SELECT
                E.name AS event_name,
                E.type AS event_type,
                E.date AS event_date,
                R.registration_date,
                A.status AS attendance_status,
                F.rating AS feedback_rating,
                F.feedback_text,
                F.feedback_date
            FROM
                Registrations R
            JOIN
                Events E ON R.event_id = E.event_id
            LEFT JOIN
                Attendance A ON R.student_id = A.student_id AND R.event_id = A.event_id
            LEFT JOIN
                Feedback F ON R.student_id = F.student_id AND R.event_id = F.event_id
            WHERE
                R.student_id = %s
            ORDER BY
                E.date DESC
        """, (student_id,), fetch=True)
        
        return jsonify({
            'student_info': student_info[0] if student_info else None,
            'attendance_summary': attendance_summary[0] if attendance_summary else None,
            'feedback_summary': feedback_summary[0] if feedback_summary else None,
            'event_details': event_details
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
            COUNT(A.attendance_id) AS events_attended_count
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
    # Convert tuples to dictionaries with proper column names
    columns = [desc[0] for desc in cursor.description]
    result = [dict(zip(columns, row)) for row in report]
    return jsonify(result)

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
        if USE_MYSQL:
            registrations = execute_query("""
                SELECT r.registration_id, s.student_id, s.name, s.email, s.college_id, r.registration_date
                FROM Registrations r
                JOIN Students s ON r.student_id = s.student_id
                WHERE r.event_id = %s
                ORDER BY r.registration_date
            """, (event_id,), fetch=True)
        else:
            registrations = execute_query("""
                SELECT r.registration_id, s.student_id, s.name, s.email, s.college_id, r.registration_date
                FROM Registrations r
                JOIN Students s ON r.student_id = s.student_id
                WHERE r.event_id = ?
                ORDER BY r.registration_date
            """, (event_id,), fetch=True)
        return jsonify(registrations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get all events with registration counts
@app.route('/staff/events', methods=['GET'])
def get_events_with_registrations():
    try:
        if USE_MYSQL:
            events = execute_query("""
                SELECT e.*, COUNT(r.registration_id) as registration_count
                FROM Events e
                LEFT JOIN Registrations r ON e.event_id = r.event_id
                GROUP BY e.event_id
                ORDER BY e.date
            """, fetch=True)
        else:
            events = execute_query("""
                SELECT e.*, COUNT(r.registration_id) as registration_count
                FROM Events e
                LEFT JOIN Registrations r ON e.event_id = r.event_id
                GROUP BY e.event_id
                ORDER BY e.date
            """, fetch=True)
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get attendance records for a student (Student endpoint)
@app.route('/attendance', methods=['GET'])
def get_student_attendance():
    try:
        # Get all attendance records with event details
        attendance_records = execute_query("""
            SELECT a.*, e.name as event_name, e.type as event_type, e.date as event_date
            FROM Attendance a
            JOIN Events e ON a.event_id = e.event_id
            ORDER BY a.attendance_date DESC
        """, fetch=True)
        return jsonify(attendance_records)
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
        # Check if attendance record already exists
        if USE_MYSQL:
            existing_attendance = execute_query(
                "SELECT attendance_id FROM Attendance WHERE student_id = %s AND event_id = %s",
                (student_id, event_id),
                fetch=True
            )
            
            if existing_attendance:
                # Update existing record
                execute_query(
                    "UPDATE Attendance SET status = %s WHERE student_id = %s AND event_id = %s",
                    (status, student_id, event_id)
                )
            else:
                # Insert new record
                execute_query(
                    "INSERT INTO Attendance (student_id, event_id, status) VALUES (%s, %s, %s)",
                    (student_id, event_id, status)
                )
        else:
            existing_attendance = execute_query(
                "SELECT attendance_id FROM Attendance WHERE student_id = ? AND event_id = ?",
                (student_id, event_id),
                fetch=True
            )
            
            if existing_attendance:
                # Update existing record
                execute_query(
                    "UPDATE Attendance SET status = ? WHERE student_id = ? AND event_id = ?",
                    (status, student_id, event_id)
                )
            else:
                # Insert new record
                execute_query(
                    "INSERT INTO Attendance (student_id, event_id, status) VALUES (?, ?, ?)",
                    (student_id, event_id, status)
                )
        return jsonify({'message': 'Attendance marked successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get attendance for an event
@app.route('/staff/attendance/<int:event_id>', methods=['GET'])
def get_event_attendance(event_id):
    try:
        db = get_db()
        if USE_MYSQL:
            attendance = execute_query("""
                SELECT a.*, s.name, s.email, s.college_id
                FROM Attendance a
                JOIN Students s ON a.student_id = s.student_id
                WHERE a.event_id = %s
                ORDER BY a.attendance_date
            """, (event_id,), fetch=True)
        else:
            attendance = execute_query("""
                SELECT a.*, s.name, s.email, s.college_id
                FROM Attendance a
                JOIN Students s ON a.student_id = s.student_id
                WHERE a.event_id = ?
                ORDER BY a.attendance_date
            """, (event_id,), fetch=True)
        return jsonify(attendance)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete Event
@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        # Check if event exists
        if USE_MYSQL:
            events = execute_query("SELECT * FROM Events WHERE event_id = %s", (event_id,), fetch=True)
        else:
            events = execute_query("SELECT * FROM Events WHERE event_id = ?", (event_id,), fetch=True)
        
        if not events:
            return jsonify({'error': 'Event not found'}), 404
        
        # Delete the event (cascade will handle related records)
        if USE_MYSQL:
            execute_query("DELETE FROM Events WHERE event_id = %s", (event_id,))
        else:
            execute_query("DELETE FROM Events WHERE event_id = ?", (event_id,))
        return jsonify({'message': 'Event deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Student endpoints
@app.route('/registrations', methods=['GET'])
def get_registrations():
    try:
        registrations = execute_query("""
            SELECT r.*, e.name, e.type, e.date, e.college_id, s.name as student_name, s.email
            FROM Registrations r
            JOIN Events e ON r.event_id = e.event_id
            JOIN Students s ON r.student_id = s.student_id
            ORDER BY r.registration_date DESC
        """, fetch=True)
        return jsonify(registrations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/student/participation', methods=['GET'])
def get_student_participation():
    try:
        event_id = request.args.get('event_id')
        if event_id:
            query = """
                SELECT r.event_id, e.name as event_name, e.date as event_date, 
                       r.registration_date, a.status as attendance_status,
                       CASE WHEN f.feedback_id IS NOT NULL THEN 1 ELSE 0 END as feedback_given
                FROM Registrations r
                JOIN Events e ON r.event_id = e.event_id
                LEFT JOIN Attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
                LEFT JOIN Feedback f ON r.student_id = f.student_id AND r.event_id = f.event_id
                WHERE r.event_id = ? AND r.student_id = 1
            """
            params = (event_id,)
        else:
            query = """
                SELECT r.event_id, e.name as event_name, e.date as event_date, 
                       r.registration_date, a.status as attendance_status,
                       CASE WHEN f.feedback_id IS NOT NULL THEN 1 ELSE 0 END as feedback_given
                FROM Registrations r
                JOIN Events e ON r.event_id = e.event_id
                LEFT JOIN Attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
                LEFT JOIN Feedback f ON r.student_id = f.student_id AND r.event_id = f.event_id
                WHERE r.student_id = 1
                ORDER BY r.registration_date DESC
            """
            params = None
        
        participation = execute_query(query, params, fetch=True)
        return jsonify(participation)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/student/feedback', methods=['GET'])
def get_student_feedback():
    try:
        feedback = execute_query("""
            SELECT f.*, e.name as event_name
            FROM Feedback f
            JOIN Events e ON f.event_id = e.event_id
            WHERE f.student_id = 1
            ORDER BY f.feedback_date DESC
        """, fetch=True)
        return jsonify(feedback)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get all feedback for staff portal
@app.route('/staff/feedback', methods=['GET'])
def get_staff_feedback():
    try:
        feedback = execute_query("""
            SELECT f.*, e.name as event_name, e.type as event_type, e.date as event_date,
                   s.name as student_name, s.email as student_email
            FROM Feedback f
            JOIN Events e ON f.event_id = e.event_id
            JOIN Students s ON f.student_id = s.student_id
            ORDER BY f.feedback_date DESC
        """, fetch=True)
        return jsonify(feedback)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

