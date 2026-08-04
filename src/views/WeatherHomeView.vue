<!-- AI GENERATED CODE: Essential 반응성을 보존한 몰입형 Weather Canvas와 등록 지역 Grid입니다. -->
<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ElPopconfirm } from 'element-plus'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import CityRegistrationModal from '@/components/exercise/CityRegistrationModal.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useConfigStore } from '@/stores/config.js'
import { useWeatherStore } from '@/stores/weather.js'
import { getWeatherEmoji } from '@/utils/weatherVisuals.js'
import { formatWindDirection } from '@/utils/windDirection.js'

// Essential DAY2: 기존 반응형 변수명을 유지합니다.
const searchQuery = ref('')
const weatherFilter = ref('all')
const selectedCityInfo = ref(null)
const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const { weatherList } = storeToRefs(weatherStore)
const router = useRouter()

const getWeatherFilterGroup = (statusGroup = '') => {
  const normalizedStatus = String(statusGroup).toLocaleLowerCase()

  if (normalizedStatus.includes('clear')) return 'clear'
  if (normalizedStatus.includes('cloud')) return 'clouds'
  if (
    normalizedStatus.includes('rain') ||
    normalizedStatus.includes('drizzle') ||
    normalizedStatus.includes('thunder')
  ) {
    return 'rain'
  }
  if (normalizedStatus.includes('snow')) return 'snow'
  return 'other'
}

// Essential DAY2: 검색어가 비어 있으면 전체 배열, 입력 시 일치 도시만 반환합니다.
const filteredWeatherList = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLocaleLowerCase()

  return [...weatherList.value]
    .filter((weather) => {
      const searchableLocation = [
        weather.name,
        weather.englishName,
        weather.region,
        weather.country,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
      const matchesLocation = searchableLocation.includes(normalizedQuery)
      const matchesWeather =
        weatherFilter.value === 'all' ||
        getWeatherFilterGroup(weather.statusGroup) === weatherFilter.value

      return matchesLocation && matchesWeather
    })
    .sort((left, right) => {
      if (left.id === configStore.primaryLocationKey) return -1
      if (right.id === configStore.primaryLocationKey) return 1
      return left.addedAt - right.addedAt
    })
})
const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || weatherFilter.value !== 'all',
)
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
const selectedWeatherSummary = computed(() => {
  if (!selectedCityInfo.value) return ''

  return `${configStore.formatTemperature(selectedCityInfo.value.temp)} · ${selectedCityInfo.value.status} · 체감 ${configStore.formatTemperature(selectedCityInfo.value.feelsLike)}`
})
const primaryTemperatureSummary = computed(() => {
  if (!primaryWeather.value) return ''

  return `현재 ${configStore.formatTemperature(primaryWeather.value.temp)} · 체감 ${displayPrimaryFeelsLike.value}`
})

const dashboardSummary = computed(() => {
  if (weatherList.value.length === 0) {
    return '관심 지역을 등록하면 현재 날씨를 한눈에 비교할 수 있습니다.'
  }

  return `${weatherList.value.length}개 지역의 마지막 정상 날씨를 표시하고 있습니다.`
})

const formatNumber = (value, unit) =>
  value === null || value === undefined ? '정보 없음' : `${value}${unit}`
