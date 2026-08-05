<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useConfigStore } from '@/stores/config.js'
import { getVisual } from '@/utils/weatherVisuals.js'

const props = defineProps({
  forecast: {
    type: Object,
    default: null,
  },
  loading: Boolean,
  error: {
    type: String,
    default: '',
  },
  compact: Boolean,
  detailId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['retry'])
const configStore = useConfigStore()

const hours = computed(() => {
  const items = props.forecast?.hourly ?? []
  const selected = props.compact ? items.filter((_, index) => index % 4 === 0).slice(0, 6) : items
  return selected.map((hour) => ({ ...hour, visual: getVisual(hour) }))
})

const days = computed(() => {
  const items = props.compact ? props.forecast?.daily?.slice(0, 5) : props.forecast?.daily
  return (items ?? []).map((day) => ({ ...day, visual: getVisual(day) }))
})

const hourLabel = (time) => time?.split('T')[1]?.slice(0, 5) ?? '--:--'

const dayLabel = (date, index) => {
  if (index === 0) return '오늘'
  if (index === 1) return '내일'

  return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(new Date(`${date}T00:00:00`))
}

const dateLabel = (date) => {
  if (!date) return ''
  const [, month, day] = date.split('-')
  return `${Number(month)}.${Number(day)}`
}

const percent = (value) => (value === null || value === undefined ? '-' : `${value}%`)
</script>

<template>
  <section class="forecast-panel weather-surface" :class="{ 'is-compact': compact }">
    <header class="forecast-heading">
      <div>
        <p>OPEN-METEO FORECAST</p>
        <h2>{{ compact ? '대표 지역 예보' : '시간별 · 주간 예보' }}</h2>
      </div>
      <div class="forecast-heading-actions">
        <span v-if="forecast?.timezoneName">{{ forecast.timezoneName }}</span>
        <RouterLink v-if="compact && detailId" :to="{ name: 'detail', params: { id: detailId } }">
          전체 예보 보기 →
        </RouterLink>
      </div>
    </header>

    <ElSkeleton v-if="loading && !forecast" class="forecast-loading" :rows="3" animated />

    <button
      v-else-if="error && !forecast"
      class="forecast-error"
      type="button"
      :title="error"
      @click="emit('retry')"
    >
      예보를 불러오지 못했습니다 · 클릭해서 다시 불러오기
    </button>

    <template v-else-if="forecast">
      <section class="forecast-section" aria-labelledby="hourly-title">
        <div class="forecast-title-row">
          <h3 id="hourly-title">앞으로 24시간</h3>
          <span v-if="compact">4시간 간격</span>
        </div>

        <div class="hourly-list" tabindex="0" aria-label="시간별 날씨 예보">
          <article v-for="hour in hours" :key="hour.time" class="hour-card">
            <time :datetime="hour.time">{{ hourLabel(hour.time) }}</time>
            <span class="forecast-icon" role="img" :aria-label="hour.status">
              {{ hour.visual.emoji }}
            </span>
            <strong>{{ configStore.formatTemp(hour.temp) }}</strong>
            <span class="forecast-status">{{ hour.status }}</span>
            <span class="rain-chance">☂ {{ percent(hour.rainChance) }}</span>
            <dl v-if="!compact" class="hour-details">
              <div>
                <dt>체감</dt>
                <dd>{{ configStore.formatTemp(hour.feelsLike) }}</dd>
              </div>
              <div>
                <dt>습도</dt>
                <dd>{{ percent(hour.humidity) }}</dd>
              </div>
              <div>
                <dt>바람</dt>
                <dd>{{ hour.windSpeed ?? '-' }}m/s</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section class="forecast-section weekly-section" aria-labelledby="weekly-title">
        <div class="forecast-title-row">
          <h3 id="weekly-title">주간 전망</h3>
          <span>최저 / 최고</span>
        </div>

        <div class="daily-list">
          <article v-for="(day, index) in days" :key="day.date" class="day-card">
            <div class="day-date">
              <strong>{{ dayLabel(day.date, index) }}</strong>
              <time :datetime="day.date">{{ dateLabel(day.date) }}</time>
            </div>
            <span class="forecast-icon" role="img" :aria-label="day.status">
              {{ day.visual.emoji }}
            </span>
            <span class="forecast-status">{{ day.status }}</span>
            <span class="daily-temp">
              <b>{{ configStore.formatTemp(day.min) }}</b>
              <strong>{{ configStore.formatTemp(day.max) }}</strong>
            </span>
            <span class="rain-chance">☂ {{ percent(day.rainChance) }}</span>
          </article>
        </div>
      </section>

      <footer class="forecast-source">
        <span v-if="loading">예보 갱신 중…</span>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Data by Open-Meteo</a>
      </footer>
    </template>
  </section>
</template>

<style scoped>
.forecast-panel {
  padding: clamp(1rem, 2vw, 1.35rem);
  border-radius: var(--weather-radius-surface);
}

.forecast-heading,
.forecast-title-row,
.forecast-heading-actions,
.forecast-source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.forecast-heading > div:first-child > p {
  color: var(--weather-accent-text);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.forecast-heading h2 {
  margin-top: 0.15rem;
  color: var(--weather-on-panel);
  font-size: clamp(20px, 2vw, 24px);
  font-weight: 850;
}

.forecast-heading-actions {
  color: var(--weather-on-panel-faint);
  font-size: 12px;
  font-weight: 700;
}

.forecast-heading-actions a,
.forecast-source a {
  color: var(--weather-accent-text);
  text-decoration: none;
}

.forecast-loading,
.forecast-error,
.forecast-section {
  margin-top: 1rem;
}

.forecast-loading :deep(.el-skeleton__item) {
  background: var(--weather-panel-soft);
}

.forecast-error {
  width: 100%;
  padding: 0.7rem 0;
  border: 0;
  background: transparent;
  color: var(--weather-on-panel-faint);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: color 160ms ease;
}

.forecast-error:hover {
  color: var(--weather-on-panel);
}

.forecast-error:focus-visible {
  border-radius: var(--weather-radius-control);
  outline: 2px solid var(--weather-accent-text);
  outline-offset: 4px;
}

.forecast-title-row h3 {
  color: var(--weather-on-panel);
  font-size: 14px;
  font-weight: 850;
}

.forecast-title-row span {
  color: var(--weather-on-panel-faint);
  font-size: 11px;
}

.hourly-list {
  display: grid;
  grid-auto-columns: minmax(112px, 1fr);
  grid-auto-flow: column;
  gap: 0.6rem;
  margin-top: 0.65rem;
  padding-bottom: 0.3rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.hour-card,
.day-card {
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
}

.hour-card {
  display: grid;
  min-height: 176px;
  justify-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.6rem;
  color: var(--weather-on-panel);
  text-align: center;
}

.hour-card time,
.day-date time,
.forecast-status,
.rain-chance {
  color: var(--weather-on-panel-faint);
  font-size: 11px;
}

.forecast-icon {
  font-size: 28px;
  line-height: 1;
}

.hour-card > strong {
  font-size: 18px;
  font-weight: 850;
}

.forecast-status {
  min-height: 30px;
  line-height: 1.35;
}

.rain-chance {
  color: #bfe4ff;
  font-weight: 800;
}

.hour-details {
  display: grid;
  width: 100%;
  gap: 0.25rem;
  margin-top: 0.35rem;
  padding-top: 0.45rem;
  border-top: 1px solid var(--weather-panel-border);
}

.hour-details div {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 10px;
}

.hour-details dt {
  color: var(--weather-on-panel-faint);
}

.hour-details dd {
  color: var(--weather-on-panel);
  font-weight: 750;
}

.weekly-section {
  padding-top: 1rem;
  border-top: 1px solid var(--weather-panel-border);
}

.daily-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.65rem;
}

.day-card {
  display: grid;
  grid-template-columns: minmax(80px, 0.8fr) 40px minmax(110px, 1.4fr) minmax(130px, 1fr) 72px;
  align-items: center;
  gap: 0.75rem;
  min-height: 58px;
  padding: 0.55rem 0.75rem;
  color: var(--weather-on-panel);
}

.day-date {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.day-date strong {
  font-size: 13px;
}

.daily-temp {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  font-size: 13px;
}

.daily-temp b {
  color: #bfe4ff;
}

.daily-temp strong {
  color: #ffd0ae;
}

.forecast-source {
  min-height: 20px;
  margin-top: 0.85rem;
  color: var(--weather-on-panel-faint);
  font-size: 10px;
}

.forecast-source a {
  margin-left: auto;
}

.is-compact .hour-card {
  min-height: 150px;
}

.is-compact .hourly-list {
  grid-auto-columns: minmax(100px, 1fr);
}

.is-compact .daily-list {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.is-compact .day-card {
  grid-template-columns: 1fr;
  justify-items: center;
  gap: 0.35rem;
  min-height: 132px;
  text-align: center;
}

.is-compact .day-card > .forecast-status {
  display: none;
}

.is-compact .daily-temp {
  justify-content: center;
}

@media (max-width: 767px) {
  .forecast-heading {
    align-items: flex-start;
  }

  .forecast-heading-actions {
    align-items: flex-end;
    flex-direction: column;
    gap: 0.35rem;
  }

  .day-card {
    grid-template-columns: minmax(72px, 1fr) 34px minmax(86px, 1fr) auto;
    gap: 0.45rem;
  }

  .day-card > .forecast-status {
    display: none;
  }

  .daily-temp {
    gap: 0.4rem;
  }

  .day-card > .rain-chance {
    grid-column: 3 / -1;
    justify-self: end;
  }

  .is-compact .daily-list {
    grid-auto-columns: minmax(100px, 1fr);
    grid-auto-flow: column;
    grid-template-columns: none;
    padding-bottom: 0.3rem;
    overflow-x: auto;
  }

  .is-compact .day-card {
    grid-template-columns: 1fr;
  }

  .is-compact .day-card > .rain-chance {
    grid-column: auto;
    justify-self: center;
  }
}
</style>
