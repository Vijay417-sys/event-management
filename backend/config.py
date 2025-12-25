# config.py
import os

# Enable MySQL in production by setting USE_MYSQL=true on Railway
USE_MYSQL = os.getenv("USE_MYSQL", "true").lower() in ("1","true","yes")

MYSQLHOST = os.getenv("MYSQLHOST") or os.getenv("MYSQL_HOST") or os.getenv("MYSQLHOST")
MYSQLUSER = os.getenv("MYSQLUSER") or os.getenv("MYSQL_USER") or "root"
MYSQLPASSWORD = os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD") or ""
MYSQLDATABASE = os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE") or "campus_events"
MYSQLPORT = int(os.getenv("MYSQLPORT") or os.getenv("MYSQL_PORT") or 3306)

# Provide both keys 'db' and 'database' so older code works
MYSQL_CONFIG = {
    "host": MYSQLHOST or "localhost",
    "user": MYSQLUSER,
    "password": MYSQLPASSWORD,
    "db": MYSQLDATABASE,
    "database": MYSQLDATABASE,
    "port": MYSQLPORT,
    "charset": "utf8mb4"
}
