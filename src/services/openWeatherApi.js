// AI GENERATED CODE: OpenWeather의 Geocoding 및 Current Weather 요청과 응답 정규화를 담당합니다.

import axios from 'axios'

const API_BASE_URL = 'https://api.openweathermap.org'
const REQUEST_TIMEOUT_MS = 10_000

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
})

export class OpenWeatherApiError extends Error {
  constructor(message, { code = 'UNKNOWN', status = null, retryAfter = null } = {}) {
    super(message)
    this.name = 'OpenWeatherApiError'
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY || import.meta.env.API_KEY

export const hasOpenWeatherApiKey = () => Boolean(getApiKey())

const requireApiKey = () => {
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new OpenWeatherApiError('OpenWeather API Key가 설정되지 않았습니다.', {
      code: 'API_KEY_MISSING',
    })
  }

  return apiKey
}

const toApiError = (error) => {
  if (error instanceof OpenWeatherApiError) {
    return error
  }

  const status = error.response?.status ?? null
  const responseCode = Number(error.response?.data?.cod ?? status) || null
  const retryAfterHeader = Number(error.response?.headers?.['retry-after'])
  const retryAfter = Number.isFinite(retryAfterHeader) ? retryAfterHeader * 1000 : null
  const message =
    error.response?.data?.message || error.message || '날씨 정보를 가져오지 못했습니다.'

  return new OpenWeatherApiError(message, {
    code: responseCode ? `HTTP_${responseCode}` : 'NETWORK_ERROR',
    status,
    retryAfter,
  })
}

const request = async (path, params, signal) => {
  try {
    const response = await apiClient.get(path, {
      params: {
        ...params,
        appid: requireApiKey(),
      },
      signal,
    })

    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

const normalizeLocation = (location) => ({
  name: location.local_names?.ko ?? location.name,
  englishName: location.name,
  state: location.state ?? '',
  country: location.country,
  lat: location.lat,
  lon: location.lon,
  source: 'geocoding',
})

const normalizeCurrentWeather = (weather) => {
  const condition = weather.weather?.[0] ?? {}

  return {
    providerId: weather.id ?? null,
    providerName: weather.name ?? '',
    providerCountry: weather.sys?.country ?? '',
    temp: weather.main?.temp ?? null,
    feelsLike: weather.main?.feels_like ?? null,
    tempMin: weather.main?.temp_min ?? null,
    tempMax: weather.main?.temp_max ?? null,
    status: condition.description ?? condition.main ?? '정보 없음',
    statusGroup: condition.main ?? '',
    conditionId: condition.id ?? null,
    icon: condition.icon ?? '',
    description: condition.description ?? '현재 날씨 설명이 제공되지 않습니다.',
    humidity: weather.main?.humidity ?? null,
    pressure: weather.main?.pressure ?? null,
    windSpeed: weather.wind?.speed ?? null,
    windDegree: weather.wind?.deg ?? null,
    windGust: weather.wind?.gust ?? null,
    visibility: weather.visibility ?? null,
    clouds: weather.clouds?.all ?? null,
    rainLastHour: weather.rain?.['1h'] ?? null,
    snowLastHour: weather.snow?.['1h'] ?? null,
    observedAt: weather.dt ? weather.dt * 1000 : null,
    sunrise: weather.sys?.sunrise ? weather.sys.sunrise * 1000 : null,
    sunset: weather.sys?.sunset ? weather.sys.sunset * 1000 : null,
    timezoneOffset: weather.timezone ?? 0,
    fetchedAt: Date.now(),
  }
}

export const searchLocations = async (query, { limit = 5, signal } = {}) => {
  const locations = await request(
    '/geo/1.0/direct',
    {
      q: query,
      limit,
    },
    signal,
  )

  return locations.map(normalizeLocation)
}

export const getCurrentWeather = async ({ lat, lon, signal }) => {
  const weather = await request(
    '/data/2.5/weather',
    {
      lat,
      lon,
      units: 'metric',
      lang: 'kr',
    },
    signal,
  )

  return normalizeCurrentWeather(weather)
}
