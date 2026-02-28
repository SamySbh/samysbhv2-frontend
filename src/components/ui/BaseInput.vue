<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  id?: string;
  name?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  lightMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false,
  lightMode: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const inputId = computed(() => props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`);

const inputClasses = computed(() => [
  props.lightMode ? 'input-field-light' : 'input-field',
  props.error ? 'input-field-error' : '',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
]);

const labelClasses = computed(() =>
  props.lightMode ? 'input-label-light' : 'input-label'
);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;
  emit('update:modelValue', value);
};
</script>

<template>
  <div>
    <label v-if="props.label" :for="inputId" :class="labelClasses">
      {{ props.label }}
      <span v-if="props.required" class="text-error">*</span>
    </label>

    <input
      :id="inputId"
      :type="props.type"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :required="props.required"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :name="props.name"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :class="inputClasses"
      @input="handleInput"
    />

    <p v-if="props.error" class="input-error-message">{{ props.error }}</p>
    <p v-else-if="props.hint" class="input-hint">{{ props.hint }}</p>
  </div>
</template>
