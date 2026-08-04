<!-- AI GENERATED CODE: Essential 반응성을 보존한 몰입형 Weather Canvas와 등록 지역 Grid입니다. -->
<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import CityRegistrationModal from '@/components/exercise/CityRegistrationModal.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useConfigStore } from '@/stores/config.js'
import { useWeatherStore } from '@/stores/weather.js'
import { getWeatherEmoji } from '@/utils/weatherVisuals.js'

// Essential DAY2: 기존 반응형 변수명을 유지합니다.
const searchQuery = ref('')
const selectedCityInfo = ref(null)
const isRefreshing = ref(false)
const refreshError = ref('')
const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const { weatherList } = storeToRefs(weatherStore)
const router = useRouter()

// Essential DAY2: 검색어가 비어 있으면 전체 배열, 입력 시 일치 도시만 반환합니다.
const filteredWeatherList = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLocaleLowerCase()

  return [...weatherList.value]
    .filter((weather) => weather.name.toLocaleLowerCase().includes(normalizedQuery))
    .sort((left, right) => {
      if (left.id === configStore.primaryLocationKey) return -1
      if (right.id === configStore.primaryLocationKey) return 1
      return left.addedAt - right.addedAt
    })
})
const primaryWeather = computed(
  () =>
    weatherList.value.find((item) => item.id === configStore.primaryLocationKey) ??
    weatherList.value[0] ??
    null,
)
const displayPrimaryTemp = computed(() => configStore.formatTemperature(primaryWeather.value?.temp))
const displayPrimaryFeelsLike = computed(() =>
  configStore.formatTemperature(primaryWeather.value?.feelsLike),
)
const primaryWeatherEmoji = computed(() => getWeatherEmoji(primaryWeather.value ?? {}))
const hasDistinctPrimaryDescription = computed(() => {
  const status = primaryWeather.value?.status?.trim() ?? ''
  const description = primaryWeather.value?.description?.trim() ?? ''

  return Boolean(description && description !== status)
})
const primaryTemperatureSummary = computed(() => {
  if (!primaryWeather.value) return ''

  const { temp, tempMin, tempMax } = primaryWeather.value
  const rangeLabel =
    tempMin !== null && tempMin !== undefined && tempMin === tempMax
      ? `현재 ${configStore.formatTemperature(temp)}`
      : `관측 범위 ${configStore.formatTemperature(tempMin)} / ${configStore.formatTemperature(tempMax)}`

  return `${rangeLabel} · 체감 ${displayPrimaryFeelsLike.value}`
})

const emptyDescription = computed(() =>
  weatherList.value.length === 0
    ? '도시 추가 또는 내 위치 버튼으로 첫 지역을 등록해 보세요.'
    : '검색한 도시와 일치하는 도시가 없습니다.',
)
const dashboardSummary = computed(() => {
  if (weatherList.value.length === 0) {
    return '관심 지역을 등록하면 현재 날씨를 한눈에 비교할 수 있습니다.'
  }

  return `${weatherList.value.length}개 지역의 마지막 정상 날씨를 표시하고 있습니다.`
})

const formatNumber = (value, unit) =>
  value === null || value === undefined ? '정보 없음' : `${value}${unit}`
const formatVisibility = (value) =>
  value === null || value === undefined ? '정보 없음' : `${(value / 1000).toFixed(1)}km`
const formatTime = (timestamp, timezoneOffset = 0) => {
  if (!timestamp) return '정보 없음'

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(timestamp + timezoneOffset * 1000))
}
const errorMessage = (error) => {
  const messages = {
    API_KEY_MISSING: 'OpenWeather API Key가 설정되지 않아 날씨를 갱신할 수 없습니다.',
    LOCAL_RATE_LIMIT: '안전 호출 한도에 도달해 마지막 저장 데이터를 표시합니다.',
    RATE_LIMITED: 'OpenWeather 호출 한도를 초과해 마지막 저장 데이터를 표시합니다.',
    HTTP_401: 'OpenWeather API Key를 확인해 주세요.',
  }

  return messages[error?.code] ?? error?.message ?? '날씨를 갱신하지 못했습니다.'
}

