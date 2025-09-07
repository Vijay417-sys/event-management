# MySQL Database Configuration
# Update these values with your MySQL credentials

MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',  # Change this to your MySQL username
    'password': 'campus123',  # Change this to your MySQL password
    'database': 'campus_events',
    'charset': 'utf8mb4'
}

# If you don't have MySQL, the app will fallback to SQLite
USE_MYSQL = True  # Set to False to use SQLite instead
