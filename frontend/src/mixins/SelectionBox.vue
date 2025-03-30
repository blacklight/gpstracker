<script lang="ts">
export default {
  data() {
    return {
      selectionBox: [] as number[][],
    }
  },

  computed: {
    selectionBoxStyle(): Record<string, string> {
      if (this.selectionBox.length < 2) {
        return {}
      }

      const [minX, minY, maxX, maxY] = [
        Math.min(this.selectionBox[0][0], this.selectionBox[1][0]),
        Math.min(this.selectionBox[0][1], this.selectionBox[1][1]),
        Math.max(this.selectionBox[0][0], this.selectionBox[1][0]),
        Math.max(this.selectionBox[0][1], this.selectionBox[1][1]),
      ]

      return {
        top: minY + 'px',
        left: minX + 'px',
        width: `${maxX - minX}px`,
        height: `${maxY - minY}px`,
      }
    },
  },

  methods: {
    scaledPointerCoordinates(event: MouseEvent): number[] {
      // @ts-ignore
      const offsetLeft = this.$refs.overlay?.getBoundingClientRect().left || 0
      // @ts-ignore
      const offsetTop = this.$refs.overlay?.getBoundingClientRect().top || 0

      return [
        event.clientX - offsetLeft,
        event.clientY - offsetTop,
      ]
    },

    setSelectionBoxCoordinates(event: MouseEvent) {
      const coords = this.scaledPointerCoordinates(event)
      let newBox = JSON.parse(JSON.stringify(this.selectionBox)) as number[][]

      if (newBox.length === 1 || !newBox[1]) {
        newBox.push(coords)
      } else {
        newBox[1] = coords
      }

      newBox = newBox.sort((a: number[], b: number[]) => a[0] - b[0])
      this.selectionBox = newBox
    },

    onOverlayDragStart(event: MouseEvent) {
      this.setSelectionBoxCoordinates(event)
    },

    onOverlayDragEnd(event: MouseEvent) {
      if (this.selectionBox.length < 1) {
        this.selectionBox = []
        return
      }

      this.setSelectionBoxCoordinates(event)
      if (this.selectionBox.length > 1 && (
        this.selectionBox[0][0] === this.selectionBox[1][0] && this.selectionBox[0][1] === this.selectionBox[1][1])
      ) {
        this.selectionBox = []
      }
    },

    onOverlayMove(event: MouseEvent) {
      if (this.selectionBox.length < 1) {
        return
      }

      this.setSelectionBoxCoordinates(event)
    },
  },
}
</script>