// Essential DAY1: 자식 Component가 발생시킨 이벤트를 부모 View에서 처리합니다.
const updateSearchQuery = (content) => {
  searchQuery.value = content
}
const selectCity = (city) => {
  selectedCityInfo.value = city
}
const selectRegisteredCity = (city) => {
  const registeredCity = weatherList.value.find((item) => item.id === city.key) ?? city
  selectedCityInfo.value = registeredCity

  if (!configStore.primaryLocationKey) {
    configStore.setPrimaryLocation(registeredCity.id ?? registeredCity.key)
  }
}
const showDetail = (city) => {
  router.push({ name: 'detail', params: { id: city.slug ?? city.id } })
}
const removeCity = (city) => {
  weatherStore.removeLocation(city.id)

  if (selectedCityInfo.value?.id === city.id) {
    selectedCityInfo.value = null
  }

  if (configStore.primaryLocationKey === city.id) {
    configStore.setPrimaryLocation(weatherList.value[0]?.id ?? null)
  }
}

onMounted(async () => {
  configStore.hydrate()
  weatherStore.hydrate()
  selectedCityInfo.value =
    weatherList.value.find((item) => item.id === configStore.primaryLocationKey) ?? null

  if (weatherList.value.length === 0) return

  isRefreshing.value = true
  const results = await weatherStore.refreshStaleLocations()
  const failedResult = results.find((result) => result.status === 'rejected')
  refreshError.value = failedResult ? errorMessage(failedResult.error) : ''
  isRefreshing.value = false
})

// Essential DAY2: 선택 도시와 검색어 변경을 각각 watch와 watchEffect로 감시합니다.
watch(selectedCityInfo, (newCity, oldCity) => {
  if (!newCity) return

  console.log(
    `[Watch감지] 상태바 업데이트 : ${newCity.name}이 선택되었습니다. | ${oldCity?.name ?? '미선택'}->${newCity.name}`,
  )
})
watchEffect(() => {
  console.log(
    `[WatchEffect] 검색어 변경이 감지되었습니다. ${searchQuery.value}에 해당하는 Filter Updated`,
  )
})
</script>

