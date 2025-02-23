<template>
  <main>
    <div class="loading" v-if="loading">Loading...</div>
    <div class="map-wrapper" v-else>
      <div id="map">
        <PointInfo :point="selectedPoint"
                   ref="popup"
                   @close="selectedPoint = null" />

        <div class="controls">
          <div class="form-container" v-if="showControls">
            <FilterForm :value="locationQuery" @refresh="locationQuery = $event" />
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
import FilterButton from './filter/ToggleButton.vue';
import FilterForm from './filter/Form.vue';
import GPSPoint from '../models/GPSPoint';
import LocationQuery from '../models/LocationQuery';
import MapView from '../mixins/MapView.vue';
import Points from '../mixins/Points.vue';
import Routes from '../mixins/Routes.vue';
import URLQueryHandler from '../mixins/URLQueryHandler.vue';

useGeographic()

export default {
  mixins: [
    Api,
    MapView,
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
      gpsPoints: [] as GPSPoint[],
      loading: false,
      locationQuery: new LocationQuery({}),
      map: null as Nullable<Map>,
      mapView: null as Nullable<View>,
      pointsLayer: null as Nullable<VectorLayer>,
      popup: null as Nullable<Overlay>,
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

    createMap(gpsPoints: GPSPoint[]): Map {
      const points = gpsPoints.map((gps: GPSPoint) => new Point([gps.longitude, gps.latitude]))
      this.pointsLayer = this.createPointsLayer(points)
      this.routesLayer = this.createRoutesLayer(points)
      this.mapView = this.createMapView(gpsPoints)
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
  },

  watch: {
    locationQuery: {
      async handler() {
        this.setQuery(this.locationQuery)
        this.gpsPoints = this.groupPoints(await this.fetch())
        const points = this.gpsPoints.map((gps: GPSPoint) => new Point([gps.longitude, gps.latitude]))
        this.refreshMapView(this.mapView, this.gpsPoints)
        this.refreshPointsLayer(this.pointsLayer, points)
        this.refreshRoutesLayer(this.routesLayer, points)
      },
      deep: true,
    },
  },

  async mounted() {
    this.initQuery()
    this.gpsPoints = this.groupPoints(await this.fetch())
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
