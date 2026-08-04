// AI GENERATED CODE: 온도 단위·화면 테마·메인 지역을 localStorage와 동기화하는 Config Store입니다.

import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-dashboard:settings:v1'
const AVAILABLE_UNITS = new Set(['celsius', 'fahrenheit'])
const AVAILABLE_THEMES = new Set(['bright', 'dark'])

const hasWindow = () => typeof window !== 'undefined'

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius',
    theme: 'bright',
    primaryLocationKey: null,
    hydrated: false,
  }),

  getters: {
    unitSymbol: (state) => (state.unit === 'fahrenheit' ? '°F' : '°C'),
    isDarkMode: (state) => state.theme === 'dark',
  },

  actions: {
    hydrate() {
      if (this.hydrated) {
        this.applyTheme()
        return
      }

      if (!hasWindow()) {
        this.hydrated = true
        return
      }

      try {
        const snapshot = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')

        if (AVAILABLE_UNITS.has(snapshot?.unit)) {
          this.unit = snapshot.unit
        }

        if (AVAILABLE_THEMES.has(snapshot?.theme)) {
          this.theme = snapshot.theme
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.theme = 'dark'
        }

        this.primaryLocationKey = snapshot?.primaryLocationKey ?? null
      } catch {
        this.primaryLocationKey = null
      } finally {
        this.hydrated = true
        this.applyTheme()
      }
    },

    persist() {
      if (!hasWindow()) {
        return
      }

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          unit: this.unit,
          theme: this.theme,
          primaryLocationKey: this.primaryLocationKey,
        }),
      )
    },

    setUnit(unit) {
      if (!AVAILABLE_UNITS.has(unit)) {
        return
      }

      this.unit = unit
      this.persist()
    },

    setTheme(theme) {
      if (!AVAILABLE_THEMES.has(theme)) {
        return
      }

      this.theme = theme
      this.applyTheme()
      this.persist()
    },

    applyTheme() {
      if (!hasWindow()) {
        return
      }

      const isDark = this.theme === 'dark'
      document.documentElement.dataset.theme = this.theme
      document.documentElement.classList.toggle('dark', isDark)
    },

    setPrimaryLocation(locationKey) {
      this.primaryLocationKey = locationKey || null
      this.persist()
    },

    formatTemperature(value, { digits = 0 } = {}) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '정보 없음'
      }

      const convertedValue =
        this.unit === 'fahrenheit' ? (Number(value) * 9) / 5 + 32 : Number(value)

      return `${convertedValue.toFixed(digits)}${this.unitSymbol}`
    },
  },
})
