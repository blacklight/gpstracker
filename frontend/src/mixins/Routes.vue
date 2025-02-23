<script lang="ts">
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke } from 'ol/style';

export default {
  methods: {
    createRoutesLayer(points: Point[]) {
      const routeFeatures = this.extractRouteFeatures(points)
      return new VectorLayer({
        source: new VectorSource({
          // @ts-ignore
          features: routeFeatures,
        }),
        style: new Style({
          stroke: new Stroke({
            color: 'cornflowerblue',
            width: 3,
          }),
        }),
      })
    },

    refreshRoutesLayer(layer: VectorLayer, points: Point[]) {
      const routeFeatures = this.extractRouteFeatures(points)
      const source = layer.getSource()
      source.clear()
      source.addFeatures(routeFeatures)
      source.changed()
    },

    extractRouteFeatures(points: Point[]): Feature[] {
      const routeFeatures = []
      points.forEach((point: Point, index: number) => {
        if (index === 0) {
          return
        }

        const route = new LineString(
          [points[index - 1].getCoordinates(), point.getCoordinates()]
        )
        const routeFeature = new Feature(route)
        routeFeatures.push(routeFeature)
      })

      return routeFeatures
    }
  },
}
</script>
