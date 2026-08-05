import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-dashboard:settings:v2'
const UNITS = new Set(['celsius', 'fahrenheit'])
const THEMES = new Set(['bright', 'dark'])

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius',
    theme: 'bright',
    primaryId: null,
    loaded: false,
  }),

  getters: {
    unitSymbol: (state) => (state.unit === 'fahrenheit' ? '°F' : '°C'),
    isDarkMode: (state) => state.theme === 'dark',
  },

  actions: {
    load() {
      if (this.loaded) return

      try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')

        if (UNITS.has(saved?.unit)) this.unit = saved.unit
        if (THEMES.has(saved?.theme)) {
          this.theme = saved.theme
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.theme = 'dark'
        }

        this.primaryId = saved?.primaryId ?? null
      } catch (error) {
        console.error('[Config] 설정을 읽지 못했습니다.', error)
      } finally {
        this.loaded = true
        this.applyTheme()
      }
    },

    save() {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            unit: this.unit,
            theme: this.theme,
            primaryId: this.primaryId,
          }),
        )
      } catch (error) {
        console.error('[Config] 설정을 저장하지 못했습니다.', error)
      }
    },

    setUnit(unit) {
      if (!UNITS.has(unit)) return
      this.unit = unit
      this.save()
    },

    setTheme(theme) {
      if (!THEMES.has(theme)) return
      this.theme = theme
      this.applyTheme()
      this.save()
    },

    setPrimary(id) {
      this.primaryId = id || null
      this.save()
    },

    applyTheme() {
      document.documentElement.dataset.theme = this.theme
      document.documentElement.classList.toggle('dark', this.theme === 'dark')
    },

    formatTemp(value, digits = 0) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '정보 없음'
      }

      const temp = this.unit === 'fahrenheit' ? (Number(value) * 9) / 5 + 32 : Number(value)
      return `${temp.toFixed(digits)}${this.unitSymbol}`
    },
  },
})
