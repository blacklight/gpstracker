<template>
  <main>
    <div class="loading" v-if="loading">Loading...</div>
    <div class="map-body" v-else>
      <div id="map">
        <div class="time-range" v-if="oldestPoint && newestPoint">
          <div class="row">
            <div class="key">From</div>
            <div class="value">
              <a href="#" @click.prevent.stop="onStartDateClick">
                {{ displayDate(oldestPoint.timestamp) }}
              </a>
            </div>
          </div>
          <div class="row">
            <div class="key">To</div>
            <div class="value">
              <a href="#" @click.prevent.stop="onEndDateClick">
                {{ displayDate(newestPoint.timestamp) }}
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
                        :resolution="resolutionMeters"
                        @refresh="locationQuery = $event"
                        @reset-page="locationQuery.minId = locationQuery.maxId = null"
                        @next-page="fetchNextPage"
                        @prev-page="fetchPrevPage"
                        @set-resolution="setResolution" />
          </div>
          <FilterButton @input="showControls = !showControls"
                        :value="showControls" />
        </div>
      </div>

      <div class="timeline">
        <Timeline :loading="loading"
                  :points="gpsPoints"
                  :show-metrics="showMetrics"
                  @point-hover="onTimelinePointHover"
                  @show-metrics="setShowMetrics" />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import _ from 'lodash';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import PointInfo from './PointInfo.vue';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import { useGeographic } from 'ol/proj';

import type { Optional } from '../models/Types';
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
import Timeline from './Timeline.vue';
import TimelineMetricsConfiguration from '../models/TimelineMetricsConfiguration';
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
    Timeline,
  },

  data() {
    return {
      loading: false,
      map: null as Optional<Map>,
      mapView: null as Optional<View>,
      pointsLayer: null as Optional<VectorLayer>,
      popup: null as Optional<Overlay>,
      queryInitialized: false,
      routesLayer: null as Optional<VectorLayer>,
      selectedPoint: null as Optional<GPSPoint>,
      showControls: false,
      showMetrics: new TimelineMetricsConfiguration(),
    }
  },

  computed: {
    groupedGPSPoints(): GPSPoint[] {
      return this.groupPoints(this.gpsPoints)
    },

    mappedPoints(): Record<string, Point> {
      return this.toMappedPoints(this.groupedGPSPoints)
        .reduce((acc: Record<string, Point>, point: Point) => {
          // @ts-expect-error
          acc[point.values_.id] = point
          return acc
        }, {})
    },
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

    createMap(): Map {
      this.pointsLayer = this.createPointsLayer(Object.values(this.mappedPoints) as Point[])
      this.routesLayer = this.createRoutesLayer(Object.values(this.mappedPoints) as Point[])
      this.mapView = this.mapView || this.createMapView(this.gpsPoints)
      const map = new Map({
        target: 'map',
        layers: [
          this.createMapLayer(),
          // @ts-ignore
          this.pointsLayer,
          // @ts-ignore
          this.routesLayer,
        ],
        // @ts-ignore
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

    refreshShowMetricsFromURL() {
      this.showMetrics = new TimelineMetricsConfiguration(this.parseQuery(window.location.href))
    },

    initQuery() {
      this.refreshShowMetricsFromURL()

      const urlQuery = this.parseQuery(window.location.href)
      if (Object.keys(urlQuery).length) {
        this.locationQuery = new LocationQuery(urlQuery)
      }

      this.setQuery(
        {
          ...this.locationQuery,
          ...this.showMetrics.toQuery(),
          resolutionMeters: this.resolutionMeters,
        }
      )
    },

    onStartDateClick() {
      this.locationQuery.startDate = this.oldestPoint?.timestamp || null
      this.locationQuery.minId = null
      this.locationQuery.maxId = null
    },

    onEndDateClick() {
      this.locationQuery.endDate = this.newestPoint?.timestamp || null
      this.locationQuery.minId = null
      this.locationQuery.maxId = null
    },

    onTimelinePointHover(point: GPSPoint) {
      if (!this.pointsLayer) {
        return
      }

      this.highlightPoint(this.pointsLayer as VectorLayer, point)
    },

    setResolution(resolution: number) {
      this.resolutionMeters = resolution
    },

    setShowMetrics(metrics: any) {
      Object.assign(this.showMetrics, metrics)
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
          newQuery.minId = null
          newQuery.maxId = null
          this.hasNextPage = true
          this.hasPrevPage = true
        }

        // Results with maxId should be retrieved in descending order,
        // otherwise all results should be retrieved in ascending order
        newQuery.order = newQuery.maxId ? 'desc' : 'asc'
        this.setQuery(
          {
            ...newQuery,
            ...this.showMetrics.toQuery(),
            resolutionMeters: this.resolutionMeters,
          }
        )

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

        if (this.mapView) {
          // @ts-ignore
          this.refreshMapView(this.mapView, this.gpsPoints)
          // @ts-ignore
          this.refreshPointsLayer(this.pointsLayer, Object.values(this.mappedPoints))
          // @ts-ignore
          this.refreshRoutesLayer(this.routesLayer, Object.values(this.mappedPoints))
        }
      },
      deep: true,
    },

    resolutionMeters() {
      this.setQuery({
        ...this.locationQuery,
        ...this.showMetrics.toQuery(),
        resolutionMeters: this.resolutionMeters,
      })
    },

    showMetrics: {
      handler() {
        this.setQuery({
          ...this.locationQuery,
          ...this.showMetrics.toQuery(),
          resolutionMeters: this.resolutionMeters,
        })
      },
      deep: true,
    },
  },

  async mounted() {
    this.initQuery()
    this.gpsPoints = await this.fetch()
    this.map = this.createMap()
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;
@import "ol/ol.css";

$timeline-height: 10rem;

main {
  width: 100%;
  height: 100%;
}

.map-body {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: calc(100% - #{$timeline-height});

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

.timeline {
  width: 100%;
  height: $timeline-height;
  position: absolute;
  bottom: 0;
  background-color: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 0.5em;
  box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
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
