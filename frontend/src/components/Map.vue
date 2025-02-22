<template>
  <main>
    <div class="loading" v-if="loading">Loading...</div>
    <div class="map-wrapper" v-else>
      <div id="map">
        <PointInfo :point="selectedPoint" ref="popup" @close="selectedPoint = null" />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Feature from 'ol/Feature';
import GPSPoint from '../models/GPSPoint';
import Map from 'ol/Map';
import LineString from 'ol/geom/LineString';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import PointInfo from './PointInfo.vue';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { Circle, Fill, Style, Stroke } from 'ol/style';
import { useGeographic } from 'ol/proj';
import type { Nullable } from '../models/Types';

// @ts-ignore
const baseURL = __API_PATH__
useGeographic()

export default {
  components: {
    PointInfo,
  },

  data() {
    return {
      gpsPoints: [] as GPSPoint[],
      loading: false,
      map: null as Nullable<Map>,
      popup: null as Nullable<Overlay>,
      routeFeatures: [] as Feature[],
      selectedPoint: null as Nullable<GPSPoint>,
      latlngTolerance: 0.001,
    }
  },

  methods: {
    async fetchPoints() {
      this.loading = true
      try {
        const response = await fetch(`${baseURL}/gpsdata`)
        return (await response.json())
          .map((gps: any) => {
            return new GPSPoint(gps)
          })
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    groupPoints(points: GPSPoint[]) {
      if (!points.length) {
        return []
      }

      const groupedPoints = []
      let group: GPSPoint[] = []
      let prevPoint: GPSPoint = points[0]

      points.forEach((point: GPSPoint, index: number) => {
        if (
          index === 0 || (
            Math.abs(point.latitude - prevPoint.latitude) < this.latlngTolerance &&
            Math.abs(point.longitude - prevPoint.longitude) < this.latlngTolerance
          )
        ) {
          group.push(point)
        } else {
          if (group.length)
            groupedPoints.push(group[0])

          group = [point]
        }
        prevPoint = point
      })

      if (group.length)
        groupedPoints.push(group[0])

      return groupedPoints
    },

    osmLayer() {
      return new TileLayer({
        source: new OSM(),
      })
    },

    pointsLayer(points: Point[]) {
      const pointFeatures = points.map((point: Point) => new Feature(point))
      return new VectorLayer({
        source: new VectorSource({
          features: pointFeatures,
        }),
        style: new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({ color: 'aquamarine' }),
            stroke: new Stroke({ color: 'blue', width: 1 }),
          }),
          zIndex: Infinity,  // Ensure that points are always displayed above other layers
        }),
      })
    },

    routeLayer(points: Point[]) {
      this.routeFeatures = []
      points.forEach((point: Point, index: number) => {
        if (index === 0) {
          return
        }

        const route = new LineString([points[index - 1].getCoordinates(), point.getCoordinates()])
        const routeFeature = new Feature(route)
        this.routeFeatures.push(routeFeature)
      })

      return new VectorLayer({
        source: new VectorSource({
          // @ts-ignore
          features: this.routeFeatures,
        }),
        style: new Style({
          stroke: new Stroke({
            color: 'cornflowerblue',
            width: 2,
          }),
        }),
      })
    },

    createMap(gpsPoints: GPSPoint[]) {
      const points = gpsPoints.map((gps: GPSPoint) => {
        const point = new Point([gps.longitude, gps.latitude])
        return point
      });

      const view = new View(this.getCenterAndZoom())
      const map = new Map({
        target: 'map',
        layers: [
          this.osmLayer(),
          this.pointsLayer(points),
          this.routeLayer(points),
        ],
        view: view
      })

      // @ts-expect-error
      this.$refs.popup.bindPopup(map)
      this.bindClick(map)
      this.bindPointerMove(map)
      return map
    },

    getCenterAndZoom() {
      if (!this.gpsPoints?.length) {
        return {
          center: [0, 0],
          zoom: 2,
        }
      }

      let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
      this.gpsPoints.forEach((gps: GPSPoint) => {
        minX = Math.min(minX, gps.longitude)
        minY = Math.min(minY, gps.latitude)
        maxX = Math.max(maxX, gps.longitude)
        maxY = Math.max(maxY, gps.latitude)
      })

      const center = [(minX + maxX) / 2, (minY + maxY) / 2]
      const zoom = Math.max(2, Math.min(18, 18 - Math.log2(Math.max(maxX - minX, maxY - minY))))
      return { center, zoom }
    },

    bindClick(map: Map) {
      map.on('click', (event) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature)
        if (feature) {
          const point = this.gpsPoints.find((gps: GPSPoint) => {
            const [longitude, latitude] = (feature.getGeometry() as any).getCoordinates()
            return gps.longitude === longitude && gps.latitude === latitude
          })

          if (point) {
            this.selectedPoint = point
            // @ts-expect-error
            this.$refs.popup.setPosition(event.coordinate)
            // Center the map on the selected point
            map.getView().setCenter(event.coordinate)
          }
        } else {
          this.selectedPoint = null
        }
      })
    },

    bindPointerMove(map: Map) {
      map.on('pointermove', (event) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature)
        const target = map.getTargetElement()
        if (!target) {
          return
        }

        if (feature) {
          // @ts-expect-error
          const coords = feature.getGeometry()?.getCoordinates()
          if (coords?.length === 2 && coords.every((coord: number) => !isNaN(coord))) {
            target.title = `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`
          }

          target.style.cursor = 'pointer'
        } else {
          target.style.cursor = ''
          target.title = ''
        }
      })
    },
  },

  async mounted() {
    this.gpsPoints = this.groupPoints(await this.fetchPoints())
    this.map = this.createMap(this.gpsPoints)
  },
}
</script>

<style lang="scss" scoped>
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
}

:deep(.ol-viewport) {
  .ol-attribution {
    position: absolute !important;
    bottom: 0 !important;
    right: 0 !important;
  }
}
</style>
