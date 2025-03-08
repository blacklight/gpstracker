<script lang="ts">
export default {
  methods: {
    installDropdownHandler() {
      document.addEventListener('click', (event) => {
        if (!(event.target as HTMLElement).closest('.dropdown__button')) {
          document.querySelectorAll('.dropdown__container').forEach((content) => {
            content.classList.remove('show');
          });
        }
      });
    },
  },
}
</script>

