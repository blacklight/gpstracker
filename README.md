# GPSTracker

[![Build Status](https://ci-cd.platypush.tech/api/badges/blacklight/gpstracker/status.svg)](https://ci-cd.platypush.tech/blacklight/gpstracker)

##### Track your GPS data, from any data source

<!-- toc -->

- [Features](#features)
  * [History navigation](#history-navigation)
  * [Select location points by area](#select-location-points-by-area)
  * [Advanced statistics](#advanced-statistics)
- [Configuration](#configuration)
- [Docker installation](#docker-installation)
- [Local installation](#local-installation)
  * [Build](#build)
  * [Run](#run)
- [Usage](#usage)
  * [Initial setup](#initial-setup)
  * [Ingestion](#ingestion)
    + [Enriching location data](#enriching-location-data)
  * [External data sources](#external-data-sources)
- [Development](#development)
  * [Compile and Hot-Reload for Development](#compile-and-hot-reload-for-development)
    + [Backend](#backend)
    + [Frontend](#frontend)

<!-- tocstop -->

GPSTracker is a simple Webapp that consists of:

- A backend that:
  - Can manage GPS data stored on a local db or on any compatible data source
    (supported: `postgres`, `mysql`, `mariadb`, `mongodb`, `sqlite`,
    `snowflake`), with arbitrary complex filtering, and expose them over a
    simple Web API.
  - Can ingest GPS location updates from HTTP.
- A frontend to display GPS data points and provides advanced filtering.

It is meant as a self-hosted and privacy-aware alternative to services like Google Maps Timeline.

![Screenshot of GPSTracker](https://static.platypush.tech/screenshots/gpstracker_screenshot.jpg)

## Features

### History navigation

At its core GPSTracker allows you to easily navigate through your stored
location data, offering pagination, advanced filtering and sorting.

The timeline allows an easy time-based navigation, and it also reports
information such as the total distance traveled, the altitude, the speed and the
battery level at the time of the location point.

![GPSTracker history
navigation](https://static.platypush.tech/screenshots/gpstracker-history-navigation.gif)

![GPSTracker map
filter](https://static.platypush.tech/screenshots/gpstracker-map-filter.jpg)

### Select location points by area

You can select a specific area on the map and filter the location points by it,
providing easy answers to questions such as "where have I been in this specific
location in the last year?".

![GPSTracker history
navigation](https://static.platypush.tech/screenshots/gpstracker-select-location-by-area.gif)

### Advanced statistics

More advanced statistics are available in the _Stats_ page, which allows you to
aggregate your location data by any combinations of the available metrics and
explore specific location points in a certain group.

![GPSTracker stats
panel](https://static.platypush.tech/screenshots/gpstracker-stats.gif)

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

## Usage

### Initial setup

Once the application is running, you can access the frontend at
`http://localhost:3000` - or on whatever port you configured in the `.env`
file.

Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from the `.env` file to log
in.

You can then create a new device for your GPS data under the `Devices` menu, or
at `http://localhost:3000/devices`. Take note of the `deviceId`, you will need
it to ingest data.

Then create a new API token from the `API` menu, or at
`http://localhost:3000/api`.

### Ingestion

The application exposes a POST endpoint at `/gpsdata` that accepts a JSON
payload containing the GPS data to ingest. Example:

```bash
curl -XPOST \
  -H "Authorization: Bearer your-api-token" \
  -H "Content-Type: application/json"
  -d '[{
      "deviceId": "your-device-id",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "260 Broadway",
      "locality": "New York, NY",
      "country": "us",
      "postalCode": "10007",
      "description": "New York City Hall",
      "timestamp": "2021-01-01T00:00:00Z"
    }]' http://localhost:3000/api/v1/gpsdata
```

You can wrap this in a script to ingest data from a file, or from a GPS tracker.

You can also configure a mobile app like [GPSLogger](https://gpslogger.app/) to
periodically send data to the endpoint - select _Custom URL_ and use the
`/gpsdata` endpoint with the API token as the `Authorization` header under the
_HTTP Headers_ section.

Or, for more advanced use cases, you can use a general-purpose application like
[Tasker](https://tasker.joaoapps.com/) in combination with
[AutoLocation](https://play.google.com/store/apps/details?id=com.joaomgcd.autolocation)
to send data to the endpoint, or decouple the ingestion from the frontend by
using an intermediate MQTT or Kafka broker.

#### Enriching location data

If the ingested location data does not contain the `address`, `locality`,
`country` or `postalCode` fields, and you have set the `GEOCODE_PROVIDER`
environment variable, then the application will try to geocode the location
upon ingestion using the configured geocoding provider. Supported providers:

- [`nominatim`](https://nominatim.org/)
  - It uses OpenStreetMap data ([usage
    policy](https://operations.osmfoundation.org/policies/nominatim/)).
  - It doesn't require an API key, but it is rate-limited to 1 request per
    second (not advised if you are ingesting bulk data if you use the
    default `NOMINATIM_URL` instance).
  - It supports a custom `NOMINATIM_URL` environment variable to use a custom
    Nominatim instance.
- [`google`](https://developers.google.com/maps/documentation/geocoding/start)
  - It requires a Google Maps API key, set in the `GOOGLE_API_KEY` environment
    variable.
  - See [additional usage
    limits](https://developers.google.com/maps/documentation/geocoding/usage-and-billing)
    for details. You can set your own usage limits in the Google Cloud
    console, but keep in mind that above a certain threshold you will be
    charged.

If `GEOCODE_PROVIDER` is not set, the application will not attempt to geocode
the location data upon ingestion.

### External data sources

By default, the application will store the GPS data under the configured
`DB_URL` database.

If you have an existing database with GPS data, you can configure it in the
`.env` file through the `DB_LOCATION_URL` variable. The application will then
read the data from the external source and expose it through the API.

Consult the `.env.example` file if the column names in your database differ from
the default ones.

Note however that:

- The external data source must have a `deviceId` column (or whatever column
  name you configured in the `.env` file) that uniquely identifies the device
  that generated the data, and it must point to a valid device in the
  application database.

- Changes to the ownership of the devices or deletion of devices in the
  application database will not be reflected in the external data source.

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
