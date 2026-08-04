/*
 * OpenWeather API 요청과 받아온 Location 및 Weather 객체의 정규화를 담당합니다.
 */

import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://api.openweathermap.org',
  timeout: 10_000,
})

const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY || import.meta.env.API_KEY //GET ENV API KEY

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

// Geocoding 응답에서 필요한 값만 정제하는 함수
const normalizeLocation = (location) => ({
  name: location.local_names?.ko ?? location.name, //한글 지역 정보가 있으면 사용
  englishName: location.name, //없으면 기본 영어 이름 사용
  state: location.state ?? '', //상세 지역구 정보
  country: location.country, //국가
  lat: location.lat, //위도
  lon: location.lon, //경도
})

// Current Weather 응답에서 필요한 값만 정제하는 함수
const normalizeCurrentWeather = (weather) => {
  const condition = weather.weather?.[0] ?? {}
  return {
    temp: weather.main?.temp ?? null, //현재 온도
    feelsLike: weather.main?.feels_like ?? null, // 체감 온도
    status: condition.description ?? condition.main ?? '정보 없음', //한글 상태
    statusGroup: condition.main ?? '', //영어 상태 -> 이모지 매핑이나 배경등에 사용됩니다 weatherVisual
    icon: condition.icon ?? '', // Weather Icon : 낮/밤을 판별하는데 사용합니다
    humidity: weather.main?.humidity ?? null, //습도
    pressure: weather.main?.pressure ?? null, //기압
    windSpeed: weather.wind?.speed ?? null, //풍속
    windDegree: weather.wind?.deg ?? null, //풍향
    visibility: weather.visibility ?? null, //가시거리
    clouds: weather.clouds?.all ?? null, //구름량
    rainLastHour: weather.rain?.['1h'] ?? null, //1시간 강수량
    snowLastHour: weather.snow?.['1h'] ?? null, //1시간 적설량
    sunset: weather.sys?.sunset ? weather.sys.sunset * 1000 : null, //일몰
    timezoneOffset: weather.timezone ?? 0, // TIMEZONE 정보 -> 해외 도시 시간 보정용
    fetchedAt: Date.now(), // Fetch Time 저장

    // 사용하지 않는 필드 정리
    // providerId: weather.id ?? null,
    // providerName: weather.name ?? '',
    // providerCountry: weather.sys?.country ?? '',
    // tempMin: weather.main?.temp_min ?? null,
    // tempMax: weather.main?.temp_max ?? null,
    // description: condition.description ?? '현재 날씨 설명이 제공되지 않습니다.',
    // windGust: weather.wind?.gust ?? null,
    // observedAt: weather.dt ? weather.dt * 1000 : null,
    // sunrise: weather.sys?.sunrise ? weather.sys.sunrise * 1000 : null,
  }
}

// 검색어 -> 지역 정보를 API 서버에 요청하는 함수
export const searchLocations = async (query, { limit = 10 } = {}) => {
  const locations = await request('/geo/1.0/direct', {
    q: query,
    limit,
  })

  return locations.map(normalizeLocation)
}

// location -> currentWeather을 요청하는 함수
export const getCurrentWeather = async ({ lat, lon }) => {
  const weather = await request('/data/2.5/weather', {
    lat,
    lon,
    units: 'metric',
    lang: 'kr',
  })

  return normalizeCurrentWeather(weather)
}
