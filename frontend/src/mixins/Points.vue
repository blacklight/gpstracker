<script lang="ts">
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Style, Stroke } from 'ol/style';
import { useGeographic } from 'ol/proj';

import GPSPoint from '../models/GPSPoint';
import Geo from './Geo.vue';
import Units from './Units.vue';

const minZoom = 2
const maxZoom = 18

useGeographic()

const pointStyles = {
  default: new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({ color: 'aquamarine' }),
      stroke: new Stroke({ color: 'blue', width: 1 }),
    }),
    zIndex: Infinity,  // Ensure that points are always displayed above other layers
  }),

  highlighted: new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
      stroke: new Stroke({ color: '#FF0000', width: 2 }),
    }),
    zIndex: Infinity,  // Ensure that points are always displayed above other layers
  }),
}

export default {
  mixins: [Geo, Units],
  data() {
    return {
      metersTolerance: 20,
      highlightedPointId: null as number | null,
      highlightedFeature: null as Feature | null,
    }
  },

  methods: {
    groupPoints(points: GPSPoint[]): GPSPoint[] {
      if (!points.length) {
        return []
      }

      const groupedPoints = []
      let group: GPSPoint[] = []
      let prevPoint: GPSPoint = points[0]

      points.forEach((point: GPSPoint, index: number) => {
        if (index === 0 || this.latLngToDistance(point, prevPoint) < this.metersTolerance) {
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

    getTotalDistance(points: GPSPoint[]) {
      let totalDistance = 0
      let prevPoint: GPSPoint = points[0]

      points.forEach((point: GPSPoint) => {
        totalDistance += this.latLngToDistance(point, prevPoint)
        prevPoint = point
      })

      return totalDistance
    },

    createPointsLayer(points: Point[]): VectorLayer {
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

    refreshPointsLayer(layer: VectorLayer, points: Point[]) {
      const source = layer.getSource()
      if (!source) {
        return
      }

      source.clear()
      source.addFeatures(points.map((point: Point) => new Feature(point)))
      source.changed()
    },

    toMappedPoints(gpsPoints: GPSPoint[]): Point[] {
      return gpsPoints.map(
        (gps: GPSPoint) => {
          const point = new Point([gps.longitude, gps.latitude])
          point.setProperties(gps)
          return point
        }
      )
    },

    getCenterAndZoom(points: GPSPoint[]) {
      if (!points?.length) {
        return {
          center: [0, 0],
          zoom: minZoom,
        }
      }

      let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
      points.forEach((gps: GPSPoint) => {
        minX = Math.min(minX, gps.longitude)
        minY = Math.min(minY, gps.latitude)
        maxX = Math.max(maxX, gps.longitude)
        maxY = Math.max(maxY, gps.latitude)
      })

      const center = [(minX + maxX) / 2, (minY + maxY) / 2]
      const winScaleMultiplier = (window.innerHeight / window.innerWidth) * 2560
      const logDisplacement = Math.log2(Math.max(maxX - minX, maxY - minY) * winScaleMultiplier)
      const zoom = Math.max(minZoom, Math.min(maxZoom, (maxZoom + 2) - logDisplacement))
      return { center, zoom }
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

    highlightPoint(layer: VectorLayer | null, point: GPSPoint) {
      if (!layer) {
        return
      }

      const feature = layer.getSource()?.getClosestFeatureToCoordinate([point.longitude, point.latitude])
      if (feature) {
        if (point.id === this.highlightedPointId) {
          return
        }

        // Reset the previous highlighted point, if any
        if (this.highlightedPointId) {
          const prevFeature = this.highlightedFeature
          if (prevFeature) {
            prevFeature.setStyle(pointStyles.default)
          }
        }

        feature.setStyle(pointStyles.highlighted)
        this.highlightedPointId = point.id
        this.highlightedFeature = feature
      }
    },
  },
}
</script>
