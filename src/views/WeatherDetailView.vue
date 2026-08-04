<!-- AI GENERATED CODE: 메인 설정 단위와 실제 OpenWeather JSON을 반영한 상세 Weather Report입니다. -->
<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weather.js'
import { getWeatherEmoji } from '@/utils/weatherVisuals.js'

const route = useRoute()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const isLoading = ref(false)
const loadError = ref('')

// 기존 제출 변수명 weather를 유지합니다.
const weather = computed(
  () => weatherStore.weatherList.find((item) => item.id === route.params.id) ?? null,
)
const isPrimary = computed(() => configStore.primaryLocationKey === route.params.id)
const weatherEmoji = computed(() => getWeatherEmoji(weather.value ?? {}))
const detailMetrics = computed(() => {
  if (!weather.value) return []

  return [
    { label: '습도', value: formatNumber(weather.value.humidity, '%'), icon: '◍' },
    { label: '풍속', value: formatNumber(weather.value.windSpeed, 'm/s'), icon: '↝' },
    { label: '기압', value: formatNumber(weather.value.pressure, 'hPa'), icon: '◎' },
    { label: '가시거리', value: formatVisibility(weather.value.visibility), icon: '◉' },
  ]
})

const formatNumber = (value, unit = '') =>
  value === null || value === undefined ? '정보 없음' : `${value}${unit}`
const displayTemperature = (value) => configStore.formatTemperature(value)
const formatVisibility = (value) =>
  value === null || value === undefined ? '정보 없음' : `${(value / 1000).toFixed(1)}km`
const formatPrecipitation = (value, type) =>
  value === null || value === undefined ? `${type} 없음` : `${value}mm`

const formatDateTime = (timestamp, timezoneOffset = 0) => {
  if (!timestamp) {
    return '정보 없음'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(timestamp + timezoneOffset * 1000))
}

const errorMessage = (error) => {
  const messages = {
    API_KEY_MISSING: 'OpenWeather API Key가 설정되지 않았습니다.',
    LOCAL_RATE_LIMIT: '안전 호출 한도에 도달해 마지막 저장 데이터를 표시합니다.',
    RATE_LIMITED: 'OpenWeather 호출 한도를 초과해 마지막 저장 데이터를 표시합니다.',
    LOCATION_NOT_FOUND: '등록된 도시 정보를 찾을 수 없습니다.',
    HTTP_401: 'OpenWeather API Key를 확인해 주세요.',
  }

  return messages[error?.code] ?? error?.message ?? '날씨 정보를 갱신하지 못했습니다.'
}

