<script setup lang="ts">
import { computed, ref } from 'vue';

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

const showPassword = ref(false);

const inputId = computed(() => props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`);

const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) return 'text';
  return props.type;
});

const inputClasses = computed(() => [
  props.lightMode ? 'input-field-light' : 'input-field',
  props.error ? 'input-field-error' : '',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
  props.type === 'password' ? 'pr-10' : '',
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

    <div :class="props.type === 'password' ? 'relative' : ''">
      <input
        :id="inputId"
        :type="inputType"
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
      <button
        v-if="props.type === 'password'"
        type="button"
        tabindex="-1"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        @click="showPassword = !showPassword"
      >
        <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
      </button>
    </div>

    <p v-if="props.error" class="input-error-message">{{ props.error }}</p>
    <p v-else-if="props.hint" class="input-hint">{{ props.hint }}</p>
  </div>
</template>
