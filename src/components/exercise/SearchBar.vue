<script setup>
import { computed } from 'vue'
import { ElOption, ElSelect } from 'element-plus'

const filters = [
  { value: 'all', label: '전체 날씨' },
  { value: 'clear', label: '맑음' },
  { value: 'clouds', label: '흐림' },
  { value: 'rain', label: '비·뇌우' },
  { value: 'snow', label: '눈' },
  { value: 'other', label: '안개·기타' },
]

const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  weatherFilter: {
    type: String,
    default: 'all',
  },
  resultCount: {
    type: Number,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update-query', 'update-weather-filter'])
const selectedWeatherLabel = computed(
  () => filters.find((option) => option.value === props.weatherFilter)?.label ?? '전체 날씨',
)
</script>

<template>
  <section id="weather-search" class="weather-search" aria-label="등록 지역 검색">
    <div class="control-row">
      <div class="control-field">
        <label class="control-label" for="city-search">등록된 도시 검색</label>
        <input
          id="city-search"
          class="search-input"
          name="city"
          type="search"
          placeholder="도시·지역·국가 검색"
          autocomplete="off"
          :value="searchQuery"
          @input="emit('update-query', $event.target.value)"
        />
      </div>

      <div class="control-field">
        <label class="control-label" for="weather-filter">날씨 조건</label>
        <ElSelect
          id="weather-filter"
          class="weather-filter-select"
          :model-value="weatherFilter"
          aria-label="날씨 조건 필터"
          @update:model-value="emit('update-weather-filter', $event)"
        >
          <ElOption
            v-for="option in filters"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </div>
    </div>

    <footer class="filter-summary">
      <div class="active-filters">
        <span class="filter-summary-label">현재 필터</span>
        <output for="city-search weather-filter">
          <span class="filter-chip">{{ searchQuery || '전체 지역' }}</span>
          <span v-if="weatherFilter !== 'all'" class="filter-chip">
            {{ selectedWeatherLabel }}
          </span>
        </output>
      </div>
      <strong class="result-count">{{ resultCount }} / {{ totalCount }}개 지역 표시</strong>
    </footer>
  </section>
</template>

<style scoped>
.weather-search {
  display: grid;
  gap: 0.75rem;
}

.control-row,
.filter-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 220px);
  align-items: center;
  gap: 1rem;
}

.control-row {
  align-items: end;
}

.control-field {
  display: grid;
  gap: 0.35rem;
}

.control-label {
  color: var(--weather-on-panel-muted);
  font-size: 12px;
  font-weight: 700;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0.6rem 1rem;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  outline: none;
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
  font-size: 15px;
  transition:
    border-color 0.16s ease,
    outline-color 0.16s ease;
}

.search-input:focus-visible {
  border-color: var(--focus-ring);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.search-input::placeholder {
  color: var(--weather-on-panel-faint);
}

.weather-filter-select {
  width: 100%;
}

.weather-filter-select :deep(.el-select__wrapper) {
  min-height: 40px;
  background: var(--weather-panel-soft);
  box-shadow: 0 0 0 1px var(--weather-panel-border) inset;
}

.weather-filter-select :deep(.el-select__selected-item) {
  color: var(--weather-on-panel);
}

.filter-summary {
  padding-top: 0.65rem;
  border-top: 1px solid var(--weather-panel-border);
  color: var(--weather-on-panel-faint);
  font-size: 12px;
}

.active-filters,
.active-filters output {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-summary-label {
  font-weight: 700;
}

.filter-chip,
.result-count {
  display: inline-flex;
  min-height: 22px;
  align-items: center;
  padding: 0.15rem 0.6rem;
  border-radius: 7px;
  background: var(--weather-panel-soft);
  color: var(--weather-accent-text);
  font-weight: 700;
  line-height: 1.2;
}

.result-count {
  flex: none;
  justify-self: end;
  border: 1px solid var(--weather-panel-border);
  color: var(--weather-on-panel);
}

@media (max-width: 767px) {
  .control-row {
    grid-template-columns: 1fr;
  }

  .filter-summary {
    grid-template-columns: 1fr;
  }

  .result-count {
    justify-self: start;
  }
}
</style>
