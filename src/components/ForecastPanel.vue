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

const currentHour = (timezone) => {
  if (!timezone) return ''

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(new Date())
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {})

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:00`
}

const hours = computed(() => {
  const items = props.forecast?.hourly ?? []
  const now = currentHour(props.forecast?.timezone)
  const future = now ? items.filter((hour) => hour.time > now) : items.slice(1)

  return future.slice(0, 12).map((hour) => ({ ...hour, visual: getVisual(hour) }))
})

const chart = computed(() => {
  const width = 960
  const top = 24
  const bottom = 112
  const values = hours.value.map((hour) => hour.temp).filter(Number.isFinite)

  if (!values.length) return { dots: [], line: '', area: '' }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  const dots = hours.value.map((hour, index) => {
    const value = Number.isFinite(hour.temp) ? hour.temp : min
    return {
      x: width * ((index + 0.5) / hours.value.length),
      y: top + ((max - value) / range) * (bottom - top),
    }
  })
  const line = dots.map(({ x, y }) => `${x},${y}`).join(' ')

  return {
    dots,
    line,
    area: `${dots[0].x},${bottom} ${line} ${dots.at(-1).x},${bottom}`,
  }
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
      <section class="forecast-section hourly-section" aria-labelledby="hourly-title">
        <div class="forecast-title-row">
          <h3 id="hourly-title">앞으로 12시간</h3>
          <span class="forecast-range-meta">현재 시각 이후 · 1시간 간격</span>
          <span class="mobile-scroll-cue" aria-hidden="true">좌우로 보기 →</span>
        </div>

        <div v-if="hours.length" class="forecast-scroll-shell hourly-scroll-shell">
          <div
            class="hourly-chart-scroll"
            tabindex="0"
            aria-label="현재 시각 이후 12시간의 기온과 날씨 예보. 좌우로 스크롤할 수 있습니다."
          >
            <div class="hourly-chart" :style="{ '--hour-count': hours.length }">
              <svg
                class="temperature-graph"
                viewBox="0 0 960 128"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="forecast-temperature-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--weather-accent-text)" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="var(--weather-accent-text)" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <line v-for="y in [24, 68, 112]" :key="y" x1="0" :y1="y" x2="960" :y2="y" />
                <polygon :points="chart.area" fill="url(#forecast-temperature-area)" />
                <polyline :points="chart.line" />
                <g
                  v-for="(dot, index) in chart.dots"
                  :key="hours[index].time"
                  class="temperature-point"
                  :class="{ 'is-next': index === 0 }"
                >
                  <circle :cx="dot.x" :cy="dot.y" :r="index === 0 ? 5 : 3.5" />
                </g>
              </svg>

              <div class="chart-hours">
                <div
                  v-for="(hour, index) in hours"
                  :key="hour.time"
                  class="chart-hour"
                  :class="{ 'is-next': index === 0 }"
                  :aria-label="`${hourLabel(hour.time)}, ${configStore.formatTemp(hour.temp)}, ${hour.status}, 강수확률 ${percent(hour.rainChance)}`"
                >
                  <time :datetime="hour.time">
                    {{ index === 0 ? `다음 · ${hourLabel(hour.time)}` : hourLabel(hour.time) }}
                  </time>
                  <span class="forecast-icon" role="img" :aria-label="hour.status">
                    {{ hour.visual.emoji }}
                  </span>
                  <strong class="chart-temp">{{ configStore.formatTemp(hour.temp) }}</strong>
                  <span class="rain-chance">☂ {{ percent(hour.rainChance) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="forecast-empty">다음 시간 예보를 준비하고 있습니다.</p>
      </section>

      <section class="forecast-section weekly-section" aria-labelledby="weekly-title">
        <div class="forecast-title-row">
          <h3 id="weekly-title">주간 전망</h3>
          <span class="forecast-range-meta">최저 / 최고</span>
          <span class="mobile-scroll-cue" aria-hidden="true">좌우로 보기 →</span>
        </div>

        <div class="forecast-scroll-shell daily-scroll-shell">
          <div
            class="daily-list"
            tabindex="0"
            :aria-label="`${compact ? 5 : 7}일간 주간 전망. 좌우로 스크롤할 수 있습니다.`"
          >
            <article
              v-for="(day, index) in days"
              :key="day.date"
              class="day-card"
              :class="{ 'is-today': index === 0 }"
            >
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
        </div>
      </section>

      <footer class="forecast-source" aria-live="polite">
        <button
          v-if="error"
          class="forecast-retry"
          type="button"
          :title="error"
          @click="emit('retry')"
        >
          갱신 실패 · 다시 시도
        </button>
        <span v-else-if="loading">예보 갱신 중…</span>
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

.mobile-scroll-cue {
  display: none;
}

.forecast-scroll-shell {
  position: relative;
  min-width: 0;
}

.hourly-chart-scroll:focus-visible,
.daily-list:focus-visible {
  border-radius: var(--weather-radius-control);
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}

.hourly-chart-scroll {
  margin-top: 0.65rem;
  padding-bottom: 0.3rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.hourly-chart {
  min-width: 960px;
}

.temperature-graph {
  display: block;
  width: 100%;
  height: 128px;
  overflow: visible;
}

.temperature-graph line {
  stroke: var(--weather-panel-border);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.temperature-graph polyline {
  fill: none;
  stroke: var(--weather-accent-text);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
}

.temperature-point circle {
  fill: var(--weather-panel-opaque);
  stroke: var(--weather-accent-text);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.temperature-point.is-next circle {
  fill: var(--weather-accent-text);
}

.chart-hours {
  display: grid;
  grid-template-columns: repeat(var(--hour-count), minmax(0, 1fr));
  margin-top: 0.35rem;
}

.chart-hour {
  display: grid;
  min-width: 0;
  justify-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.2rem;
  border-radius: var(--weather-radius-control);
  text-align: center;
}

.chart-hour.is-next,
.day-card.is-today {
  background: color-mix(in srgb, var(--accent) 28%, var(--weather-panel-soft));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--weather-accent-text) 54%, transparent);
}

.chart-hour time {
  color: var(--weather-on-panel-faint);
  font-size: 10px;
  white-space: nowrap;
}

.chart-hour.is-next time,
.day-card.is-today .day-date strong {
  color: var(--weather-accent-text);
  font-weight: 850;
}

.chart-hour .forecast-icon {
  font-size: 22px;
}

.chart-temp {
  color: var(--weather-on-panel);
  font-size: 13px;
  font-weight: 850;
}

.forecast-empty {
  margin-top: 0.65rem;
  padding: 1rem 0;
  color: var(--weather-on-panel-faint);
  font-size: 12px;
}

.day-card {
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
}

.day-card.is-today {
  border-color: color-mix(in srgb, var(--weather-accent-text) 72%, transparent);
}

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

.forecast-status {
  min-height: 30px;
  line-height: 1.35;
}

.rain-chance {
  color: #bfe4ff;
  font-weight: 800;
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

.forecast-retry {
  padding: 0;
  border: 0;
  background: transparent;
  color: #ffd0ae;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.forecast-retry:hover {
  color: var(--weather-on-panel);
}

.forecast-retry:focus-visible {
  border-radius: 4px;
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
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

  .hourly-section .forecast-range-meta,
  .weekly-section .forecast-range-meta {
    display: none;
  }

  .mobile-scroll-cue {
    display: inline;
    color: var(--weather-accent-text);
    font-weight: 800;
  }

  .hourly-scroll-shell::after,
  .daily-scroll-shell::after {
    position: absolute;
    z-index: 2;
    top: 0;
    right: 0;
    bottom: 0.3rem;
    width: 30px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--weather-panel-opaque) 88%, transparent)
    );
    content: '';
    pointer-events: none;
  }

  .hourly-chart-scroll,
  .daily-list {
    padding-right: 1.5rem;
    overscroll-behavior-inline: contain;
    scroll-snap-type: x proximity;
  }

  .chart-hour,
  .day-card {
    scroll-snap-align: start;
  }

  .daily-list {
    grid-auto-columns: minmax(128px, 1fr);
    grid-auto-flow: column;
    grid-template-columns: none;
    padding-bottom: 0.3rem;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .is-compact .daily-list {
    grid-auto-columns: minmax(100px, 1fr);
  }

  .day-card {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.35rem;
    min-height: 132px;
    text-align: center;
  }

  .day-card > .forecast-status {
    display: none;
  }

  .daily-temp {
    justify-content: center;
    gap: 0.4rem;
  }

  .day-card > .rain-chance {
    grid-column: auto;
    justify-self: center;
  }
}
</style>
