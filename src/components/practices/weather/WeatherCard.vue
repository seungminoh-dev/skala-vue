<script setup>
defineProps({
  city: {
    type: Object,
    default: () => ({ id: 'city_unknown', name: 'Unknown', temp: 0, status: 'Unknown' }),
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const selectCard = (city) => {
  emit('select-card', city)
}
const clickDetail = (city) => {
  emit('click-detail', city)
}
</script>

<template>
  <li
    class="weather-location-card"
    :class="{ 'is-selected': isSelected }"
    @click="selectCard(city)"
  >
    <button class="weather-select-button" type="button" :aria-pressed="isSelected">
      <span class="city-name">{{ city.name }} ({{ city.status }})</span>
      <span class="current-temp">현재 기온: {{ city.temp }}°C</span>
      <span v-if="city.temp >= 25" class="temperature-badge is-hot"> 🔥 더움 (25도 이상) </span>
      <span v-else class="temperature-badge is-cool">❄️ 선선함 (25도 미만)</span>
    </button>
    <button class="detail-button" type="button" @click.stop="clickDetail(city)">상세 보기</button>
  </li>
</template>

<style scoped>
.weather-location-card {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.weather-location-card.is-selected {
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgb(66 184 131 / 16%);
}

.weather-select-button {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 1rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.weather-select-button:focus-visible,
.detail-button:focus-visible {
  outline: 3px solid rgb(66 184 131 / 40%);
  outline-offset: -3px;
}

.city-name {
  color: var(--color-heading);
  font-size: 1.05rem;
  font-weight: 700;
}

.current-temp {
  font-size: 0.95rem;
}

.temperature-badge {
  display: inline-flex;
  margin-top: 0.2rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}

.temperature-badge.is-hot {
  background: #ff6b6b;
}

.temperature-badge.is-cool {
  background: #339af0;
}

.detail-button {
  align-self: center;
  margin-right: 1rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border-hover);
  border-radius: 7px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

@media (max-width: 600px) {
  .weather-location-card {
    flex-direction: column;
  }

  .detail-button {
    align-self: stretch;
    margin: 0 1rem 1rem;
  }
}
</style>
