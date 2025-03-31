<template>
  <div class="overlay-container">
    <div class="overlay-popup" @click.stop>
      <p>Filter location points in the selected area.</p>
      <button @click="$emit('close')">Close</button>
    </div>
    <div class="overlay"
         ref="overlay"
         @mousedown="onSelectionStart"
         @mouseup="onSelectionEnd"
         @mousemove="onSelectionEdit"
         @touchstart.stop.prevent="onSelectionStart"
         @touchend.stop.prevent="onSelectionEnd"
         @touchmove.stop.prevent="onSelectionEdit"
         @click="onSelectionEnd">
      <div class="box"
           :style="selectionBoxStyle"
           v-if="selectionBox.length > 1" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  emits: ['close', 'select'],

  data() {
    return {
      latestTouchEvent: null as TouchEvent | null,
      overlayDragging: false,
      selectionBox: [] as number[][],
    }
  },

  computed: {
    selectionBoxStyle(): Record<string, string> {
      if (this.selectionBox.length < 2) {
        return {}
      }

      const scaledCoords = [
        // @ts-ignore
        this.scaledPointerCoordinates(...this.selectionBox[0]),
        // @ts-ignore
        this.scaledPointerCoordinates(...this.selectionBox[1]),
      ]

      const [minX, minY, maxX, maxY] = this.sorted(scaledCoords).flat()
      return {
        top: minY + 'px',
        left: minX + 'px',
        width: `${maxX - minX}px`,
        height: `${maxY - minY}px`,
      }
    },

    hasDistinctPoints(): boolean {
      return this.selectionBox.length > 1 && this.selectionBox[1] && (
        this.selectionBox[0][0] !== this.selectionBox[1][0] || this.selectionBox[0][1] !== this.selectionBox[1][1]
      )
    },
  },

  methods: {
    sorted(coords: number[][]): number[][] {
      if ((coords?.length || 0) < 2) {
        return coords
      }

      return [
        [Math.min(coords[0][0], coords[1][0]), Math.min(coords[0][1], coords[1][1])],
        [Math.max(coords[0][0], coords[1][0]), Math.max(coords[0][1], coords[1][1])],
      ]
    },

    scaledPointerCoordinates(x: number, y: number): number[] {
      // @ts-ignore
      const offsetLeft = this.$refs.overlay?.getBoundingClientRect().left || 0
      // @ts-ignore
      const offsetTop = this.$refs.overlay?.getBoundingClientRect().top || 0

      return [
        x - offsetLeft,
        y - offsetTop,
      ]
    },

    getXY(event: MouseEvent | TouchEvent): number[] {
      let [x, y] = [null, null] as [number | null, number | null]
      if (event instanceof TouchEvent) {
        if (event.touches?.length) {
          x = event.touches[0].clientX
          y = event.touches[0].clientY
        } else if (event.changedTouches?.length) {
          x = event.changedTouches[0].clientX
          y = event.changedTouches[0].clientY
        } else if (this.latestTouchEvent) {
          x = this.latestTouchEvent.changedTouches[0].clientX
          y = this.latestTouchEvent.changedTouches[0].clientY
        } else {
          return []
        }
      } else {
        x = event.clientX
        y = event.clientY
      }

      if (x == null || y == null) {
        return []
      }

      return [x, y]
    },

    setSelectionBoxCoordinates(event: MouseEvent | TouchEvent) {
      const coords = this.getXY(event)
      let newBox = JSON.parse(JSON.stringify(this.selectionBox)) as number[][]

      if (newBox.length === 1 || !newBox[1]) {
        newBox.push(coords)
      } else {
        newBox[1] = coords
        newBox = newBox.sort((a, b) => a[0] - b[0])
      }

      this.selectionBox = newBox
    },

    onSelectionStart(event: MouseEvent | TouchEvent) {
      this.selectionBox = []
      this.setSelectionBoxCoordinates(event)
      this.overlayDragging = true
    },

    onSelectionEdit(event: MouseEvent | TouchEvent) {
      if (!this.overlayDragging || this.selectionBox.length < 1) {
        return
      }

      this.setSelectionBoxCoordinates(event)
    },

    onSelectionEnd(event: MouseEvent | TouchEvent) {
      if (this.selectionBox.length < 1) {
        this.selectionBox = []
        return
      }

      if (!this.hasDistinctPoints) {
        this.selectionBox = []
      }

      this.setSelectionBoxCoordinates(event)
      this.overlayDragging = false
      this.latestTouchEvent = null

      if (this.hasDistinctPoints) {
        this.$emit(
          'select',
          [
            // @ts-ignore
            this.scaledPointerCoordinates(...this.selectionBox[0]),
            // @ts-ignore
            this.scaledPointerCoordinates(...this.selectionBox[1])
          ]
        )
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@use "./vars.scss" as *;

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - #{$timeline-height});
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .overlay-popup {
    position: absolute;
    bottom: 0;
    background: rgba(0, 0, 0, 0.15);
    color: white;
    display: flex;
    flex-direction: column;
    padding: 1em;
    border-radius: 0.25em;
    box-shadow: 0 0 0.25em rgba(0, 0, 0, 0.5);
    opacity: 0.75;
    z-index: 1002;

    button {
      background: transparent;
      color: white;
      margin-top: 0.5em;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1001;

    .box {
      position: absolute;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--color-accent);
    }
  }
}
</style>
