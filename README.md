# Colinq

A web-based creator collaboration platform that matches content creators for collaborations.

## Tech Stack

- **Frontend:** React.js (Vite)
- **Backend:** Node.js with Express
- **Database:** PostgreSQL

## Project Structure

```
/client          # React frontend
/server          # Node.js/Express backend
/database        # Database schema and migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both `/client` and `/server`
   - Fill in your configuration values

4. Set up the database:
   ```bash
   psql -U your_user -d your_database -f database/schema.sql
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:5000`.

