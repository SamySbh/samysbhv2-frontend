<script setup lang="ts">
interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info';
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false,
});

const emit = defineEmits<{
  (e: 'dismiss'): void;
}>();

const variantClasses: Record<string, string> = {
  success: 'alert alert-success',
  warning: 'alert alert-warning',
  error: 'alert alert-error',
  info: 'alert alert-info',
};
</script>

<template>
  <div :class="[variantClasses[props.variant], 'flex items-center justify-between']">
    <div class="flex-1">
      <slot />
    </div>
    <button
      v-if="props.dismissible"
      type="button"
      class="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
      @click="emit('dismiss')"
    >
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
