/*
 * AI GENERATED CODE: OpenWeather 요청과 화면에서 사용하는 데이터 정규화를 담당합니다.
 *
 * Geocoding: 표시명(name), id 원본(englishName), 행정구역·국가(state/country), 좌표(lat/lon)
 * 식별 보조: 영문명이 없을 때 providerId, 현재 위치의 이름·국가 보정에 providerName/providerCountry
 * 온도(°C): temp, feelsLike, tempMin, tempMax
 * 날씨 상태: status, statusGroup, icon, description
 * 관측값: humidity(%), pressure(hPa), windSpeed·windGust(m/s), windDegree(°),
 *           visibility(m), clouds(%), rainLastHour·snowLastHour(mm)
 * 시각: observedAt·sunrise·sunset·fetchedAt(ms), timezoneOffset(초)
 */

import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://api.openweathermap.org',
  timeout: 10_000,
})

// 환경 변수에서 API Key를 읽습니다.
const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY || import.meta.env.API_KEY

// 요청 전에 API Key가 있는지 확인합니다.
const requireApiKey = () => {
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new Error('OpenWeather API Key가 설정되지 않았습니다.')
  }

  return apiKey
}

// 공통 Query Parameter를 포함해 OpenWeather에 요청합니다.
const request = async (path, params) => {
  const response = await apiClient.get(path, {
    params: {
      ...params,
      appid: requireApiKey(),
    },
  })

  return response.data
}

// Geocoding 응답에서 도시 등록에 필요한 값만 반환합니다.
const normalizeLocation = (location) => ({
  name: location.local_names?.ko ?? location.name,
  englishName: location.name,
  state: location.state ?? '',
  country: location.country,
  lat: location.lat,
  lon: location.lon,
})

// Current Weather 응답에서 화면과 Refresh에 필요한 값만 반환합니다.
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

// 도시명으로 Geocoding 후보를 조회합니다.
export const searchLocations = async (query, { limit = 5 } = {}) => {
  const locations = await request('/geo/1.0/direct', {
    q: query,
    limit,
  })

  return locations.map(normalizeLocation)
}

// 좌표로 현재 날씨를 조회합니다.
export const getCurrentWeather = async ({ lat, lon }) => {
  const weather = await request('/data/2.5/weather', {
    lat,
    lon,
    units: 'metric',
    lang: 'kr',
  })

  return normalizeCurrentWeather(weather)
}
