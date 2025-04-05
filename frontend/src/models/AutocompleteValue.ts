class AutocompleteValue {
  value: string;
  label: string;
  data?: any | null = undefined;

  constructor(record: {
    value: string;
    label: string;
    data?: any | null;
  }) {
    this.value = record.value;
    this.label = record.label;
    this.data = record.data;
  }

  toString(): string {
    return this.label;
  }
}

export default AutocompleteValue;
