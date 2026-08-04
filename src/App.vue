<!-- AI GENERATED CODE: Navigation과 서비스 설정을 결합한 반응형 Weather App Shell입니다. -->
<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import SettingsToolbar from '@/components/SettingsToolbar.vue'
import heatwaveBackground from '@/assets/bg/optimized/heatwave.jpg'
import rainBackground from '@/assets/bg/optimized/rain.jpg'
import snowBackground from '@/assets/bg/optimized/snow.jpg'
import sunnyBackground from '@/assets/bg/optimized/sunny.jpg'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weather.js'

const route = useRoute()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const activeMenu = computed(() => (route.name === 'detail' ? '/' : route.path))
const primaryWeather = computed(
  () =>
    weatherStore.weatherList.find((item) => item.id === configStore.primaryLocationKey) ??
    weatherStore.weatherList[0] ??
    null,
)
const canvasWeather = computed(() => {
  if (route.name === 'detail') {
    return (
      weatherStore.weatherList.find((item) => item.id === route.params.id) ?? primaryWeather.value
    )
  }

  return primaryWeather.value
})
const weatherCanvas = computed(() => {
  const statusGroup = canvasWeather.value?.statusGroup?.toLocaleLowerCase() ?? ''

  if (statusGroup.includes('snow')) {
    return { background: snowBackground, tone: 'weather-tone-snow' }
  }

  if (
    statusGroup.includes('rain') ||
    statusGroup.includes('drizzle') ||
    statusGroup.includes('thunder')
  ) {
    return { background: rainBackground, tone: 'weather-tone-rain' }
  }

  if ((canvasWeather.value?.temp ?? 0) >= 33) {
    return { background: heatwaveBackground, tone: 'weather-tone-heat' }
  }

  return { background: sunnyBackground, tone: 'weather-tone-sunny' }
})
const canvasStyle = computed(() => ({
  '--weather-background-image': `url("${weatherCanvas.value.background}")`,
}))

onMounted(() => {
  configStore.hydrate()
  weatherStore.hydrate()
})
</script>

<template>
  <div class="app-shell" :class="weatherCanvas.tone" :style="canvasStyle">
    <header class="app-header">
      <div class="header-inner weather-surface">
        <div class="brand-navigation">
          <RouterLink class="brand" :to="{ name: 'home' }" aria-label="Weather Board 홈">
            <span class="brand-mark" aria-hidden="true">☁</span>
            <span>Weather Board</span>
          </RouterLink>

          <nav class="main-nav" aria-label="주요 메뉴">
            <RouterLink class="nav-link" :class="{ 'is-active': activeMenu === '/' }" to="/">
              Weather
            </RouterLink>
            <RouterLink
              class="nav-link"
              :class="{ 'is-active': activeMenu === '/about' }"
              to="/about"
            >
              About
            </RouterLink>
          </nav>
        </div>

        <SettingsToolbar />
      </div>
    </header>

    <main class="app-container">
      <RouterView />
    </main>

    <footer class="app-footer weather-surface">
      <span>현재 날씨는 마지막 정상 응답을 안전하게 보관합니다.</span>
      <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">Data by OpenWeather</a>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

.app-shell::before,
.app-shell::after {
  position: fixed;
  z-index: -2;
  inset: 0;
  content: '';
}

.app-shell::before {
  background-image: var(--weather-background-image);
  background-position: center;
  background-size: cover;
}

.app-shell::after {
  z-index: -1;
  background:
    linear-gradient(90deg, rgb(4 17 29 / 66%) 0%, rgb(4 17 29 / 24%) 52%, rgb(4 17 29 / 48%) 100%),
    linear-gradient(180deg, rgb(4 17 29 / 22%) 0%, rgb(4 17 29 / 8%) 45%, rgb(4 17 29 / 58%) 100%);
}

.weather-tone-rain::after {
  background: linear-gradient(135deg, rgb(16 33 48 / 70%), rgb(47 71 89 / 48%));
}

.weather-tone-snow::after {
  background: linear-gradient(135deg, rgb(34 55 75 / 60%), rgb(56 78 98 / 34%));
}

.weather-tone-heat::after {
  background: linear-gradient(90deg, rgb(35 18 12 / 66%), rgb(60 33 16 / 22%), rgb(27 16 13 / 48%));
}

.app-header {
  position: sticky;
  z-index: 30;
  top: 0;
  padding-top: 0.75rem;
  pointer-events: none;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: min(calc(100% - var(--layout-edge-space)), var(--layout-max-width));
  min-height: 72px;
  margin: 0 auto;
  padding: 0.5rem 0.65rem;
  border-radius: var(--weather-radius-surface);
  pointer-events: auto;
}

.brand-navigation,
.main-nav,
.brand {
  display: flex;
  align-items: center;
}

.brand-navigation {
  gap: 1.5rem;
  flex: none;
  padding-inline: 0.15rem;
}

.brand {
  gap: 0.625rem;
  color: var(--weather-on-panel);
  font-size: 16px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  border-radius: var(--weather-radius-control);
  background: var(--accent);
  color: #ffffff;
  font-size: 17px;
  font-weight: 900;
  place-items: center;
}

.main-nav {
  gap: 0.25rem;
}

.nav-link {
  min-height: 40px;
  padding: 0 0.875rem;
  border-radius: var(--weather-radius-control);
  color: var(--weather-on-panel-muted);
  font-size: 14px;
  font-weight: 700;
  line-height: 40px;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.is-active {
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
}

.nav-link:focus-visible,
.brand:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}

.app-container {
  width: min(calc(100% - var(--layout-edge-space)), var(--layout-max-width));
  margin: 0 auto;
  padding: clamp(1.5rem, 3vw, 2.5rem) 0 3rem;
}

.app-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: min(calc(100% - var(--layout-edge-space)), var(--layout-max-width));
  margin: 0 auto 1.5rem;
  padding: 0.8rem 1rem;
  border-radius: var(--weather-radius-control);
  color: var(--weather-on-panel-muted);
  font-size: 12px;
}

.app-footer a {
  color: var(--weather-on-panel);
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 1023px) {
  .app-header {
    position: relative;
    padding-top: var(--layout-gutter);
  }

  .header-inner {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

@media (max-width: 767px) {
  .brand-navigation {
    width: 100%;
    justify-content: space-between;
    min-height: 56px;
  }

  .brand {
    font-size: 15px;
  }

  .app-footer {
    flex-direction: column;
  }
}
</style>
