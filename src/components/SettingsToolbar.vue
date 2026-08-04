<!-- AI GENERATED CODE: 내 위치·메인 지역·온도 단위·화면 모드를 한곳에서 제어하는 설정 Toolbar입니다. -->
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElButton, ElMessage, ElOption, ElSelect } from 'element-plus'
import ThemeModeToggle from '@/components/ThemeModeToggle.vue'
import UnitToggler from '@/components/UnitToggler.vue'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weather.js'

const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const isLocating = ref(false)

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

    configStore.setPrimaryLocation(result.location.key)
    ElMessage.success(
      result.status === 'duplicate'
        ? `${result.location.name}을(를) 메인 지역으로 설정했습니다.`
        : `${result.location.name} 날씨를 추가하고 메인 지역으로 설정했습니다.`,
    )
  } catch (error) {
    ElMessage.error(locationErrorMessage(error))
  } finally {
    isLocating.value = false
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

    <ElButton class="location-button" :loading="isLocating" plain @click="registerCurrentLocation">
      <span aria-hidden="true">⌖</span>
      내 위치
    </ElButton>

    <div class="setting-group compact-setting">
      <span class="setting-label">단위</span>
      <UnitToggler />
    </div>

    <div class="setting-group compact-setting">
      <span class="setting-label">화면</span>
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
  gap: 0.65rem;
  min-width: 0;
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

.location-button {
  min-height: 40px;
  border-color: var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
}

@media (max-width: 1023px) {
  .settings-toolbar {
    width: 100%;
    justify-content: flex-start;
    padding-top: 0.65rem;
    overflow-x: auto;
    border-top: 1px solid var(--weather-panel-border);
  }
}

@media (max-width: 479px) {
  .settings-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    overflow: visible;
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
