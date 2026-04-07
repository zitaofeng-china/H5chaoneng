<template>
  <svg
    :class="svgClass"
    aria-hidden="true"
    :width="width"
    :height="height"
    :viewBox="viewBox"
    :color="fill"
    @click="handleClick"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'SvgIcon',
})

interface Props {
  name: string
  width?: string | number
  height?: string | number
  fill?: string
  viewBox?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  viewBox: '0 0 24 24',
  className: '',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const svgClass = computed(() => {
  return `svg-icon ${props.className}`.trim()
})

const iconName = computed(() => {
  return `#icon-${props.name}`
})

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped lang="scss">
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;

  &.spin {
    animation: spin 1s linear infinite;
  }

  &.pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
