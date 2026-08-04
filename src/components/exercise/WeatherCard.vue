<!-- AI GENERATED CODE: Essential 이벤트를 보존한 실제 서비스형 Grid 날씨 카드입니다. -->
<script setup>
import { computed } from 'vue'
import { ElPopconfirm } from 'element-plus'
import { useConfigStore } from '@/stores/config.js'
import { getWeatherEmoji } from '@/utils/weatherVisuals.js'

const props = defineProps({
  city: {
    type: Object,
    default: () => ({ id: 'city_unknown', name: 'Unknown', temp: 0, status: 'Unknown' }),
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'remove-city'])
const configStore = useConfigStore()

// Essential DAY5: 원본 섭씨값을 설정 단위에 맞게 표시합니다.
const displayTemp = computed(() => configStore.formatTemperature(props.city.temp))
const displayFeelsLike = computed(() => configStore.formatTemperature(props.city.feelsLike))
const weatherEmoji = computed(() => getWeatherEmoji(props.city))
const conditionClass = computed(() => {
  const statusGroup = props.city.statusGroup?.toLocaleLowerCase() ?? ''

  if (statusGroup.includes('thunder')) return 'condition-thunder'
  if (statusGroup.includes('rain') || statusGroup.includes('drizzle')) return 'condition-rain'
  if (statusGroup.includes('snow')) return 'condition-snow'
  if (statusGroup.includes('mist') || statusGroup.includes('fog')) return 'condition-mist'
  if (statusGroup.includes('cloud')) return 'condition-clouds'
  return 'condition-clear'
})

const formatUpdatedAt = (timestamp) => {
  if (!timestamp) {
    return '갱신 정보 없음'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

const formatMetric = (value, unit) =>
  value === null || value === undefined ? '정보 없음' : `${value}${unit}`

const isStale = (expiresAt) => !expiresAt || expiresAt <= Date.now()
const selectCard = (city) => emit('select-card', city)
const clickDetail = (city) => emit('click-detail', city)
const removeCity = (city) => emit('remove-city', city)
</script>

<template>
  <ElCard
    class="weather-location-card weather-surface"
    :class="[conditionClass, { 'is-selected': isSelected }]"
    shadow="never"
    :aria-pressed="isSelected"
    tabindex="0"
    @click="selectCard(city)"
    @keydown.enter.self.prevent="selectCard(city)"
    @keydown.space.self.prevent="selectCard(city)"
  >
    <article class="weather-card-content">
      <header class="card-header">
        <div class="location-copy">
          <div class="location-heading">
            <h3 class="city-name">{{ city.name }}</h3>
            <ElTag v-if="isPrimary" class="primary-badge" effect="plain">메인</ElTag>
          </div>
          <p class="region-name">{{ city.region || city.country || '등록 위치' }}</p>
        </div>

        <span class="weather-icon" role="img" :aria-label="`${city.status} 날씨`">
          {{ weatherEmoji }}
        </span>
      </header>

      <div class="temperature-block">
        <strong class="current-temp">{{ displayTemp }}</strong>
        <div>
          <p class="weather-status-text">{{ city.status }}</p>
          <p class="feels-like">체감 {{ displayFeelsLike }}</p>
        </div>
      </div>

      <dl class="weather-metrics">
        <div>
          <dt>습도</dt>
          <dd>{{ formatMetric(city.humidity, '%') }}</dd>
        </div>
        <div>
          <dt>풍속</dt>
          <dd>{{ formatMetric(city.windSpeed, 'm/s') }}</dd>
        </div>
        <div>
          <dt>구름</dt>
          <dd>{{ formatMetric(city.clouds, '%') }}</dd>
        </div>
      </dl>

      <div class="status-row">
        <ElTag v-if="city.temp === null || city.temp === undefined" effect="plain">
          온도 정보 없음
        </ElTag>
        <ElTag v-else-if="city.temp >= 25" class="temperature-badge is-hot" effect="light">
          더움(25도 이상)
        </ElTag>
        <ElTag v-else class="temperature-badge is-cool" effect="light"> 선선함(25도 미만) </ElTag>
        <ElTag v-if="isStale(city.expiresAt)" effect="plain" type="warning"> 업데이트 필요 </ElTag>
      </div>

      <footer class="card-footer">
        <span class="updated-at">{{ formatUpdatedAt(city.fetchedAt) }} 업데이트</span>
        <div class="card-actions">
          <ElPopconfirm
            :title="`${city.name}을(를) 목록에서 삭제할까요?`"
            confirm-button-text="삭제"
            cancel-button-text="취소"
            @confirm="removeCity(city)"
          >
            <template #reference>
              <ElButton class="remove-button" text @click.stop>삭제</ElButton>
            </template>
          </ElPopconfirm>
          <ElButton class="detail-button" type="primary" @click.stop="clickDetail(city)">
            상세 보기
          </ElButton>
        </div>
      </footer>
    </article>
  </ElCard>
</template>

<style scoped>
.weather-location-card {
  --condition-color: var(--condition-clear);
  --card-padding-block: 1.25rem;
  --card-padding-inline: 1.375rem;

  position: relative;
  min-width: 0;
  overflow: hidden;
  border-radius: var(--weather-radius-hero);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.weather-location-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 5px;
  background: var(--condition-color);
  content: '';
}

.weather-location-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--weather-shadow-hover);
}

.weather-location-card:focus-visible {
  outline: 3px solid rgb(255 255 255 / 90%);
  outline-offset: 2px;
}

.weather-location-card.is-selected {
  border-color: rgb(255 255 255 / 78%);
  box-shadow:
    0 0 0 2px rgb(255 255 255 / 30%),
    0 20px 50px rgb(4 17 29 / 26%);
}

.condition-clouds {
  --condition-color: var(--condition-clouds);
}

.condition-rain {
  --condition-color: var(--condition-rain);
}

.condition-snow {
  --condition-color: var(--condition-snow);
}

.condition-thunder {
  --condition-color: var(--condition-thunder);
}

.condition-mist {
  --condition-color: var(--condition-mist);
}

.weather-location-card > :deep(.el-card__body) {
  height: 100%;
  padding: calc(var(--card-padding-block) + 0.25rem) var(--card-padding-inline)
    var(--card-padding-block) !important;
}

.weather-card-content {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 1.125rem;
}

.card-header,
.location-heading,
.temperature-block,
.status-row,
.card-footer,
.card-actions {
  display: flex;
  align-items: center;
}

.card-header {
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.location-copy {
  flex: 1;
  min-width: 0;
}

.location-heading {
  gap: 0.5rem;
}

.city-name {
  overflow: hidden;
  color: var(--weather-on-panel);
  font-size: 20px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.primary-badge {
  --el-tag-bg-color: var(--weather-panel-soft);
  --el-tag-border-color: transparent;
  --el-tag-text-color: var(--weather-accent-text);
}

.region-name,
.feels-like,
.updated-at {
  color: var(--weather-on-panel-faint);
}

.region-name {
  margin-top: 0.15rem;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex: none;
  border-radius: 50%;
  background: var(--weather-panel-soft);
  font-size: 34px;
  place-items: center;
}

.temperature-block {
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
  padding-block: 0.15rem;
}

.temperature-block > div {
  min-width: 0;
  text-align: right;
}

.current-temp {
  color: var(--weather-on-panel);
  font-size: clamp(2.75rem, 6vw, 3.5rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.weather-status-text {
  color: var(--weather-on-panel);
  font-size: 15px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.feels-like {
  margin-top: 0.15rem;
  font-size: 12px;
}

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
}

.weather-metrics div {
  min-width: 0;
  padding: 0.75rem 0.4rem;
  text-align: center;
}

.weather-metrics div + div {
  border-left: 1px solid var(--weather-panel-border);
}

.weather-metrics dt {
  color: var(--weather-on-panel-faint);
  font-size: 11px;
  font-weight: 700;
}

.weather-metrics dd {
  margin-top: 0.15rem;
  color: var(--weather-on-panel);
  font-size: 13px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.status-row {
  min-height: 28px;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.temperature-badge.is-hot {
  --el-tag-bg-color: #fff1e8;
  --el-tag-border-color: #f4c49f;
  --el-tag-text-color: #a54b12;
}

.temperature-badge.is-cool {
  --el-tag-bg-color: rgb(210 236 255 / 18%);
  --el-tag-border-color: rgb(210 236 255 / 32%);
  --el-tag-text-color: #e4f3ff;
}

.card-footer {
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid var(--weather-panel-border);
}

.updated-at {
  font-size: 11px;
  line-height: 1.4;
}

.card-actions {
  gap: 0.35rem;
}

.card-actions :deep(.el-button) {
  min-height: 36px;
  padding-inline: 0.75rem;
  font-size: 12px;
}

.remove-button {
  color: var(--weather-on-panel-faint);
}

@media (max-width: 479px) {
  .weather-location-card {
    --card-padding-block: 1rem;
    --card-padding-inline: 1rem;
  }

  .card-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