const loadWeather = async (id) => {
  configStore.hydrate()
  weatherStore.hydrate()
  loadError.value = ''

  if (!weather.value) {
    loadError.value = '등록된 도시 정보를 찾을 수 없습니다.'
    return
  }

  isLoading.value = true

  try {
    await weatherStore.ensureWeather(id)
  } catch (error) {
    loadError.value = errorMessage(error)
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, loadWeather, { immediate: true })
</script>

<template>
  <ElCard class="detail-view route-card" shadow="never" aria-labelledby="detail-title">
    <template v-if="weather">
      <RouterLink class="back-link top-back-link" :to="{ name: 'home' }">
        ← 등록 지역으로 돌아가기
      </RouterLink>

      <section class="weather-hero weather-surface" aria-labelledby="detail-title">
        <div class="hero-copy">
          <div class="detail-badges">
            <ElTag v-if="isPrimary" effect="dark">메인 지역</ElTag>
            <ElTag effect="plain">CURRENT WEATHER</ElTag>
          </div>
          <p class="detail-region">{{ weather.region }}</p>
          <h1 id="detail-title">{{ weather.name }}</h1>
          <p class="detail-description">{{ weather.description }}</p>
          <p class="observed-time">
            {{ formatDateTime(weather.observedAt, weather.timezoneOffset) }} 관측
          </p>
        </div>

        <div class="hero-weather">
          <span class="weather-icon" role="img" :aria-label="`${weather.status} 날씨`">
            {{ weatherEmoji }}
          </span>
          <strong>{{ displayTemperature(weather.temp) }}</strong>
          <span class="feels-like-temperature"
            >체감 {{ displayTemperature(weather.feelsLike) }}</span
          >
        </div>
      </section>

      <ElAlert
        v-if="isLoading"
        class="load-alert weather-surface"
        title="최신 날씨를 확인하고 있습니다."
        type="info"
        show-icon
        :closable="false"
      />
      <ElAlert
        v-if="loadError"
        class="load-alert weather-surface"
        :title="loadError"
        type="warning"
        show-icon
        :closable="false"
      />

      <section class="metric-section" aria-labelledby="metric-title">
        <div class="section-heading">
          <div>
            <p>CONDITIONS</p>
            <h2 id="metric-title">현재 관측 지표</h2>
          </div>
          <span>{{ weather.status }}</span>
        </div>

        <div class="metric-grid">
          <ElCard
            v-for="metric in detailMetrics"
            :key="metric.label"
            class="metric-card weather-surface"
            shadow="never"
          >
            <span class="metric-icon" aria-hidden="true">{{ metric.icon }}</span>
            <div>
              <p>{{ metric.label }}</p>
              <strong>{{ metric.value }}</strong>
            </div>
          </ElCard>
        </div>
      </section>

      <section class="observation-section" aria-labelledby="observation-title">
        <div class="section-heading">
          <div>
            <p>DETAILS</p>
            <h2 id="observation-title">상세 관측 정보</h2>
          </div>
        </div>

        <ElDescriptions class="weather-details" :column="1" border :aria-busy="isLoading">
          <ElDescriptionsItem label="현재 관측 온도 범위">
            <span class="detail-item">
              {{ displayTemperature(weather.tempMin) }} / {{ displayTemperature(weather.tempMax) }}
            </span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="풍향 / 돌풍">
            <span class="detail-item">
              {{ formatNumber(weather.windDegree, '°') }} /
              {{ formatNumber(weather.windGust, 'm/s') }}
            </span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="구름량">
            <span class="detail-item">{{ formatNumber(weather.clouds, '%') }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="최근 1시간 강수 / 적설">
            <span class="detail-item">
              {{ formatPrecipitation(weather.rainLastHour, '강수') }} /
              {{ formatPrecipitation(weather.snowLastHour, '적설') }}
            </span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="일출 / 일몰">
            <span class="detail-item">
              {{ formatDateTime(weather.sunrise, weather.timezoneOffset) }} /
              {{ formatDateTime(weather.sunset, weather.timezoneOffset) }}
            </span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="데이터 갱신">
            <span class="detail-item">
              {{ formatDateTime(weather.fetchedAt, weather.timezoneOffset) }}
            </span>
          </ElDescriptionsItem>
        </ElDescriptions>
      </section>
    </template>

    <div v-else class="empty-state weather-surface">
      <ElEmpty :image-size="120">
        <template #description>
          <h1 id="detail-title">도시 정보를 찾을 수 없습니다</h1>
          <p>등록 목록에서 삭제되었거나 주소가 올바르지 않습니다.</p>
        </template>
      </ElEmpty>
    </div>

    <RouterLink class="back-link" :to="{ name: 'home' }">
      <ElButton type="primary">메인 대시보드로 돌아가기</ElButton>
    </RouterLink>
  </ElCard>
</template>

<style scoped>
.top-back-link {
  margin-bottom: 1rem;
  color: var(--weather-accent-text);
  font-size: 13px;
  font-weight: 800;
}

.weather-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.5rem, 5vw, 3rem);
  border-radius: var(--weather-radius-hero);
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-region,
.observed-time {
  color: var(--weather-on-panel-faint);
  font-size: 12px;
  font-weight: 700;
}

.hero-copy h1,
.empty-state h1 {
  color: var(--weather-on-panel);
  font-size: clamp(2.25rem, 7vw, 4.75rem);
  font-weight: 850;
  line-height: 1;
  letter-spacing: -0.055em;
}

.detail-description {
  margin-top: 0.75rem;
  color: var(--weather-on-panel-muted);
  font-size: 18px;
}

.observed-time {
  margin-top: 0.5rem;
}

.hero-weather {
  display: grid;
  min-width: 200px;
  justify-items: center;
}

.weather-icon {
  display: grid;
  width: 100px;
  height: 100px;
  font-size: 72px;
  line-height: 1;
  place-items: center;
}

.hero-weather strong {
  color: var(--weather-on-panel);
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 850;
  line-height: 1;
  letter-spacing: -0.06em;
}

.hero-weather > .feels-like-temperature {
  margin-top: 0.5rem;
  color: var(--weather-on-panel-muted);
  font-size: 14px;
  font-weight: 700;
}

.load-alert,
.metric-section,
.observation-section {
  margin-top: 1.5rem;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-heading p {
  color: var(--weather-accent-text);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.section-heading h2 {
  margin-top: 0.2rem;
  color: var(--weather-on-panel);
  font-size: 22px;
  font-weight: 850;
}

.section-heading > span {
  color: var(--weather-on-panel-muted);
  font-size: 13px;
  font-weight: 800;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.metric-card {
  border-radius: var(--weather-radius-surface);
}

.metric-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem;
}

.metric-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
  font-size: 18px;
  place-items: center;
}

.metric-card p {
  color: var(--weather-on-panel-faint);
  font-size: 11px;
  font-weight: 700;
}

.metric-card strong {
  display: block;
  margin-top: 0.1rem;
  color: var(--weather-on-panel);
  font-size: 16px;
  font-weight: 850;
}

.weather-details {
  overflow: hidden;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-surface);
}

.weather-details :deep(.el-descriptions__label.el-descriptions__cell) {
  width: 34%;
  background: var(--weather-panel-strong);
  color: var(--weather-on-panel-muted);
  font-weight: 800;
}

.weather-details :deep(.el-descriptions__content.el-descriptions__cell) {
  background: var(--weather-panel);
  color: var(--weather-on-panel);
}

.weather-details :deep(.el-descriptions__cell) {
  padding: 1rem 1.25rem;
  border-color: var(--weather-panel-border) !important;
}

.detail-item {
  font-weight: 750;
}

.empty-state {
  padding: 3rem 1rem;
  border-radius: var(--weather-radius-hero);
  text-align: center;
}

.empty-state :deep(.el-empty__description p) {
  color: var(--weather-on-panel-muted);
}

.back-link {
  display: inline-flex;
  margin-top: 1.5rem;
  text-decoration: none;
}

@media (max-width: 1119px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .weather-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-weather {
    grid-template-columns: auto 1fr;
    align-items: center;
    justify-items: start;
  }

  .hero-weather > .feels-like-temperature {
    grid-column: 2;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .weather-details :deep(.el-descriptions__label.el-descriptions__cell) {
    width: 42%;
  }
}
</style>
