# GPSTracker

[![Build Status](https://ci-cd.platypush.tech/api/badges/blacklight/gpstracker/status.svg)](https://ci-cd.platypush.tech/blacklight/gpstracker)

##### Track your GPS data, from any data source

GPSTracker is a simple Webapp that consists of:

- A backend that:
  - Can read GPS data from any compatible data source (supported: `postgres`, `mysql`, `mariadb`, `mongodb`, `sqlite`,
    `snowflake`), with arbitrary complex filtering, and expose them over a simple Web API.
  - [[*TODO*]] Can ingest GPS data points from HTTP, MQTT, Websocket or Kafka.
- A frontend to display GPS data points and provides advanced filtering.

## Building the application

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

## Configuration

See [`.env.example`](./.env.example) for a reference. Copy it to `.env` and modify it accordingly.

## Running the application

### Local installation

```sh
npm run start
```

### Docker

[[*TODO*]]

## Project Setup

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

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