<template>
  <ElCard class="weather-container route-card" shadow="never" aria-labelledby="weather-title">
    <section class="current-weather-hero" aria-labelledby="weather-title">
      <template v-if="primaryWeather">
        <div class="hero-location">
          <span class="location-pin" aria-hidden="true">⌖</span>
          <div>
            <p>메인 지역</p>
            <strong>{{ primaryWeather.name }}</strong>
            <span>{{ primaryWeather.region }}</span>
          </div>
        </div>

        <div class="hero-weather-main">
          <div class="hero-copy">
            <div class="temperature-line">
              <strong class="hero-temperature">{{ displayPrimaryTemp }}</strong>
              <span
                class="hero-weather-icon"
                role="img"
                :aria-label="`${primaryWeather.status} 날씨`"
              >
                {{ primaryWeatherEmoji }}
              </span>
            </div>
            <h1 id="weather-title">{{ primaryWeather.status }}</h1>
            <p v-if="hasDistinctPrimaryDescription" class="hero-description">
              {{ primaryWeather.description }}
            </p>
            <p class="temperature-meta">{{ primaryTemperatureSummary }}</p>
          </div>
        </div>

        <dl class="hero-metrics weather-surface">
          <div>
            <dt><span aria-hidden="true">◍</span> 습도</dt>
            <dd>{{ formatNumber(primaryWeather.humidity, '%') }}</dd>
          </div>
          <div>
            <dt><span aria-hidden="true">↝</span> 풍속</dt>
            <dd>{{ formatNumber(primaryWeather.windSpeed, 'm/s') }}</dd>
          </div>
          <div>
            <dt><span aria-hidden="true">◉</span> 가시거리</dt>
            <dd>{{ formatVisibility(primaryWeather.visibility) }}</dd>
          </div>
          <div>
            <dt><span aria-hidden="true">◒</span> 일몰</dt>
            <dd>{{ formatTime(primaryWeather.sunset, primaryWeather.timezoneOffset) }}</dd>
          </div>
        </dl>
      </template>

      <template v-else>
        <div class="empty-hero">
          <p>WEATHER CANVAS</p>
          <h1 id="weather-title">내 지역의 날씨를<br />가장 먼저 만나보세요</h1>
          <span>{{ dashboardSummary }}</span>
        </div>
      </template>
    </section>

    <ElSpace class="dashboard-content" direction="vertical" :size="24" fill>
      <BaseDashboardCard class="control-panel">
        <div class="control-layout">
          <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />
          <CityRegistrationModal @city-registered="selectRegisteredCity" />
        </div>
      </BaseDashboardCard>

      <ElAlert
        v-if="refreshError"
        class="weather-surface"
        :title="refreshError"
        type="warning"
        show-icon
        :closable="false"
      />

      <output class="weather-status" aria-live="polite">
        <ElAlert
          class="weather-surface"
          :title="
            isRefreshing
              ? '저장된 도시의 날씨를 갱신하고 있습니다.'
              : selectedCityInfo
                ? `${selectedCityInfo.name}이 선택되었습니다.`
                : weatherList.length
                  ? '날씨 카드를 선택하거나 상세 정보를 확인해 보세요.'
                  : '도시를 등록하면 현재 날씨가 여기에 표시됩니다.'
          "
          :type="isRefreshing ? 'info' : 'success'"
          show-icon
          :closable="false"
        />
      </output>

      <BaseDashboardCard class="list-panel">
        <section aria-labelledby="weather-list-title">
          <div class="section-heading">
            <div>
              <p class="section-kicker">MY LOCATIONS</p>
              <h2 id="weather-list-title" class="weather-card-title">등록 지역</h2>
              <p>{{ dashboardSummary }}</p>
            </div>
            <span class="result-count">{{ filteredWeatherList.length }}개 표시</span>
          </div>

          <ElEmpty
            v-if="filteredWeatherList.length === 0"
            class="weather-surface"
            :description="emptyDescription"
            :image-size="96"
          />
          <div v-else class="weather-list">
            <WeatherCard
              v-for="item in filteredWeatherList"
              :key="item.id"
              :city="item"
              :is-selected="selectedCityInfo?.id === item.id"
              :is-primary="configStore.primaryLocationKey === item.id"
              @select-card="selectCity"
              @click-detail="showDetail"
              @remove-city="removeCity"
            />
          </div>
        </section>
      </BaseDashboardCard>
    </ElSpace>
  </ElCard>
</template>

