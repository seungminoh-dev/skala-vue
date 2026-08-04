// AI GENERATED CODE: 날씨 배열 저장과 세 가지 Refresh 흐름만 관리하는 단순 Pinia Store입니다.

import { defineStore } from 'pinia'
import { getCurrentWeather, searchLocations } from '@/services/openWeatherApi.js'

const STORAGE_KEY = 'weather-dashboard:v1'

const hasLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

const createCityId = (weather) => {
  const englishName = weather.englishName || weather.providerName || weather.name || ''
  const normalizedName = String(englishName)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return (normalizedName || String(weather.providerId || 'city')).slice(0, 24).replace(/-+$/g, '')
}

const withDisplayFields = (weather) => {
  const weatherFields = { ...weather }
  delete weatherFields.key
  delete weatherFields.slug

  return {
    ...weatherFields,
    id: createCityId(weather),
    region: weather.region || [weather.state, weather.country].filter(Boolean).join(' · '),
  }
}

// 이전 객체형 저장 데이터는 한 번만 날씨 배열로 변환해 기존 등록 도시를 보존합니다.
const parseStoredWeatherList = (storedData) => {
  if (Array.isArray(storedData)) {
    return storedData.map(withDisplayFields)
  }

  if (Array.isArray(storedData?.registeredLocations)) {
    const migratedWeather = storedData.registeredLocations.map((location) => ({
      ...location,
      ...(storedData.weatherByKey?.[location.key] ?? {}),
    }))

    return migratedWeather.map(withDisplayFields)
  }

  return []
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    weatherList: [],
    hydrated: false,
  }),

  actions: {
    hydrate() {
      if (this.hydrated) return

      try {
        const storedData = hasLocalStorage()
          ? JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
          : []

        this.weatherList = parseStoredWeatherList(storedData)
        this.persist()
      } catch (error) {
        console.error('[Weather] localStorage 데이터를 읽지 못했습니다.', error)
        this.weatherList = []
      } finally {
        this.hydrated = true
      }
    },

    persist() {
      if (!hasLocalStorage()) return

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.weatherList))
      } catch (error) {
        console.error('[Weather] localStorage 데이터를 저장하지 못했습니다.', error)
      }
    },

    async searchLocationCandidates(query) {
      const normalizedQuery = query.trim()
      if (normalizedQuery.length < 2) return []

      return searchLocations(normalizedQuery)
    },

    async registerLocation(candidate) {
      this.hydrate()

      const currentWeather = await getCurrentWeather(candidate)
      const name =
        candidate.source === 'geolocation'
          ? currentWeather.providerName || candidate.name
          : candidate.name
      const englishName =
        candidate.source === 'geolocation'
          ? currentWeather.providerName || candidate.englishName || candidate.name
          : candidate.englishName || candidate.name
      const country = candidate.country || currentWeather.providerCountry || ''
      const location = {
        ...candidate,
        ...currentWeather,
        id: createCityId({ ...candidate, ...currentWeather, name, englishName }),
        name,
        englishName,
        country,
        lat: Number(candidate.lat),
        lon: Number(candidate.lon),
        region: [candidate.state, country].filter(Boolean).join(' · '),
        addedAt: Date.now(),
      }

      this.weatherList.push(location)
      this.persist()

      return { status: 'registered', location }
    },

    async refreshWeather(id) {
      const index = this.weatherList.findIndex((weather) => weather.id === id)
      if (index === -1) throw new Error('등록된 도시를 찾을 수 없습니다.')

      const currentWeather = await getCurrentWeather(this.weatherList[index])
      this.weatherList[index] = {
        ...this.weatherList[index],
        ...currentWeather,
      }
      this.persist()

      return this.weatherList[index]
    },

    async refreshLocations(locations) {
      const result = { success: 0, failed: 0 }

      for (const location of locations) {
        try {
          await this.refreshWeather(location.id)
          result.success += 1
        } catch (error) {
          result.failed += 1
          console.error(`[Weather] ${location.name} 갱신에 실패했습니다.`, error)
        }
      }

      return result
    },

    refreshStaleWeather() {
      this.hydrate()
      const now = Date.now()
      const staleLocations = this.weatherList.filter(
        (weather) => !weather.fetchedAt || now - weather.fetchedAt >= 2 * 60 * 60 * 1000,
      )

      return this.refreshLocations(staleLocations)
    },

    refreshAllWeather() {
      this.hydrate()
      return this.refreshLocations([...this.weatherList])
    },

    removeLocation(id) {
      this.weatherList = this.weatherList.filter((weather) => weather.id !== id)
      this.persist()
    },
  },
})
