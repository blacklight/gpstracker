<template>
  <div class="autocomplete">
    <div class="input">
      <input
        type="text"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :value="newValue"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown="onKeyDown"
        ref="input"
      />
    </div>
    <div class="values" v-if="showValues" @click.stop>
      <ul ref="values">
        <li v-for="(value, i) in filteredValues"
            :key="value.value"
            :class="{ 'selected': i === hoverValueIndex }"
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
      hoverValueIndex: -1,
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

    hoverValue() {
      return this.hoverValueIndex >= 0
        ? this.filteredValues[this.hoverValueIndex]
        : null;
    },
  },

  methods: {
    onInput(event: InputEvent) {
      event?.stopPropagation();
      this.newValue = (event.target as HTMLInputElement).value;
      this.hoverValueIndex = -1;
      this.$emit('input', this.newValue);
    },

    onFocus() {
      this.showValues = true;
    },

    onBlur() {
      this.hoverValueIndex = -1;
      this.emitInput();
      setTimeout(() => {
        this.showValues = false;
      }, 250);
    },

    onItemClick(value: AutocompleteValue) {
      this.newValue = value.value;
      this.showValues = false;
      this.emitInput();
    },

    onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        if (this.hoverValue) {
          this.onItemClick(this.hoverValue);
        } else {
          this.showValues = false;
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.showValues = false;
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.hoverValueIndex = (this.hoverValueIndex + 1) % this.filteredValues.length;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.hoverValueIndex =
          (this.hoverValueIndex - 1 + this.filteredValues.length) % this.filteredValues.length;
      } else {
        this.showValues = true;
      }
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
    hoverValueIndex(newValue: number, oldValue: number) {
      if (newValue !== oldValue) {
        this.$nextTick(() => {
          const list = this.$refs.values as HTMLUListElement;
          if (list && list.children[newValue]) {
            list.children[newValue].scrollIntoView({
              block: 'nearest',
              inline: 'nearest',
            });
          }
        });
      }
    },

    showValues(newValue: boolean, oldValue: boolean) {
      if (oldValue !== newValue) {
        this.hoverValueIndex = -1;
      }

      if (newValue) {
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      }
    },

    value(newValue: string) {
      this.newValue = newValue;
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

        &:hover,
        &.selected {
          background-color: var(--color-accent-bg);
        }
      }
    }
  }
}
</style>
