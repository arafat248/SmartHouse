# SmartHouse - Household Meal & Expense Management Platform

## Architecture
- Backend: Django, Django REST Framework, PostgreSQL
- Frontend: React, TypeScript, Vite, Tailwind CSS

## Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL

## Backend Setup (Local Development)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements/local.txt
   ```
4. Create a `.env` file in `backend/` and configure your database and secret key.
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

## Frontend Setup (Local Development)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