const formatWind = (speed, degree) => {
  const wind = []
  if (speed !== null && speed !== undefined) wind.push(`${speed}m/s`)
  if (degree !== null && degree !== undefined) wind.push(formatWindDirection(degree))

  return wind.join(' · ') || '정보 없음'
}
const formatPrecipitation = (rain, snow) => {
  const precipitation = []
  if (rain > 0) precipitation.push(`비 ${rain}mm`)
  if (snow > 0) precipitation.push(`눈 ${snow}mm`)

  return precipitation.join(' · ') || '없음'
}
const formatTime = (timestamp, timezoneOffset = 0) => {
  if (!timestamp) return '정보 없음'

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(timestamp + timezoneOffset * 1000))
}
// Essential DAY1: 자식 Component가 발생시킨 이벤트를 부모 View에서 처리합니다.
const updateSearchQuery = (content) => {
  searchQuery.value = content
}
const updateWeatherFilter = (filter) => {
  weatherFilter.value = filter
}
const selectCity = (city) => {
  selectedCityInfo.value = city
}
const selectRegisteredCity = (city) => {
  const registeredCity = weatherList.value.find((item) => item.id === city.id) ?? city
  selectedCityInfo.value = registeredCity

  if (!configStore.primaryLocationKey) {
    configStore.setPrimaryLocation(registeredCity.id)
  }
}
const showDetail = (city) => {
  router.push({ name: 'detail', params: { id: city.id } })
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

onMounted(() => {
  configStore.hydrate()
  weatherStore.hydrate()
  selectedCityInfo.value =
    weatherList.value.find((item) => item.id === configStore.primaryLocationKey) ?? null
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
        <div class="location-heading-copy hero-location">
          <p class="location-heading-kicker">MY FAVORITE LOCATION</p>
          <strong class="location-heading-title">{{ primaryWeather.name }}</strong>
          <span class="location-heading-meta">{{ primaryWeather.region }}</span>
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
            <p class="temperature-meta">{{ primaryTemperatureSummary }}</p>
          </div>
        </div>

        <dl class="hero-metrics weather-surface">
          <div>
            <dt><span aria-hidden="true">◍</span> 습도</dt>
            <dd>{{ formatNumber(primaryWeather.humidity, '%') }}</dd>
          </div>
          <div>
            <dt><span aria-hidden="true">↝</span> 바람</dt>
            <dd>{{ formatWind(primaryWeather.windSpeed, primaryWeather.windDegree) }}</dd>
          </div>
          <div>
            <dt><span aria-hidden="true">☂</span> 강수 / 적설</dt>
            <dd>
              {{ formatPrecipitation(primaryWeather.rainLastHour, primaryWeather.snowLastHour) }}
            </dd>
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
      <BaseDashboardCard class="list-panel">
        <section aria-labelledby="weather-list-title">
          <div class="section-heading">
            <div class="location-heading-copy">
              <p class="location-heading-kicker">MY LOCATIONS</p>
              <h2 id="weather-list-title" class="location-heading-title">등록 지역</h2>
              <p class="location-heading-meta">{{ dashboardSummary }}</p>
            </div>
          </div>

          <div class="search-control-panel">
            <SearchBar
              :search-query="searchQuery"
              :weather-filter="weatherFilter"
              :result-count="filteredWeatherList.length"
              :total-count="weatherList.length"
              @update-query="updateSearchQuery"
              @update-weather-filter="updateWeatherFilter"
            />
          </div>

          <div v-if="filteredWeatherList.length > 0 || !hasActiveFilters" class="weather-list">
            <WeatherCard
              v-for="item in filteredWeatherList"
              :key="item.id"
              :city="item"
              :is-selected="selectedCityInfo?.id === item.id"
              :is-primary="configStore.primaryLocationKey === item.id"
              @select-card="selectCity"
              @click-detail="showDetail"
            />
            <CityRegistrationModal
              v-if="!hasActiveFilters"
              @city-registered="selectRegisteredCity"
            />
          </div>
          <ElEmpty
            v-else
            class="filter-empty-state weather-surface"
            description="검색·날씨 조건에 맞는 등록 지역이 없습니다."
            :image-size="88"
          />

          <div
            class="weather-status weather-surface"
            :class="{ 'has-selection': selectedCityInfo }"
          >
            <output class="weather-status-output" aria-live="polite">
              <ElAlert
                class="selection-alert"
                :title="
                  selectedCityInfo
                    ? `${selectedCityInfo.name}이 선택되었습니다.`
                    : weatherList.length
                      ? '날씨 카드를 선택하거나 상세 정보를 확인해 보세요.'
                      : '도시를 등록하면 선택한 지역 정보가 여기에 표시됩니다.'
                "
                :description="selectedWeatherSummary"
                type="success"
                show-icon
                :closable="false"
              />
            </output>

            <ElPopconfirm
              v-if="selectedCityInfo"
              :title="`${selectedCityInfo.name}을(를) 목록에서 삭제할까요?`"
              confirm-button-text="삭제"
              cancel-button-text="취소"
              @confirm="removeCity(selectedCityInfo)"
            >
              <template #reference>
                <ElButton class="selected-delete-button" type="danger" plain> 삭제 </ElButton>
              </template>
            </ElPopconfirm>
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
  padding: 0 0 clamp(1.75rem, 3vw, 2.5rem);
  color: var(--weather-on-panel);
  text-shadow: 0 2px 18px rgb(4 17 29 / 30%);
}

.location-heading-copy {
  display: grid;
}

.location-heading-kicker {
  color: var(--weather-accent-text);
  font-size: 11px;
  font-weight: 900;
  line-height: 1.4;
  letter-spacing: 0.12em;
}

.location-heading-title {
  margin-top: 0.2rem;
  color: var(--weather-on-panel);
  font-size: 28px;
  font-weight: 850;
  line-height: 1.5;
  letter-spacing: -0.03em;
}

.location-heading-meta {
  margin-top: 0.4rem;
  color: var(--weather-on-panel-muted);
  font-size: 13px;
}

.temperature-meta {
  color: var(--weather-on-panel-muted);
}

.hero-weather-main {
  margin-top: clamp(2rem, 4vh, 3rem);
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
  font-size: clamp(4.75rem, 8vw, 7.5rem);
  font-weight: 300;
  line-height: 0.86;
  letter-spacing: -0.085em;
}

.hero-weather-icon {
  display: grid;
  width: clamp(72px, 7vw, 104px);
  height: clamp(72px, 7vw, 104px);
  filter: drop-shadow(0 6px 18px rgb(4 17 29 / 24%));
  font-size: clamp(3.5rem, 6vw, 5.5rem);
  line-height: 1;
  place-items: center;
}

.hero-copy h1,
.empty-hero h1 {
  margin-top: 1.25rem;
  color: var(--weather-on-panel);
  font-size: clamp(1.875rem, 3.5vw, 3rem);
  font-weight: 750;
  line-height: 1.05;
  letter-spacing: -0.045em;
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
  margin-top: clamp(1.5rem, 3vw, 2.25rem);
  border-radius: var(--weather-radius-surface);
}

.hero-metrics div {
  padding: 0.9rem 1.1rem;
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

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.weather-status {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding: 0.4rem 0.5rem;
  border-radius: var(--weather-radius-surface);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.weather-status.has-selection {
  border-color: rgb(255 255 255 / 72%);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 28%),
    var(--weather-shadow-surface);
}

.weather-status-output {
  min-width: 0;
  flex: 1;
}

.weather-status :deep(.el-alert__title),
.weather-status :deep(.el-alert__description),
.weather-status :deep(.el-alert__icon) {
  color: var(--weather-on-panel);
}

.weather-status :deep(.el-alert) {
  width: 100%;
  height: auto;
  padding: 0.35rem 0.55rem;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.selected-delete-button {
  min-width: 72px;
  min-height: 40px;
  flex: none;
  align-self: center;
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

.search-control-panel {
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-surface);
  background: var(--weather-panel-opaque);
  box-shadow: var(--shadow-control);
}

.section-heading {
  color: var(--weather-on-panel);
}

.weather-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.filter-empty-state {
  margin-top: 1.25rem;
  border-radius: var(--weather-radius-surface);
}

.filter-empty-state :deep(.el-empty__description p) {
  color: var(--weather-on-panel-muted);
}

@media (max-width: 899px) {
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

  .weather-status :deep(.el-alert) {
    width: 100%;
  }

  .weather-status {
    flex-direction: column;
  }

  .selected-delete-button {
    width: 100%;
  }

  .hero-metrics div:nth-child(3) {
    border-left: 0;
  }

  .hero-metrics div:nth-child(n + 3) {
    border-top: 1px solid var(--weather-panel-border);
  }

  .weather-list {
    grid-template-columns: 1fr;
  }
}
</style>
