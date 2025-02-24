<template>
  <main>
    <div class="loading" v-if="loading">Loading...</div>
    <div class="map-wrapper" v-else>
      <div id="map">
        <div class="time-range" v-if="gpsPoints?.length">
          <div class="row">
            <div class="key">From</div>
            <div class="value">
              <a href="#" @click.prevent.stop="onStartDateClick">
                {{ displayDate(oldestPoint?.timestamp) }}
              </a>
            </div>
          </div>
          <div class="row">
            <div class="key">To</div>
            <div class="value">
              <a href="#" @click.prevent.stop="onEndDateClick">
                {{ displayDate(newestPoint?.timestamp) }}
              </a>
            </div>
          </div>

          <div class="row">
            <div class="key">Total Distance</div>
            <div class="value">{{ displayDistance(getTotalDistance(gpsPoints)) }}</div>
          </div>
        </div>

        <PointInfo :point="selectedPoint"
                   ref="popup"
                   @close="selectedPoint = null" />

        <div class="controls">
          <div class="form-container" v-if="showControls">
            <FilterForm :value="locationQuery"
                        :disabled="loading"
                        :has-next-page="hasNextPage"
                        :has-prev-page="hasPrevPage"
                        @refresh="locationQuery = $event"
                        @reset-page="locationQuery.minId = locationQuery.maxId = undefined"
                        @next-page="fetchNextPage"
                        @prev-page="fetchPrevPage" />
          </div>
          <FilterButton @input="showControls = !showControls"
                        :value="showControls" />
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import PointInfo from './PointInfo.vue';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import { useGeographic } from 'ol/proj';

import type { Nullable } from '../models/Types';
import Api from '../mixins/Api.vue';
import Dates from '../mixins/Dates.vue';
import FilterButton from './filter/ToggleButton.vue';
import FilterForm from './filter/Form.vue';
import GPSPoint from '../models/GPSPoint';
import LocationQuery from '../models/LocationQuery';
import MapView from '../mixins/MapView.vue';
import Paginate from '../mixins/Paginate.vue';
import Points from '../mixins/Points.vue';
import Routes from '../mixins/Routes.vue';
import URLQueryHandler from '../mixins/URLQueryHandler.vue';

useGeographic()

