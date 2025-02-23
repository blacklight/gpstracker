<script lang="ts">
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { useGeographic } from 'ol/proj';

import GPSPoint from '../models/GPSPoint';
import Points from './Points.vue';

useGeographic()

export default {
  mixins: [Points],
  methods: {
    createMapLayer(): TileLayer {
      return new TileLayer({
        source: new OSM(),
      })
    },

    createMapView(points: GPSPoint[]): View {
      return new View(this.getCenterAndZoom(points))
    },

    refreshMapView(view: View, points: GPSPoint[]) {
      const { center, zoom } = this.getCenterAndZoom(points)
      view.setCenter(center)
      view.setZoom(zoom)
    },
  },
}
</script>
