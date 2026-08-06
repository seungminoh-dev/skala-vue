<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import OnboardingTour from '@/components/OnboardingTour.vue'
import SettingsToolbar from '@/components/SettingsToolbar.vue'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weather.js'
import { getVisual } from '@/utils/weatherVisuals.js'

const route = useRoute()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
configStore.load()
weatherStore.load()

/* Auto Hide Header 구현용 */
const isHeaderHidden = ref(false)
const hasKeyboardFocus = ref(false)
const isTourActive = ref(false)
const settingsToolbar = ref(null)
let previousScrollY = 0
let scrollFrameId = null

const activeMenu = computed(() => (route.name === 'detail' ? '/' : route.path))
// 기본 지역 계산용
const defaultWeather = computed(
  () =>
    weatherStore.weatherList.find((weather) => weather.id === configStore.primaryId) ??
    weatherStore.weatherList[0] ??
    null,
)
// Dynamic 배경 계산용
const canvasWeather = computed(() => {
  if (route.name === 'detail') {
    return weatherStore.weather(route.params.id) ?? defaultWeather.value
  }
  return defaultWeather.value
})
const weatherCanvas = computed(() => getVisual(canvasWeather.value ?? {}))
const canvasStyle = computed(() => ({
  '--weather-background-image': `url("${weatherCanvas.value.background}")`,
}))

/* Auto Hide Header 구현용 */
const updateHeader = () => {
  const currentScrollY = window.scrollY
  const scrollDistance = currentScrollY - previousScrollY

  if (currentScrollY < 80) {
    isHeaderHidden.value = false
  } else if (Math.abs(scrollDistance) > 6) {
    isHeaderHidden.value = scrollDistance > 0
  }

  previousScrollY = currentScrollY
  scrollFrameId = null
}

const handleHeaderScroll = () => {
  if (scrollFrameId !== null) return
  scrollFrameId = window.requestAnimationFrame(updateHeader)
}

const stopHeaderScroll = () => {
  window.removeEventListener('scroll', handleHeaderScroll)

  if (scrollFrameId !== null) {
    window.cancelAnimationFrame(scrollFrameId)
  }
}

const handleHeaderFocusin = (event) => {
  hasKeyboardFocus.value = event.target.matches(':focus-visible')
}

const handleHeaderFocusout = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) hasKeyboardFocus.value = false
}

const handleTourActive = (active) => {
  isTourActive.value = active
  settingsToolbar.value?.setTourActive(active)
}

onMounted(async () => {
  previousScrollY = window.scrollY
  window.addEventListener('scroll', handleHeaderScroll, { passive: true })
  await weatherStore.refresh({ staleOnly: true })
})

onBeforeUnmount(stopHeaderScroll)
</script>

<template>
  <div class="app-shell" :class="weatherCanvas.tone" :style="canvasStyle">
    <!-- Header -->
    <header
      class="app-header"
      :class="{ 'is-hidden': isHeaderHidden && !hasKeyboardFocus && !isTourActive }"
      @pointerdown="hasKeyboardFocus = false"
      @focusin="handleHeaderFocusin"
      @focusout="handleHeaderFocusout"
    >
      <div class="header-inner weather-surface">
        <!-- Router Navigation -->
        <div class="brand-navigation">
          <RouterLink class="brand" :to="{ name: 'home' }" aria-label="오늘의 날씨 홈">
            <span class="brand-mark" aria-hidden="true">☁</span>
            <span>오늘의 날씨</span>
          </RouterLink>

          <nav class="main-nav" aria-label="주요 메뉴">
            <RouterLink class="nav-link" :class="{ 'is-active': activeMenu === '/' }" to="/">
              날씨 홈
            </RouterLink>
            <RouterLink
              class="nav-link"
              :class="{ 'is-active': activeMenu === '/about' }"
              to="/about"
            >
              서비스 소개
            </RouterLink>
          </nav>
        </div>
        <!-- Setting Toolbar -->
        <SettingsToolbar ref="settingsToolbar" class="header-settings" />
      </div>
    </header>
    <!-- Main Content -->
    <main class="app-container">
      <RouterView />
    </main>
    <OnboardingTour v-if="route.name === 'home'" @active-change="handleTourActive" />
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
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
  will-change: opacity, transform;
}

.app-header.is-hidden {
  opacity: 0;
  transform: translateY(calc(-100% - 0.75rem));
}

.app-header.is-hidden .header-inner {
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
  padding: clamp(0.75rem, 1vw, 1rem) 0 2.5rem;
}

@media (max-width: 1023px) {
  .app-header {
    position: relative;
    padding-top: var(--layout-gutter);
    opacity: 1;
    transform: none;
  }

  .header-inner {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

@media (max-width: 767px) {
  .header-inner {
    flex-wrap: nowrap;
    gap: 0.5rem;
    min-height: 64px;
  }

  .brand-navigation {
    width: auto;
    min-width: 0;
    flex: 1;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 48px;
  }

  .brand {
    font-size: 15px;
  }
}

@media (max-width: 479px) {
  .header-inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .brand-navigation {
    display: contents;
  }

  .brand {
    grid-row: 1;
    grid-column: 1;
    justify-self: start;
  }

  .header-settings {
    grid-row: 1;
    grid-column: 2;
  }

  .main-nav {
    display: grid;
    grid-row: 2;
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .nav-link {
    min-width: 0;
    padding-inline: 0.5rem;
    text-align: center;
    white-space: nowrap;
  }
}
</style>
