<!-- AI GENERATED CODE: 내 위치·메인 지역·온도 단위·화면 모드를 한곳에서 제어하는 설정 Toolbar입니다. -->
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Aim, Refresh } from '@element-plus/icons-vue'
import { ElButton, ElMessage, ElOption, ElSelect, ElTooltip } from 'element-plus'
import ThemeModeToggle from '@/components/ThemeModeToggle.vue'
import UnitToggler from '@/components/UnitToggler.vue'
import { useConfigStore } from '@/stores/config.js'
import { useWeatherStore } from '@/stores/weather.js'

const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const isLocating = ref(false)
const isRefreshing = ref(false)

const locationOptions = computed(() => weatherStore.weatherList)
const primaryLocationKey = computed({
  get: () => configStore.primaryLocationKey,
  set: (locationKey) => configStore.setPrimaryLocation(locationKey),
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

const registerCurrentLocation = async () => {
  isLocating.value = true

  try {
    const position = await getCurrentPosition()
    const result = await weatherStore.registerLocation({
      name: '내 위치',
      englishName: 'Current location',
      country: '',
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      accuracy: position.coords.accuracy,
      source: 'geolocation',
    })

    configStore.setPrimaryLocation(result.location.id)
    ElMessage.success(`${result.location.name} 날씨를 추가하고 메인 지역으로 설정했습니다.`)
  } catch (error) {
    ElMessage.error(locationErrorMessage(error))
  } finally {
    isLocating.value = false
  }
}

const refreshAllWeather = async () => {
  if (weatherStore.weatherList.length === 0) {
    ElMessage.info('새로고침할 등록 도시가 없습니다.')
    return
  }

  isRefreshing.value = true

  try {
    const result = await weatherStore.refreshAllWeather()

    if (result.failed === 0) {
      ElMessage.success(`${result.success}개 도시의 날씨를 새로고침했습니다.`)
      return
    }

    ElMessage.warning(`새로고침 결과: 성공 ${result.success}개, 실패 ${result.failed}개`)
  } finally {
    isRefreshing.value = false
  }
}

watch(
  [locationOptions, () => configStore.hydrated, () => weatherStore.hydrated],
  ([locations]) => {
    if (!configStore.hydrated || !weatherStore.hydrated) {
      return
    }

    if (locations.length === 0) {
      configStore.setPrimaryLocation(null)
      return
    }

    const hasPrimaryLocation = locations.some(
      (location) => location.id === configStore.primaryLocationKey,
    )

    if (!hasPrimaryLocation) {
      configStore.setPrimaryLocation(locations[0].id)
    }
  },
  { immediate: true },
)

onMounted(() => {
  configStore.hydrate()
  weatherStore.hydrate()
})
</script>

<template>
  <aside class="settings-toolbar" aria-label="날씨 서비스 설정">
    <div class="toolbar-settings">
      <div class="setting-group primary-location-setting">
        <span class="setting-label">메인 지역</span>
        <ElSelect
          v-model="primaryLocationKey"
          class="location-select"
          placeholder="등록 도시 없음"
          aria-label="메인 지역 선택"
          :disabled="locationOptions.length === 0"
        >
          <ElOption
            v-for="location in locationOptions"
            :key="location.id"
            :label="location.name"
            :value="location.id"
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
          :loading="isLocating"
          plain
          aria-label="내 위치 등록"
          @click="registerCurrentLocation"
        >
          <Aim class="action-icon" aria-hidden="true" />
        </ElButton>
      </ElTooltip>

      <ElTooltip content="전체 날씨 새로고침" placement="bottom" :show-after="300">
        <ElButton
          class="toolbar-icon-button"
          :loading="isRefreshing"
          plain
          aria-label="전체 날씨 새로고침"
          @click="refreshAllWeather"
        >
          <Refresh class="action-icon" aria-hidden="true" />
        </ElButton>
      </ElTooltip>

      <ThemeModeToggle />
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

.toolbar-settings,
.toolbar-actions {
  display: flex;
  align-items: flex-end;
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

@media (max-width: 1023px) {
  .settings-toolbar {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0.65rem;
    border-top: 1px solid var(--weather-panel-border);
  }
}

@media (max-width: 479px) {
  .settings-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: end;
    gap: 0.65rem;
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