<style scoped>
.current-weather-hero {
  display: flex;
  min-height: 0;
  flex-direction: column;
  justify-content: flex-start;
  padding: clamp(1rem, 3vw, 2rem) 0 clamp(2rem, 4vw, 3rem);
  color: var(--weather-on-panel);
  text-shadow: 0 2px 18px rgb(4 17 29 / 30%);
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.location-pin {
  font-size: 30px;
}

.hero-location div {
  display: grid;
}

.hero-location p,
.hero-location span,
.temperature-meta,
.hero-description {
  color: var(--weather-on-panel-muted);
}

.hero-location p {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.hero-location strong {
  font-size: 26px;
  font-weight: 850;
}

.hero-location span {
  font-size: 12px;
}

.hero-weather-main {
  margin-top: clamp(2.5rem, 6vh, 4rem);
}

.hero-copy {
  max-width: 700px;
}

.temperature-line {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hero-temperature {
  font-size: clamp(5.5rem, 14vw, 10rem);
  font-weight: 300;
  line-height: 0.86;
  letter-spacing: -0.085em;
}

.hero-weather-icon {
  display: grid;
  width: clamp(84px, 10vw, 140px);
  height: clamp(84px, 10vw, 140px);
  filter: drop-shadow(0 6px 18px rgb(4 17 29 / 24%));
  font-size: clamp(4rem, 9vw, 7.5rem);
  line-height: 1;
  place-items: center;
}

.hero-copy h1,
.empty-hero h1 {
  margin-top: 1.25rem;
  color: var(--weather-on-panel);
  font-size: clamp(2rem, 5vw, 3.75rem);
  font-weight: 750;
  line-height: 1.05;
  letter-spacing: -0.045em;
}

.hero-description {
  margin-top: 0.6rem;
  font-size: 18px;
}

.temperature-meta {
  margin-top: 1.25rem;
  font-size: 14px;
  font-weight: 700;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  margin-top: clamp(2rem, 4vw, 3rem);
  border-radius: var(--weather-radius-hero);
}

.hero-metrics div {
  padding: 1.15rem 1.35rem;
}

.hero-metrics div + div {
  border-left: 1px solid var(--weather-panel-border);
}

.hero-metrics dt {
  color: var(--weather-on-panel-faint);
  font-size: 12px;
  font-weight: 700;
}

.hero-metrics dt span {
  margin-right: 0.25rem;
  color: var(--weather-on-panel);
}

.hero-metrics dd {
  margin-top: 0.3rem;
  color: var(--weather-on-panel);
  font-size: 18px;
  font-weight: 850;
}

.empty-hero {
  max-width: 720px;
  margin: auto 0;
}

.empty-hero > p {
  color: var(--weather-on-panel-muted);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.empty-hero > span {
  display: block;
  margin-top: 1rem;
  color: var(--weather-on-panel-muted);
  font-size: 17px;
}

.dashboard-content {
  width: 100%;
}

.control-layout,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.control-layout > :first-child {
  flex: 1;
}

.control-layout :deep(.city-registration) {
  flex: none;
  translate: 0 1rem;
}

.control-layout :deep(.city-add-button) {
  min-height: 44px;
}

.weather-status {
  display: block;
  width: 100%;
}

.weather-status :deep(.el-alert__title),
.weather-status :deep(.el-alert__icon) {
  color: var(--weather-on-panel);
}

.list-panel {
  overflow: visible;
  border: 0 !important;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none;
}

.list-panel > :deep(.el-card__body) {
  overflow: visible;
  padding: 0 !important;
}

.section-heading {
  padding-block: 0.25rem 0.5rem;
  color: var(--weather-on-panel);
}

.section-heading > div > p:last-child {
  margin-top: 0.4rem;
  color: var(--weather-on-panel-muted);
  font-size: 13px;
}

.section-kicker {
  color: var(--weather-accent-text);
  font-size: 11px;
  font-weight: 900;
  line-height: 1.4;
  letter-spacing: 0.12em;
}

.weather-card-title {
  margin-top: 0.2rem;
  font-size: 28px;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.result-count {
  min-height: 34px;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel);
  color: var(--weather-on-panel);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.4;
  backdrop-filter: var(--weather-backdrop);
}

.weather-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.list-panel :deep(.el-empty) {
  margin-top: 1.25rem;
  padding: 2rem;
  border-radius: var(--weather-radius-hero);
}

.list-panel :deep(.el-empty__description p) {
  color: var(--weather-on-panel-muted);
}

@media (max-width: 1119px) {
  .weather-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .current-weather-hero {
    padding-top: 0.5rem;
  }

  .hero-weather-main {
    margin-top: 2rem;
  }

  .hero-temperature {
    font-size: clamp(4.75rem, 24vw, 7rem);
  }

  .hero-weather-icon {
    width: clamp(72px, 22vw, 104px);
    height: clamp(72px, 22vw, 104px);
    font-size: clamp(3.5rem, 18vw, 5.5rem);
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-metrics div:nth-child(3) {
    border-left: 0;
  }

  .hero-metrics div:nth-child(n + 3) {
    border-top: 1px solid var(--weather-panel-border);
  }

  .control-layout {
    align-items: stretch;
    flex-direction: column;
  }

  .control-layout :deep(.city-registration),
  .control-layout :deep(.city-add-button) {
    width: 100%;
  }

  .control-layout :deep(.city-registration) {
    translate: 0;
  }

  .weather-list {
    grid-template-columns: 1fr;
  }
}
</style>
