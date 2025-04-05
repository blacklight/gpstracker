<template>
  <main>
    <div class="loading" v-if="loading">Loading...</div>
    <div class="map-body" v-else>
      <MapSelectOverlay
        @close="showSelectOverlay = false"
        @select="onAreaSelect"
        v-if="showSelectOverlay" />

      <div id="map">
        <div class="time-range" v-if="oldestPoint && newestPoint">
          <div class="row">
            <div class="key">From</div>
            <div class="value">
              <a href="#" @click.prevent.stop="onStartDateClick">
                {{ formatDate(oldestPoint.timestamp) }}
              </a>
            </div>
          </div>
          <div class="row">
            <div class="key">To</div>
            <div class="value">
              <a href="#" @click.prevent.stop="onEndDateClick">
                {{ formatDate(newestPoint.timestamp) }}
              </a>
            </div>
          </div>

          <div class="row">
            <div class="key">Total Distance</div>
            <div class="value">{{ displayDistance(getTotalDistance(gpsPoints)) }}</div>
          </div>
        </div>

        <MapCircle v-if="selectedPoint?.accuracy != null && mapObj"
                   :map="mapObj"
                   :latitude="selectedPoint.latitude"
                   :longitude="selectedPoint.longitude"
                   :radius="selectedPoint.accuracy" />

        <PointInfo :point="selectedPoint"
                   :device="selectedPoint ? devicesById[selectedPoint?.deviceId] : null"
                   ref="popup"
                   @remove="onRemove"
                   @edit="editPoint"
                   @close="clearSelectedPoint" />

        <div class="controls">
          <div class="form-container" v-if="showControls">
            <FilterForm :value="locationQuery"
                        :countries="countries"
                        :devices="devices"
                        :disabled="loading"
                        :resolution="resolutionMeters"
                        @refresh="onFormUpdate"
                        @set-resolution="setResolution" />
          </div>
          <FilterButton @input="showControls = !showControls"
                        :value="showControls" />
        </div>

        <div class="floating-buttons-container">
          <div class="floating-buttons">
            <FloatingButton
                :icon="'fas ' + (hasSelectionBox ? 'fa-remove' : 'fa-object-ungroup')"
                :title="showSelectOverlay || hasSelectionBox ? 'Reset selection' : 'Filter by area'"
                :primary="showSelectOverlay || hasSelectionBox"
                @click="onSelectOverlayButtonClick" />
          </div>
        </div>
      </div>

      <div class="timeline">
        <Timeline :loading="loading"
                  :locationQuery="locationQuery"
                  :points="gpsPoints"
                  :show-metrics="showMetrics"
                  @next-page="fetchNextPage"
                  @prev-page="fetchPrevPage"
                  @reset-page="resetPage"
                  @point-hover="onTimelinePointHover"
                  @show-metrics="setShowMetrics" />
      </div>
    </div>

    <ConfirmDialog
      :visible="true"
      :disabled="loading"
      v-if="pointToRemove"
      @close="pointToRemove = null"
      @confirm="removePoint">
      <template #title>
        Remove point
      </template>

      Are you sure you want to remove this point?
    </ConfirmDialog>
  </main>
</template>

<script lang="ts">
import _ from 'lodash';
import Map from 'ol/Map';
import MapCircle from './MapCircle.vue';
import Point from 'ol/geom/Point';
import PointInfo from './PointInfo.vue';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import { useGeographic } from 'ol/proj';

import type { Optional } from '../models/Types';
import Api from '../mixins/Api.vue';
import ConfirmDialog from '../elements/ConfirmDialog.vue';
import Country from '../models/Country';
import Dates from '../mixins/Dates.vue';
import Feature from 'ol/Feature';
import FilterButton from './filter/ToggleButton.vue';
import FilterForm from './filter/Form.vue';
import FloatingButton from '../elements/FloatingButton.vue';
import GPSPoint from '../models/GPSPoint';
import LocationQuery from '../models/LocationQuery';
import LocationQueryMixin from '../mixins/LocationQuery.vue';
import LocationStats from '../models/LocationStats';
import MapSelectOverlay from './MapSelectOverlay.vue';
import MapView from '../mixins/MapView.vue';
import Paginate from '../mixins/Paginate.vue';
import Points from '../mixins/Points.vue';
import Routes from '../mixins/Routes.vue';
import StatsRequest from '../models/StatsRequest';
import Timeline from './Timeline.vue';
import TimelineMetricsConfiguration from '../models/TimelineMetricsConfiguration';
import URLQueryHandler from '../mixins/URLQueryHandler.vue';
import UserDevice from '../models/UserDevice';

useGeographic()

