// AI GENERATED CODE: 등록 도시·날씨 Cache·호출 제한·localStorage를 관리하는 Pinia Store입니다.

import { defineStore } from 'pinia'
import { findKoreanCities } from '@/data/koreanCities.js'
import {
  getCurrentWeather,
  hasOpenWeatherApiKey,
  OpenWeatherApiError,
  searchLocations,
} from '@/services/openWeatherApi.js'

const STORAGE_KEY = 'weather-dashboard:v1'
const STORAGE_SCHEMA_VERSION = 1
const WEATHER_TTL_MS = 2 * 60 * 60 * 1000
const GEOCODING_TTL_MS = 7 * 24 * 60 * 60 * 1000
const REQUEST_WINDOW_MS = 60 * 1000
const REQUEST_LIMIT_PER_WINDOW = 45
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60 * 1000
const MAX_REGISTERED_LOCATIONS = 20

export const createLocationKey = ({ lat, lon }) =>
  `geo:${Number(lat).toFixed(4)}:${Number(lon).toFixed(4)}`

const toPresetCandidate = (city) => ({
  name: city.name,
  englishName: city.englishName,
  state: city.state,
  country: city.country,
  lat: city.lat,
  lon: city.lon,
  source: 'preset',
  presetId: city.presetId,
})

const isValidStorageSnapshot = (snapshot) =>
  snapshot?.schemaVersion === STORAGE_SCHEMA_VERSION &&
  Array.isArray(snapshot.registeredLocations) &&
  snapshot.weatherByKey &&
  typeof snapshot.weatherByKey === 'object'

const hasLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export class WeatherStoreError extends Error {
  constructor(message, { code = 'STORE_ERROR', retryAt = null } = {}) {
    super(message)
    this.name = 'WeatherStoreError'
    this.code = code
    this.retryAt = retryAt
  }
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    registeredLocations: [],
    weatherByKey: {},
    geocodingCache: {},
    requestTimestamps: [],
    selectedLocationKey: null,
    rateLimit: {
      blockedUntil: null,
      message: '',
    },
    hydrated: false,
  }),

  getters: {
    registeredCount: (state) => state.registeredLocations.length,

    weatherList: (state) =>
      state.registeredLocations.map((location) => {
        const weather = state.weatherByKey[location.key] ?? {}

        return {
          ...location,
          ...weather,
          id: location.key,
          region: [location.state, location.country].filter(Boolean).join(' · '),
        }
      }),

    selectedLocation(state) {
      return this.weatherList.find((location) => location.key === state.selectedLocationKey) ?? null
    },
  },

  actions: {
    hydrate() {
      if (this.hydrated) {
        return
      }

      if (!hasLocalStorage()) {
        this.hydrated = true
        return
      }

      try {
        const serializedSnapshot = window.localStorage.getItem(STORAGE_KEY)

        if (!serializedSnapshot) {
          this.hydrated = true
          return
        }

        const snapshot = JSON.parse(serializedSnapshot)

        if (!isValidStorageSnapshot(snapshot)) {
          window.localStorage.removeItem(STORAGE_KEY)
          this.hydrated = true
          return
        }

        this.registeredLocations = snapshot.registeredLocations
        this.weatherByKey = snapshot.weatherByKey
        this.geocodingCache = snapshot.geocodingCache ?? {}
        this.selectedLocationKey = snapshot.selectedLocationKey ?? null
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      } finally {
        this.hydrated = true
      }
    },

    persist() {
      if (!hasLocalStorage()) {
        return
      }

      const snapshot = {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        registeredLocations: this.registeredLocations,
        weatherByKey: this.weatherByKey,
        geocodingCache: this.geocodingCache,
        selectedLocationKey: this.selectedLocationKey,
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    },

    hasLocation(candidate) {
      const locationKey = createLocationKey(candidate)
      return this.registeredLocations.some((location) => location.key === locationKey)
    },

    pruneRequestTimestamps(now = Date.now()) {
      this.requestTimestamps = this.requestTimestamps.filter(
        (timestamp) => now - timestamp < REQUEST_WINDOW_MS,
      )
    },

    reserveRequestSlot() {
      const now = Date.now()
      this.pruneRequestTimestamps(now)

      if (this.rateLimit.blockedUntil && this.rateLimit.blockedUntil > now) {
        throw new WeatherStoreError(
          this.rateLimit.message || 'API 호출 제한으로 잠시 후 다시 시도해 주세요.',
          {
            code: 'RATE_LIMITED',
            retryAt: this.rateLimit.blockedUntil,
          },
        )
      }

      if (this.requestTimestamps.length >= REQUEST_LIMIT_PER_WINDOW) {
        const retryAt = this.requestTimestamps[0] + REQUEST_WINDOW_MS
        throw new WeatherStoreError('안전 호출 한도에 도달해 요청을 잠시 대기합니다.', {
          code: 'LOCAL_RATE_LIMIT',
          retryAt,
        })
      }

      this.requestTimestamps.push(now)
    },

    handleApiError(error) {
      if (!(error instanceof OpenWeatherApiError) || error.status !== 429) {
        throw error
      }

      const cooldown = Math.max(error.retryAfter ?? 0, DEFAULT_RATE_LIMIT_COOLDOWN_MS)
      this.rateLimit = {
        blockedUntil: Date.now() + cooldown,
        message: 'OpenWeather 호출 한도를 초과해 마지막 저장 데이터를 유지합니다.',
      }

      throw new WeatherStoreError(this.rateLimit.message, {
        code: 'RATE_LIMITED',
        retryAt: this.rateLimit.blockedUntil,
      })
    },

    requireApiKey() {
      if (!hasOpenWeatherApiKey()) {
        throw new WeatherStoreError('OpenWeather API Key가 설정되지 않았습니다.', {
          code: 'API_KEY_MISSING',
        })
      }
    },

    async searchLocationCandidates(query, { forceRemote = false } = {}) {
      this.hydrate()

      const normalizedQuery = query.trim()
      if (normalizedQuery.length < 2) {
        return findKoreanCities(normalizedQuery).map(toPresetCandidate)
      }

      const presetMatches = findKoreanCities(normalizedQuery)
      if (presetMatches.length > 0 && !forceRemote) {
        return presetMatches.map(toPresetCandidate)
      }

      const cacheKey = normalizedQuery.toLocaleLowerCase()
      const cachedSearch = this.geocodingCache[cacheKey]
      if (cachedSearch?.expiresAt > Date.now()) {
        return cachedSearch.locations
      }

      this.requireApiKey()
      this.reserveRequestSlot()

      try {
        const locations = await searchLocations(normalizedQuery)
        this.geocodingCache[cacheKey] = {
          locations,
          expiresAt: Date.now() + GEOCODING_TTL_MS,
        }
        this.persist()
        return locations
      } catch (error) {
        return this.handleApiError(error)
      }
    },

    async registerLocation(candidate) {
      this.hydrate()

      const locationKey = createLocationKey(candidate)
      const existingLocation = this.registeredLocations.find(
        (location) => location.key === locationKey,
      )

      if (existingLocation) {
        this.selectedLocationKey = existingLocation.key
        this.persist()
        return { status: 'duplicate', location: existingLocation }
      }

      if (this.registeredLocations.length >= MAX_REGISTERED_LOCATIONS) {
        throw new WeatherStoreError(
          `도시는 최대 ${MAX_REGISTERED_LOCATIONS}개까지 등록할 수 있습니다.`,
          {
            code: 'MAX_LOCATIONS',
          },
        )
      }

      this.requireApiKey()
      this.reserveRequestSlot()

      try {
        const weather = await getCurrentWeather(candidate)
        const location = {
          key: locationKey,
          name:
            candidate.source === 'geolocation'
              ? weather.providerName || candidate.name
              : candidate.name,
          englishName: candidate.englishName ?? candidate.name,
          state: candidate.state ?? '',
          country: candidate.country || weather.providerCountry || '',
          lat: Number(candidate.lat),
          lon: Number(candidate.lon),
          source: candidate.source ?? 'geocoding',
          accuracy: candidate.accuracy ?? null,
          addedAt: Date.now(),
        }

        this.registeredLocations.push(location)
        this.weatherByKey[locationKey] = {
          ...weather,
          expiresAt: weather.fetchedAt + WEATHER_TTL_MS,
        }
        this.selectedLocationKey = locationKey
        this.persist()

        return { status: 'registered', location }
      } catch (error) {
        return this.handleApiError(error)
      }
    },

    isWeatherFresh(locationKey, now = Date.now()) {
      return (this.weatherByKey[locationKey]?.expiresAt ?? 0) > now
    },

    async ensureWeather(locationKey, { force = false } = {}) {
      this.hydrate()

      const location = this.registeredLocations.find((item) => item.key === locationKey)
      if (!location) {
        throw new WeatherStoreError('등록되지 않은 도시입니다.', { code: 'LOCATION_NOT_FOUND' })
      }

      if (!force && this.isWeatherFresh(locationKey)) {
        return this.weatherByKey[locationKey]
      }

      this.requireApiKey()
      this.reserveRequestSlot()

      try {
        const weather = await getCurrentWeather(location)
        this.weatherByKey[locationKey] = {
          ...weather,
          expiresAt: weather.fetchedAt + WEATHER_TTL_MS,
        }
        this.persist()
        return this.weatherByKey[locationKey]
      } catch (error) {
        return this.handleApiError(error)
      }
    },

    async refreshStaleLocations() {
      this.hydrate()
      const staleLocations = this.registeredLocations.filter(
        (location) => !this.isWeatherFresh(location.key),
      )
      const results = []

      for (const location of staleLocations) {
        try {
          const weather = await this.ensureWeather(location.key)
          results.push({ key: location.key, status: 'fulfilled', weather })
        } catch (error) {
          results.push({ key: location.key, status: 'rejected', error })

          if (error.code === 'RATE_LIMITED' || error.code === 'LOCAL_RATE_LIMIT') {
            break
          }
        }
      }

      return results
    },

    removeLocation(locationKey) {
      this.registeredLocations = this.registeredLocations.filter(
        (location) => location.key !== locationKey,
      )
      delete this.weatherByKey[locationKey]

      if (this.selectedLocationKey === locationKey) {
        this.selectedLocationKey = null
      }

      this.persist()
    },
  },
})
