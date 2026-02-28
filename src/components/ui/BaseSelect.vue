<script setup lang="ts">
import { computed } from 'vue';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue: string | number;
  options: Option[];
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  lightMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  lightMode: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const inputId = computed(() => props.id || props.name || `select-${Math.random().toString(36).substr(2, 9)}`);

const selectClasses = computed(() => [
  props.lightMode ? 'input-field-light' : 'input-field',
  props.error ? 'input-field-error' : '',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
]);

const labelClasses = computed(() =>
  props.lightMode ? 'input-label-light' : 'input-label'
);

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div>
    <label v-if="props.label" :for="inputId" :class="labelClasses">
      {{ props.label }}
      <span v-if="props.required" class="text-error">*</span>
    </label>

    <select
      :id="inputId"
      :value="props.modelValue"
      :required="props.required"
      :disabled="props.disabled"
      :name="props.name"
      :class="selectClasses"
      @change="handleChange"
    >
      <option v-if="props.placeholder" value="" disabled>{{ props.placeholder }}</option>
      <option
        v-for="option in props.options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>

    <p v-if="props.error" class="input-error-message">{{ props.error }}</p>
    <p v-else-if="props.hint" class="input-hint">{{ props.hint }}</p>
  </div>
</template>
