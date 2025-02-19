# GPS Tracker

A web interface to render GPS data points stored in a PostgreSQL database on a map.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gps-tracker.git
   cd gps-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/gpstracker
   PORT=3000
   ```

4. Create the `gps_data` table in your PostgreSQL database:
   ```sql
   CREATE TABLE gps_data (
     id SERIAL PRIMARY KEY,
     latitude FLOAT NOT NULL,
     longitude FLOAT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

Add your GPS data points to the PostgreSQL ▋
