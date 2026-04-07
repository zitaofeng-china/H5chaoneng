# SVG Icon Component

## Usage

```vue
<template>
  <!-- Basic usage -->
  <SvgIcon name="demo" />
  
  <!-- With custom size -->
  <SvgIcon name="demo" width="24" height="24" />
  
  <!-- With custom color -->
  <SvgIcon name="demo" fill="#ff6b6b" />
  
  <!-- With animation -->
  <SvgIcon name="demo" class="spin" />
  
  <!-- With click handler -->
  <SvgIcon name="demo" @click="handleIconClick" />
</template>

<script setup lang="ts">
import SvgIcon from '@/components/svgIcon/index.vue'

const handleIconClick = (event: MouseEvent) => {
  console.log('Icon clicked', event)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | - | Icon name (without 'icon-' prefix) |
| width | string \| number | '1em' | Icon width |
| height | string \| number | '1em' | Icon height |
| fill | string | 'currentColor' | Icon fill color |
| viewBox | string | '0 0 24 24' | SVG viewBox |
| className | string | '' | Additional CSS classes |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| click | MouseEvent | Emitted when icon is clicked |

## CSS Classes

- `.spin` - Rotating animation
- `.pulse` - Pulsing animation

## Setup

1. Add SVG files to `src/assets/icons/`
2. Icons are automatically loaded by vite-plugin-svg-icons
3. Use icon name without extension in the `name` prop

Example: For `src/assets/icons/demo.svg`, use `<SvgIcon name="demo" />`
