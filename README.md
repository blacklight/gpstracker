# GPSTracker

[![Build Status](https://ci-cd.platypush.tech/api/badges/blacklight/gpstracker/status.svg)](https://ci-cd.platypush.tech/blacklight/gpstracker)

##### Track your GPS data, from any data source

GPSTracker is a simple Webapp that consists of:

- A backend that:
  - Can read GPS data from any compatible data source (supported: `postgres`, `mysql`, `mariadb`, `mongodb`, `sqlite`,
    `snowflake`), with arbitrary complex filtering, and expose them over a simple Web API.
  - [[*TODO*]] Can ingest GPS data points from HTTP, MQTT, Websocket or Kafka.
- A frontend to display GPS data points and provides advanced filtering.

![Screenshot of GPSTracker](https://static.platypush.tech/screenshots/gpstracker_screenshot.png)

## Configuration

```
cp .env.example .env
```

See [the provided `.env.example`](./.env.example) for a reference.

## Docker installation

```sh
docker compose up
```

## Local installation


### Build

Requirements:

- `node`
- `typescript`
- `make`

```sh
make
```

Or, if you want to build the backend and the frontend separately:

```sh
# Backend
make backend

# Frontend
make frontend
```

### Run

```sh
npm run start
```

## Development

### Compile and Hot-Reload for Development

#### Backend

```sh
npm run dev
```

#### Frontend

```sh
cd frontend
npm run dev
```