export default {
  mixins: [
    Api,
    Dates,
    LocationQueryMixin,
    MapView,
    Paginate,
    Points,
    Routes,
    URLQueryHandler,
  ],

  components: {
    ConfirmDialog,
    FilterButton,
    FilterForm,
    FloatingButton,
    MapCircle,
    MapSelectOverlay,
    PointInfo,
    Timeline,
  },

  data() {
    return {
      countries: [] as Country[],
      devices: [] as UserDevice[],
      loading: false,
      map: null as Optional<Map>,
      mapView: null as Optional<View>,
      pointToRemove: null as Optional<GPSPoint>,
      pointsLayer: null as Optional<VectorLayer>,
      refreshPoints: 0,
      routesLayer: null as Optional<VectorLayer>,
      selectedFeature: null as Optional<Feature>,
      selectedPoint: null as Optional<GPSPoint>,
      selectedPointIndex: null as Optional<number>,
      showControls: false,
      showMetrics: new TimelineMetricsConfiguration(),
      showSelectOverlay: false,
    }
  },

  computed: {
    devicesById(): Record<string, UserDevice> {
      return this.devices.reduce((acc: Record<string, UserDevice>, device: any) => {
        acc[device.id] = device
        return acc
      }, {})
    },

    groupedGPSPoints(): GPSPoint[] {
      // Reference refreshPoints to force reactivity
      this.refreshPoints;
      return this.groupPoints(this.gpsPoints)
    },

    hasSelectionBox(): boolean {
      return this.locationQuery.minLongitude != null &&
        this.locationQuery.minLatitude != null &&
        this.locationQuery.maxLongitude != null &&
        this.locationQuery.maxLatitude != null
    },

    mappedPoints(): Record<string, Point> {
      // Reference refreshPoints to force reactivity
      this.refreshPoints;
      return this.toMappedPoints(this.groupedGPSPoints)
        .reduce((acc: Record<string, Point>, point: Point) => {
          // @ts-expect-error
          acc[point.values_.id] = point
          return acc
        }, {})
    },

    mapObj(): Map | null {
      if (!this.map) {
        return null
      }

      return this.map as Map
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

    async removePoint() {
      if (!this.pointToRemove) {
        return
      }

      this.loading = true
      try {
        this.deletePoints([this.pointToRemove])
        if (this.selectedFeature) {
          const routeFeatures = this.routesLayer?.getSource()?.getFeatures()?.filter((f: Feature) => {
            const [start, end] = (f.getGeometry() as any).getCoordinates()
            return (
              (
                this.pointToRemove?.longitude === start[0] &&
                this.pointToRemove?.latitude === start[1]
              ) || (
                this.pointToRemove?.longitude === end[0] &&
                this.pointToRemove?.latitude === end[1]
              )
            )
          })

          if (routeFeatures?.length) {
            this.routesLayer?.getSource()?.removeFeatures(routeFeatures)
          }

          this.pointsLayer?.getSource()?.removeFeature(this.selectedFeature)
        }

        this.gpsPoints = this.gpsPoints.filter((p: GPSPoint) => p.id !== this.pointToRemove?.id)
        this.refreshPoints++
      } finally {
        this.loading = false
        this.pointToRemove = null
        this.clearSelectedPoint()
      }
    },

    async editPoint(value: GPSPoint) {
      const index = this.selectedPointIndex
      if (index === null) {
        return
      }

      await this.updatePoints([value])
      this.gpsPoints[index] = value
    },

    onRemove(point: GPSPoint) {
      this.pointToRemove = point
    },

    fetchNextPage() {
      const nextPageQuery = this.nextPageQuery()
      if (!nextPageQuery) {
        return
      }

      this.locationQuery = new LocationQuery(nextPageQuery)
    },

    fetchPrevPage() {
      const prevPageQuery = this.prevPageQuery()
      if (!prevPageQuery) {
        return
      }

      this.locationQuery = new LocationQuery(prevPageQuery)
    },

    async resetPage() {
      const oldQuery = { ...this.locationQuery }
      this.locationQuery.minId = this.locationQuery.maxId = null
      await this.processQueryChange(this.locationQuery, oldQuery)
    },

    async getCountries(): Promise<Country[]> {
      return (
        await this.getStats(
          new StatsRequest({
            // @ts-ignore
            userId: this.$root.user.id,
            groupBy: ['country'],
            order: 'desc',
          })
        )
      )
      .filter((record: LocationStats) => !!record.key.country)
      .map((record: LocationStats) => Country.fromCode(record.key.country))
      .filter((country: Optional<Country>) => !!country)
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

    refreshMap() {
      // @ts-ignore
      this.refreshMapView(this.mapView, this.gpsPoints)
      // @ts-ignore
      this.refreshPointsLayer(this.pointsLayer, Object.values(this.mappedPoints))
      // @ts-ignore
      this.refreshRoutesLayer(this.routesLayer, Object.values(this.mappedPoints))
    },

    bindClick(map: Map) {
      map.on('click', (event) => {
        this.showControls = false
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature)

        if (feature) {
          this.selectedFeature = feature as Feature
          const point = this.gpsPoints.find((gps: GPSPoint, index: number) => {
            const [longitude, latitude] = (feature.getGeometry() as any).getCoordinates()
            if (gps.longitude === longitude && gps.latitude === latitude) {
              this.selectedPointIndex = index
              return true
            }

            return false
          })

          if (point) {
            this.selectPoint(point)
            // @ts-ignore
            this.$refs.popup.setPosition(event.coordinate)
            // Center the map on the selected point
            map.getView().setCenter(event.coordinate)
          }
        } else {
          this.clearSelectedPoint()
        }
      })
    },

    selectPoint(point: GPSPoint) {
      this.selectedPoint = point
      this.highlightPoint(this.pointsLayer as VectorLayer, point)
    },

    clearSelectedPoint() {
      this.selectedPoint = null
      this.selectedPointIndex = null
      this.selectedFeature = null
      this.removePointHighlight(this.pointsLayer as VectorLayer)
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

    onFormUpdate(event: any) {
      this.locationQuery = new LocationQuery(event)
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

    onAreaSelect(selectionBox: number[][]) {
      this.showSelectOverlay = false
      if (!selectionBox.length) {
        return
      }

      let [start, end] = selectionBox
      if (!(start && end)) {
        return
      }

      const startPoint = this.map?.getCoordinateFromPixel(start)
      const endPoint = this.map?.getCoordinateFromPixel(end)
      if (!(startPoint && endPoint)) {
        return
      }

      const [startLon, startLat, endLon, endLat] = [
        Math.min(startPoint[0], endPoint[0]),
        Math.min(startPoint[1], endPoint[1]),
        Math.max(startPoint[0], endPoint[0]),
        Math.max(startPoint[1], endPoint[1]),
      ]

      this.locationQuery = new LocationQuery({
        ...this.locationQuery,
        startDate: null,
        endDate: null,
        minId: null,
        maxId: null,
        minLongitude: startLon,
        minLatitude: startLat,
        maxLongitude: endLon,
        maxLatitude: endLat,
      })
    },

    onSelectOverlayButtonClick() {
      if (!this.hasSelectionBox) {
        this.showSelectOverlay = true
      } else {
        this.locationQuery = new LocationQuery({
          ...this.locationQuery,
          minId: null,
          maxId: null,
          minLongitude: null,
          minLatitude: null,
          maxLongitude: null,
          maxLatitude: null,
        })
      }
    },

    async processQueryChange(newQuery: LocationQuery, oldQuery: LocationQuery) {
        // If startDate/endDate have changed, reset minId/maxId
        if (newQuery.startDate !== oldQuery.startDate || newQuery.endDate !== oldQuery.endDate) {
          newQuery.minId = null
          newQuery.maxId = null
          this.hasNextPage = true
          this.hasPrevPage = true
        }

        newQuery.order = newQuery.order || 'desc'
        this.setQuery(
          {
            ...newQuery,
            ...this.showMetrics.toQuery(),
            resolutionMeters: this.resolutionMeters,
          }
        )

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

        if (this.mapView) {
          this.refreshMap()
        }
      },
  },

  watch: {
    locationQuery: {
      async handler(newQuery: LocationQuery, oldQuery: LocationQuery) {
        if (!this.isQueryChanged({
          newValue: newQuery,
          oldValue: oldQuery,
        })) {
          return
        }

        await this.processQueryChange(newQuery, oldQuery)
      },
      deep: true,
    },

    resolutionMeters() {
      this.setQuery({
        ...this.locationQuery,
        ...this.showMetrics.toQuery(),
        resolutionMeters: this.resolutionMeters,
      })

      this.refreshMap()
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
    this.initQuery();
    [this.gpsPoints, this.devices] = await Promise.all([
      this.fetch(),
      this.getMyDevices(),
    ])

    this.map = this.createMap()
    this.countries = await this.getCountries()
  },
}
</script>

<style lang="scss" scoped>
@use "@/styles/common.scss" as *;
@use "./vars.scss" as *;
@import "ol/ol.css";

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
    max-height: calc(100% + 4em);
    display: flex;
    flex-direction: column;
    padding: 0.5em;
    z-index: 1;

    @include media(mobile) {
      bottom: 1em;
    }

    .form-container {
      max-height: calc(100% - 8em);
      margin-bottom: 0.5em;
      animation: unroll 0.25s ease-out;
    }
  }

  .time-range {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5em;
    background: var(--color-background);
    border-radius: 0.25em;
    opacity: 0.8;
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

.floating-buttons-container {
  width: 100%;
  height: 5em;
  position: absolute;
  bottom: 0;
  right: 0;

  .floating-buttons {
    height: 100%;
    position: relative;
    display: flex;
    justify-content: flex-end;

    :deep(button) {
      position: absolute;
    }
  }
}

:deep(.ol-viewport) {
  .ol-attribution {
    display: none;
  }

  .ol-control {
    margin-bottom: 0.5em;
  }

  button {
    background: var(--color-background);
  }
}
</style>
