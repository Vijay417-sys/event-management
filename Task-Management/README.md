# Campus Event Reporting System

This project implements a basic Campus Event Reporting System with an Admin Portal (web) for creating events and viewing reports, and a conceptual Student App (mobile) for browsing, registering, and giving feedback on events. The backend is built using Flask with SQLite as the database.

## Features

### Admin Portal (Backend APIs & Reports)

*   **Event Management:** Create new events with details like name, type, date, and college ID.
*   **Student Management:** Create new student records with college ID, name, and email.
*   **Reports:**
    *   Total registrations per event.
    *   Attendance percentage per event.
    *   Average feedback score per event.
    *   Student participation report (events attended by a specific student).
    *   Top 3 most active students (by events attended).
    *   Filter events by type.

### Student App (Backend APIs)

*   **Event Registration:** Register students for events.
*   **Attendance Tracking:** Mark student attendance for events.
*   **Feedback Collection:** Collect ratings (1-5) and optional text feedback for events.

## Technologies Used

*   **Backend:** Python 3, Flask, SQLite3
*   **Frontend (Conceptual):** Not implemented in this prototype, but described in design documentation.

## Setup and Running the Project

Follow these steps to set up and run the Flask backend:

1.  **Navigate to the project directory:**
    ```bash
    cd /home/vijay-hosapeti/Desktop/eveny/Task-Management
    ```

2.  **Create a Python virtual environment (recommended):
    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On Linux/macOS:
        ```bash
        source venv/bin/activate
        ```
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```

4.  **Install the required Python packages:**
    ```bash
    pip install Flask
    ```

5.  **Run the Flask application:**
    ```bash
    python app.py
    ```

    The application will start, and the API will be accessible at `lehttp://127.0.0.1:5000/`. The SQLite database file `events.db` will be created in the same directory if it doesn't exist.

## API Endpoints and Example Usage

(See `app.py` for full implementation details)

### Admin Endpoints

*   **Create Event:** `POST /events`
    ```json
    {
        "college_id": "C001",
        "name": "Hackathon 2024",
        "type": "Hackathon",
        "date": "2024-10-26"
    }
    ```

*   **Create Student:** `POST /students`
    ```json
    {
        "college_id": "C001",
        "name": "Alice Smith",
        "email": "alice.smith@example.com"
    }
    ```

### Student-Facing Endpoints

*   **Register Student to an Event:** `POST /register`
    ```json
    {
        "student_id": 1,
        "event_id": 1
    }
    ```

*   **Mark Attendance:** `POST /attendance`
    ```json
    {
        "student_id": 1,
        "event_id": 1,
        "status": "present" 
    }
    ```

*   **Collect Feedback:** `POST /feedback`
    ```json
    {
        "student_id": 1,
        "event_id": 1,
        "rating": 5,
        "feedback_text": "Great event!"
    }
    ```

### Report Endpoints

*   **Total Registrations per Event:** `GET /reports/registrations`
*   **Attendance Percentage per Event:** `GET /reports/attendance`
*   **Average Feedback Score per Event:** `GET /reports/feedback`
*   **Student Participation Report:** `GET /reports/student_participation/<student_id>`
*   **Top 3 Most Active Students:** `GET /reports/top_students`
*   **Filter Events by Type:** `GET /reports/events_by_type/<event_type>`

## Design Decisions and Assumptions

*   **Database:** SQLite was chosen for its lightweight nature and ease of setup, suitable for a prototype.
*   **Framework:** Flask provides a minimalist approach, ideal for building a focused API quickly.
*   **No Authentication/Authorization:** For simplicity, security measures like user authentication and authorization have been omitted. These would be crucial for a production environment.
*   **Unique Constraints:** Implemented in the database schema to prevent duplicate registrations, attendance records, and feedback entries for the same student and event.
*   **Cancelled Events:** Not explicitly handled; assumed only active events are managed.
*   **Minimal Frontend:** A conceptual frontend mockup is described in the design documentation.

This prototype provides a solid foundation for the Campus Event Reporting System, demonstrating the core functionalities and reporting capabilities as requested.
