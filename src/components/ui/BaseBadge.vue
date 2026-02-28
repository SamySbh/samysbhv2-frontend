<script setup lang="ts">
interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'emphasis';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
});

const variantClasses: Record<string, string> = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  error: 'badge badge-error',
  info: 'badge badge-info',
  emphasis: 'badge badge-emphasis',
};
</script>

<template>
  <span :class="variantClasses[props.variant]">
    <slot />
  </span>
</template>
