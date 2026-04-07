<template>
  <div class="activation-list">
    <ActivationCard
      v-for="(item, idx) in internalItems"
      :key="item.id"
      :item="item"
      :onDelete="() => onDelete(idx)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ActivationCard from './AddressCard.vue'

type Item = { id: string; history: number; today: number }
const props = defineProps<{ items?: Item[] }>()
const emit = defineEmits<{ 'update:items': [items: Item[]] }>()

const internalItems = ref<Item[]>(
  props.items ?? [
    { id: 'TVJ2sPDXDw2W6iS6m18BVwyZxnViAxbax', history: 0, today: 0 },
    { id: 'TVJ2sPDXDw2W6iS6m18BVwyZxnViAxbax', history: 0, today: 0 },
  ],
)

function onDelete(index: number) {
  internalItems.value.splice(index, 1)
  emit('update:items', [...internalItems.value])
}
</script>

<style scoped lang="scss">
.activation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