export default {
  mixins: [
    Api,
    Dates,
    MapView,
    Paginate,
    Points,
    Routes,
    URLQueryHandler,
  ],

  components: {
    FilterButton,
    FilterForm,
    PointInfo,
  },

  data() {
    return {
      loading: false,
      locationQuery: new LocationQuery({}),
      map: null as Nullable<Map>,
      mappedPoints: [] as Point[],
      mapView: null as Nullable<View>,
      pointsLayer: null as Nullable<VectorLayer>,
      popup: null as Nullable<Overlay>,
      queryInitialized: false,
      routesLayer: null as Nullable<VectorLayer>,
      selectedPoint: null as Nullable<GPSPoint>,
      showControls: false,
    }
  },

  methods: {
    async fetch(): Promise<GPSPoint[]> {
      this.loading = true
      try {
        return this.fetchPoints(this.locationQuery)
      } catch (error) {
        console.error(error)
        return []
      } finally {
        this.loading = false
      }
    },

    fetchNextPage() {
      const nextPageQuery = this.nextPageQuery()
      if (!nextPageQuery) {
        return
      }

      this.locationQuery = nextPageQuery
    },

    fetchPrevPage() {
      const prevPageQuery = this.prevPageQuery()
      if (!prevPageQuery) {
        return
      }

      this.locationQuery = prevPageQuery
    },

    createMap(gpsPoints: GPSPoint[]): Map {
      this.mappedPoints = this.toMappedPoints(gpsPoints)
      this.pointsLayer = this.createPointsLayer(this.mappedPoints)
      this.routesLayer = this.createRoutesLayer(this.mappedPoints)
      this.mapView = this.mapView || this.createMapView(gpsPoints)
      const map = new Map({
        target: 'map',
        layers: [
          this.createMapLayer(),
          this.pointsLayer,
          this.routesLayer,
        ],
        view: this.mapView,
      })

      // @ts-ignore
      this.$refs.popup.bindPopup(map)
      this.bindClick(map)
      this.bindPointerMove(map)
      return map
    },

    bindClick(map: Map) {
      map.on('click', (event) => {
        this.showControls = false
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature)

        if (feature) {
          const point = this.gpsPoints.find((gps: GPSPoint) => {
            const [longitude, latitude] = (feature.getGeometry() as any).getCoordinates()
            return gps.longitude === longitude && gps.latitude === latitude
          })

          if (point) {
            this.selectedPoint = point
            // @ts-ignore
            this.$refs.popup.setPosition(event.coordinate)
            // Center the map on the selected point
            map.getView().setCenter(event.coordinate)
          }
        } else {
          this.selectedPoint = null
        }
      })
    },

    initQuery() {
      const urlQuery = this.parseQuery(window.location.href)
      if (!Object.keys(urlQuery).length) {
        this.setQuery(this.locationQuery)
      } else {
        this.locationQuery = new LocationQuery(urlQuery)
      }
    },

    onStartDateClick() {
      this.locationQuery.startDate = this.oldestPoint?.timestamp
      this.locationQuery.minId = undefined
      this.locationQuery.maxId = undefined
    },

    onEndDateClick() {
      this.locationQuery.endDate = this.newestPoint?.timestamp
      this.locationQuery.minId = undefined
      this.locationQuery.maxId = undefined
    },
  },

  watch: {
    locationQuery: {
      async handler(newQuery, oldQuery) {
        const isFirstQuery = !this.queryInitialized

        // If startDate/endDate have changed, reset minId/maxId
        if (!isFirstQuery &&
          (newQuery.startDate !== oldQuery.startDate || newQuery.endDate !== oldQuery.endDate)
        ) {
          newQuery.minId = undefined
          newQuery.maxId = undefined
          this.hasNextPage = true
          this.hasPrevPage = true
        }

        // Results with maxId should be retrieved in descending order,
        // otherwise all results should be retrieved in ascending order
        newQuery.order = newQuery.maxId ? 'desc' : 'asc'
        this.setQuery(newQuery)
        this.queryInitialized = true

        if (!isFirstQuery) {
          const gpsPoints = await this.fetch()

          // If there are no points, and minId/maxId are set, reset them
          // and don't update the map (it means that we have reached the
          // start/end of the current window)
          if (gpsPoints.length < 2 && (newQuery.minId || newQuery.maxId)) {
            if (newQuery.minId) {
              this.hasNextPage = false
            }

            if (newQuery.maxId) {
              this.hasPrevPage = false
            }

            newQuery.minId = oldQuery.minId
            newQuery.maxId = oldQuery.maxId
            return
          }

          this.gpsPoints = gpsPoints
          this.hasNextPage = gpsPoints.length > 1
          this.hasPrevPage = gpsPoints.length > 1
        }

        this.mappedPoints = this.toMappedPoints(this.gpsPoints)
        if (this.mapView) {
          this.refreshMapView(this.mapView, this.gpsPoints)
          this.refreshPointsLayer(this.pointsLayer, this.mappedPoints)
          this.refreshRoutesLayer(this.routesLayer, this.mappedPoints)
        }
      },
      deep: true,
    },
  },

  async mounted() {
    this.initQuery()
    this.gpsPoints = await this.fetch()
    this.map = this.createMap(this.gpsPoints)
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;
@import "ol/ol.css";

html,
body {
  margin: 0;
  height: 100%;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;

  .controls {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    padding: 0.5em;
    z-index: 1;

    @include mobile {
      bottom: 1em;
    }

    .form-container {
      margin-bottom: 0.5em;
      animation: unroll 0.25s ease-out;
    }
  }

  .time-range {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5em;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 0.25em;
    z-index: 1;

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25em;

      .key {
        margin-right: 1em;
      }

      .value {
        font-weight: bold;
      }
    }
  }
}

@keyframes unroll {
  from {
    transform: translateY(7.5em);
  }
  to {
    transform: translateY(0);
  }
}

:deep(.ol-viewport) {
  .ol-attribution {
    position: absolute !important;
    bottom: 0 !important;
    right: 0 !important;
  }
}
</style>
