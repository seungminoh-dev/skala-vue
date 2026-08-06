<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Aim, Refresh, Setting } from '@element-plus/icons-vue'
import { ElButton, ElMessage, ElOption, ElSelect, ElTooltip } from 'element-plus'
import ThemeModeToggle from '@/components/ThemeModeToggle.vue'
import UnitToggler from '@/components/UnitToggler.vue'
import { current } from '@/services/openWeatherApi.js'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weather.js'

const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const isLocating = ref(false)
const isRefreshing = ref(false)
const mobileOpen = ref(false)
const tourActive = ref(false)
const toolbar = ref(null)

const primaryId = computed({
  get: () => configStore.primaryId,
  set: (id) => configStore.setPrimary(id),
})

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 기능을 지원하지 않습니다.'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 10 * 60 * 1000,
    })
  })

const locationErrorMessage = (error) => {
  if (error?.code === 1) {
    return '위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.'
  }

  if (error?.code === 2) {
    return '현재 위치를 확인할 수 없습니다.'
  }

  if (error?.code === 3) {
    return '위치 확인 시간이 초과되었습니다.'
  }

  return error?.message ?? '내 위치를 등록하지 못했습니다.'
}

const addCurrentLocation = async () => {
  isLocating.value = true

  try {
    const position = await getCurrentPosition()
    const location = {
      id: 'current-location',
      name: '내 현재 위치',
      englishName: 'Current location',
      state: '',
      country: '',
      region: 'GPS',
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    }
    const weather = weatherStore.add(location, await current(location))

    configStore.setPrimary(weather.id)
    ElMessage.success(`${weather.name} 날씨를 추가하고 대표 지역으로 설정했습니다.`)
  } catch (error) {
    ElMessage.error(locationErrorMessage(error))
  } finally {
    isLocating.value = false
  }
}

const refreshWeather = async () => {
  if (weatherStore.weatherList.length === 0) {
    ElMessage.info('새로고침할 등록 도시가 없습니다.')
    return
  }

  isRefreshing.value = true

  try {
    const result = await weatherStore.refresh()

    if (result.failed === 0) {
      ElMessage.success(`${result.success}개 도시의 날씨를 새로고침했습니다.`)
      return
    }

    ElMessage.warning(`새로고침 결과: 성공 ${result.success}개, 실패 ${result.failed}개`)
  } finally {
    isRefreshing.value = false
  }
}

const closeOutside = (event) => {
  if (mobileOpen.value && !tourActive.value && !toolbar.value?.contains(event.target)) {
    mobileOpen.value = false
  }
}

const setTourActive = (active) => {
  tourActive.value = active
  mobileOpen.value = active
}

defineExpose({ setTourActive })

watch(
  () => [...weatherStore.locationIds],
  (ids) => {
    if (ids.length === 0) {
      configStore.setPrimary(null)
      return
    }

    if (!ids.includes(configStore.primaryId)) configStore.setPrimary(ids[0])
  },
  { immediate: true },
)

onMounted(() => document.addEventListener('pointerdown', closeOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOutside))
</script>

