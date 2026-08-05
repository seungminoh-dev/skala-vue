<script setup>
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()

const units = [
  { value: 'celsius', label: '°C', accessibleLabel: '섭씨' },
  { value: 'fahrenheit', label: '°F', accessibleLabel: '화씨' },
]
</script>

<template>
  <div class="unit-toggler" role="group" aria-label="날씨 온도 단위">
    <button
      v-for="unit in units"
      :key="unit.value"
      class="unit-button"
      type="button"
      :class="{ 'is-active': configStore.unit === unit.value }"
      :aria-label="`${unit.accessibleLabel}로 표시`"
      :aria-pressed="configStore.unit === unit.value"
      @click="configStore.setUnit(unit.value)"
    >
      {{ unit.label }}
    </button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 3px;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
}

.unit-button {
  min-width: 42px;
  min-height: 34px;
  padding: 0 0.625rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--weather-on-panel-muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.unit-button.is-active {
  background: rgb(255 255 255 / 92%);
  color: #17324c;
  box-shadow: var(--shadow-control);
}

.unit-button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
