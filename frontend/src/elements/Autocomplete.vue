<template>
  <div class="autocomplete">
    <div class="input">
      <input
        type="text"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        v-model="newValue"
        @focus="onFocus"
        @blur="onBlur"
        ref="input"
      />
    </div>
    <div class="values" v-if="showValues" @click.stop>
      <ul>
        <li v-for="value in filteredValues"
            :key="value.value"
            @click.stop="onItemClick(value)">
          {{ value.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import AutocompleteValue from '../models/AutocompleteValue';

export default {
  emits: ['input'],

  props: {
    id: {
      type: String,
      default: '',
    },

    name: {
      type: String,
      default: '',
    },

    value: {
      type: String,
      default: '',
    },

    values: {
      type: Array as () => AutocompleteValue[],
      default: () => [],
    },

    allowOnlyValues: {
      type: Boolean,
      default: false,
    },

    placeholder: {
      type: String,
      default: 'Search...',
    },
  },

  data() {
    return {
      newValue: '' + this.value,
      showValues: false,
    };
  },

  computed: {
    filteredValues() {
      if (!this.newValue?.length) {
        return this.values;
      }

      let matches = this.values.filter((value: AutocompleteValue) =>
        value.value.toLowerCase() === this.newValue.toLowerCase()
      ) as AutocompleteValue[];

      if (!matches.length) {
        matches = this.values.filter((value: AutocompleteValue) =>
          value.label.toLowerCase().includes(this.newValue.toLowerCase())
        ) as AutocompleteValue[];
      }

      return matches;
    },

    indexedValues() {
      return Object.fromEntries(
        this.values.map((value: AutocompleteValue) => [
          value.value,
          value,
        ])
      );
    },
  },

  methods: {
    onFocus() {
      this.showValues = true;
    },

    onBlur() {
      setTimeout(() => {
        this.showValues = false;
        this.emitInput();
      }, 500);
    },

    onItemClick(value: AutocompleteValue) {
      this.newValue = value.value;
      this.showValues = false;
      this.emitInput();
    },

    emitInput() {
      this.$emit(
        'input',
        this.allowOnlyValues
          ? this.indexedValues[this.newValue]?.value
          : this.newValue
      )
    }
  },

  watch: {
    value(newValue: string) {
      this.newValue = newValue;
    },

    newValue() {
      this.emitInput();
    },
  },
}
</script>

<style lang="scss" scoped>
.autocomplete {
  width: 100%;
  position: relative;

  .input {
    input {
      width: 100%;
    }
  }

  .values {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 20em;
    overflow: auto;
    background-color: var(--color-background);
    z-index: 10;
    box-shadow: 0 0 0.5rem 0 rgba(0, 0, 0, 0.5);

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;

      li {
        padding: 0.8em;
        cursor: pointer;

        &:hover {
          background-color: var(--color-accent-bg);
        }
      }
    }
  }
}
</style>
