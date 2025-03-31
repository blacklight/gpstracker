<template>
  <div class="circle"
       ref="circle"
       :style="circleStyle" />
</template>

<script lang="ts">
import Geo from '../mixins/Geo.vue';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';

export default {
  mixins: [Geo],
  props: {
    map: {
      type: Map,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    radius: {
      // Unit: meters
      type: Number,
      required: true,
    },

    color: {
      type: String,
      default: 'var(--color-accent)',
    },

    borderColor: {
      type: String,
      default: 'rgba(0, 0, 0, 0.2)',
    },
  },

  data() {
    return {
      overlay: null as Overlay | null,
    }
  },

  computed: {
    center(): { x: number | null, y: number | null } {
      const pixel = this.map.getPixelFromCoordinate([this.longitude, this.latitude]);
      if (!pixel) {
        return {
          x: null,
          y: null,
        };
      }

      return {
        x: pixel[0],
        y: pixel[1],
      };
    },

    circleStyle() {
      if (!(this.center.x && this.center.y)) {
        return {};
      }

      return {
        width: `${this.radiusPx * 2}px`,
        height: `${this.radiusPx * 2}px`,
        backgroundColor: this.color,
        border: `1px solid ${this.borderColor}`,
      };
    },

    radiusPx() {
      const center = this.map.getPixelFromCoordinate([this.longitude, this.latitude]);
      const radiusLatOffset = 90 * (this.radius / this.earthRadius) * Math.cos(this.latitude * Math.PI / 180);
      const radius = this.map.getPixelFromCoordinate([this.longitude, this.latitude + radiusLatOffset]);
      return Math.abs(center[1] - radius[1]);
    },
  },

  methods: {
    bind() {
      this.overlay = new Overlay({
        element: this.$el,
        positioning: 'center-center',
      });

      this.map.addOverlay(this.overlay as Overlay);

      // Force show the Overlay
      (this.overlay as Overlay).setPosition([this.longitude, this.latitude]);
    },

    unbind() {
      if (this.overlay) {
        this.map.removeOverlay(this.overlay as Overlay);
      }
    },
  },

  mounted() {
    this.bind();
  },

  unmounted() {
    this.unbind();
  },
};
</script>

<style lang="scss" scoped>
.circle {
  position: absolute;
  width: 0;
  height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.25;
  z-index: 1001;
}
</style>
