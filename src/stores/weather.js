import { defineStore } from 'pinia'
import { current } from '@/services/openWeatherApi.js'
import { forecast } from '@/services/openMeteoApi.js'

const STORAGE_KEY = 'weather-dashboard:production'
const CURRENT_TTL = 2 * 60 * 60 * 1000
const FORECAST_TTL = 60 * 60 * 1000
const forecastRequests = new Map()

const record = (state, id) => {
  const location = state.locations[id]
  if (!location) return null

  return {
    ...location,
    ...state.currentById[id],
    forecast: state.forecastById[id] ?? null,
  }
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    locationIds: [],
    locations: {},
    currentById: {},
    forecastById: {},
    loaded: false,
  }),

  getters: {
    weatherList: (state) => state.locationIds.map((id) => record(state, id)).filter(Boolean),
    weather: (state) => (id) => record(state, id),
  },

  actions: {
    load() {
      if (this.loaded) return

      try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')

        if (saved) {
          this.locationIds = saved.locationIds ?? []
          this.locations = saved.locations ?? {}
          this.currentById = saved.currentById ?? {}
        }
      } catch (error) {
        console.error('[Weather] 저장 데이터를 읽지 못했습니다.', error)
      } finally {
        this.loaded = true
      }
    },

    save() {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            locationIds: this.locationIds,
            locations: this.locations,
            currentById: this.currentById,
          }),
        )
      } catch (error) {
        console.error('[Weather] 데이터를 저장하지 못했습니다.', error)
      }
    },

    add(location, weather) {
      const saved = this.locations[location.id]
      const moved = saved && (saved.lat !== location.lat || saved.lon !== location.lon)

      this.locations[location.id] = {
        ...location,
        addedAt: saved?.addedAt ?? Date.now(),
      }
      this.currentById[location.id] = weather
      if (moved) delete this.forecastById[location.id]

      if (!this.locationIds.includes(location.id)) {
        this.locationIds.push(location.id)
      }

      this.save()
      return record(this.$state, location.id)
    },

    remove(id) {
      this.locationIds = this.locationIds.filter((locationId) => locationId !== id)
      delete this.locations[id]
      delete this.currentById[id]
      delete this.forecastById[id]
      this.save()
    },

    async refresh({ staleOnly = false } = {}) {
      const now = Date.now()
      const ids = staleOnly
        ? this.locationIds.filter((id) => {
            const fetchedAt = this.currentById[id]?.fetchedAt
            return !fetchedAt || now - fetchedAt >= CURRENT_TTL
          })
        : [...this.locationIds]
      const result = { success: 0, failed: 0 }

      for (const id of ids) {
        try {
          this.currentById[id] = await current(this.locations[id])
          result.success += 1
        } catch (error) {
          result.failed += 1
          console.error(`[Weather] ${this.locations[id]?.name ?? id} 갱신에 실패했습니다.`, error)
        }
      }

      if (result.success) this.save()
      return result
    },

    async loadForecast(id, force = false) {
      const location = this.locations[id]
      if (!location) throw new Error('등록된 도시를 찾을 수 없습니다.')

      const cached = this.forecastById[id]
      if (!force && cached && Date.now() - cached.fetchedAt < FORECAST_TTL) return cached

      if (forecastRequests.has(id)) return forecastRequests.get(id)

      const { lat, lon } = location
      const request = forecast(location)
        .then((data) => {
          const latest = this.locations[id]

          if (latest?.lat === lat && latest?.lon === lon) this.forecastById[id] = data
          return data
        })
        .finally(() => {
          if (forecastRequests.get(id) === request) forecastRequests.delete(id)
        })

      forecastRequests.set(id, request)
      return request
    },
  },
})