<template>
  <aside
    ref="toolbar"
    class="settings-toolbar"
    :class="{ 'is-open': mobileOpen }"
    aria-label="날씨 서비스 설정"
    @keydown.esc="mobileOpen = false"
  >
    <ElButton
      class="mobile-settings-button"
      plain
      aria-controls="weather-settings-panel"
      :aria-expanded="mobileOpen"
      @click="mobileOpen = !mobileOpen"
    >
      <Setting class="action-icon" aria-hidden="true" />
      <span>설정</span>
    </ElButton>

    <div id="weather-settings-panel" class="toolbar-content">
      <div class="toolbar-settings">
        <div class="setting-group primary-location-setting">
          <span class="setting-label">대표 지역</span>
          <ElSelect
            v-model="primaryId"
            class="location-select"
            placeholder="등록 도시 없음"
            aria-label="대표 지역 선택"
            :disabled="weatherStore.weatherList.length === 0"
          >
            <ElOption
              v-for="weather in weatherStore.weatherList"
              :key="weather.id"
              :label="weather.name"
              :value="weather.id"
            />
          </ElSelect>
        </div>

        <div class="setting-group compact-setting">
          <span class="setting-label">단위</span>
          <UnitToggler />
        </div>
      </div>

      <div class="toolbar-actions" role="group" aria-label="빠른 설정">
        <ElTooltip content="내 위치 등록" placement="bottom" :show-after="300">
          <ElButton
            class="toolbar-icon-button"
            data-tour="gps"
            :loading="isLocating"
            plain
            aria-label="내 위치 등록"
            @click="addCurrentLocation"
          >
            <Aim class="action-icon" aria-hidden="true" />
          </ElButton>
        </ElTooltip>

        <ElTooltip content="전체 날씨 새로고침" placement="bottom" :show-after="300">
          <ElButton
            class="toolbar-icon-button"
            data-tour="refresh"
            :loading="isRefreshing"
            plain
            aria-label="전체 날씨 새로고침"
            @click="refreshWeather"
          >
            <Refresh class="action-icon" aria-hidden="true" />
          </ElButton>
        </ElTooltip>

        <ThemeModeToggle />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.settings-toolbar {
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 1rem;
  min-width: 0;
}

.toolbar-content,
.toolbar-settings,
.toolbar-actions {
  display: flex;
  align-items: flex-end;
}

.toolbar-content {
  gap: 1rem;
  min-width: 0;
}

.toolbar-settings {
  gap: 0.65rem;
  min-width: 0;
}

.toolbar-actions {
  flex: none;
  gap: 0.5rem;
}

.setting-group {
  display: grid;
  gap: 0.2rem;
}

.setting-label {
  color: var(--weather-on-panel-faint);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.04em;
}

.location-select {
  width: 150px;
}

.location-select :deep(.el-select__wrapper) {
  min-height: 40px;
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
  box-shadow: 0 0 0 1px var(--weather-panel-border) inset;
}

.location-select :deep(.el-select__selected-item),
.location-select :deep(.el-select__placeholder) {
  color: var(--weather-on-panel);
}

.toolbar-icon-button {
  width: 40px;
  height: 40px;
  min-height: 40px;
  margin: 0;
  padding: 0;
  border-color: var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
}

.toolbar-icon-button:hover,
.toolbar-icon-button:focus-visible {
  border-color: rgb(255 255 255 / 38%);
  background: var(--weather-panel-strong);
  color: var(--weather-on-panel);
}

.action-icon {
  width: 17px;
  height: 17px;
}

.mobile-settings-button {
  display: none;
}

@media (max-width: 1023px) {
  .settings-toolbar {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0.65rem;
    border-top: 1px solid var(--weather-panel-border);
  }
}

@media (max-width: 767px) {
  .settings-toolbar {
    position: relative;
    width: auto;
    flex: none;
    padding-top: 0;
    border-top: 0;
  }

  .mobile-settings-button {
    display: inline-flex;
    min-width: 40px;
    gap: 0.35rem;
    padding-inline: 0.7rem;
    border-color: var(--weather-panel-border);
    background: var(--weather-panel-soft);
    color: var(--weather-on-panel);
  }

  .toolbar-content {
    position: absolute;
    z-index: 10;
    top: calc(100% + 0.65rem);
    right: 0;
    display: none;
    width: min(340px, calc(100vw - 2rem));
    padding: 0.85rem;
    border: 1px solid var(--weather-panel-border);
    border-radius: var(--weather-radius-surface);
    background: var(--weather-panel-opaque);
    box-shadow: var(--weather-shadow-surface);
    backdrop-filter: var(--weather-backdrop);
  }

  .settings-toolbar.is-open .toolbar-content {
    display: grid;
    gap: 0.75rem;
  }
}

@media (max-width: 479px) {
  .toolbar-content {
    right: -1.65rem;
  }

  .toolbar-settings {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    width: 100%;
  }

  .toolbar-actions {
    justify-self: end;
  }

  .primary-location-setting {
    min-width: 0;
  }

  .location-select {
    width: 100%;
  }

  .compact-setting {
    justify-self: start;
  }
}
</style>
