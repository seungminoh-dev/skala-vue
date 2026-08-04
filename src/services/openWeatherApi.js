// AI GENERATED CODE: OpenWeather 요청과 Raw JSON 정규화만 담당하는 단순 통신 모듈입니다.

import axios from 'axios'

const API_BASE_URL = 'https://api.openweathermap.org'
const REQUEST_TIMEOUT_MS = 10_000

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
})

const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY || import.meta.env.API_KEY

const requireApiKey = () => {
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new Error('OpenWeather API Key가 설정되지 않았습니다.')
  }

  return apiKey
}

const request = async (path, params) => {
  const response = await apiClient.get(path, {
    params: {
      ...params,
      appid: requireApiKey(),
    },
  })

  return response.data
}

const normalizeLocation = (location) => ({
  // [사용] Geocoding 표시명: 한국어 이름이 있으면 우선하고, 없으면 기본 이름을 사용합니다.
  name: location.local_names?.ko ?? location.name,
  // [사용] 영문 도시명: 사람이 읽기 쉬운 URL slug를 만드는 원본 값입니다.
  englishName: location.name,
  // [사용] 주·도·광역 행정구역명: 같은 이름의 도시를 화면에서 구분합니다.
  state: location.state ?? '',
  // [사용] ISO 3166-1 alpha-2 국가 코드: 지역 표시와 URL slug에 사용합니다.
  country: location.country,
  // [사용] 위도·경도(십진수 degree): 선택한 도시의 실제 날씨 요청에 사용합니다.
  lat: location.lat,
  lon: location.lon,
  // [사용] 위치 데이터 출처: Geocoding 검색 결과와 현재 위치를 구분합니다.
  source: 'geocoding',
})

const normalizeCurrentWeather = (weather) => {
  const condition = weather.weather?.[0] ?? {}

  return {
    // [미사용] OpenWeather 내부 도시 ID입니다. 자체 UUID를 쓰므로 현재 정리 후보입니다.
    providerId: weather.id ?? null,
    // [등록 시 사용] OpenWeather 도시명입니다. 현재 위치 등록의 표시명·slug 보정에 사용합니다.
    providerName: weather.name ?? '',
    // [등록 시 사용] ISO 3166-1 alpha-2 국가 코드입니다. 검색 후보에 국가가 없을 때 보완합니다.
    providerCountry: weather.sys?.country ?? '',

    // [사용, °C] 현재·체감·최저·최고 온도입니다. units=metric 요청이므로 섭씨로 수신합니다.
    temp: weather.main?.temp ?? null,
    feelsLike: weather.main?.feels_like ?? null,
    tempMin: weather.main?.temp_min ?? null,
    tempMax: weather.main?.temp_max ?? null,

    // [사용] 현지화된 날씨 설명입니다. 카드·상세 화면의 상태 문구로 표시합니다.
    status: condition.description ?? condition.main ?? '정보 없음',
    // [사용] Clear/Clouds/Rain 같은 날씨 분류이며 배경과 Unicode 아이콘 선택 기준입니다.
    statusGroup: condition.main ?? '',
    // [미사용] OpenWeather 날씨 상태 숫자 코드입니다. statusGroup만 쓰므로 현재 정리 후보입니다.
    conditionId: condition.id ?? null,
    // [사용] `01d`, `01n` 형식 아이콘 코드이며 현재는 주간(d)·야간(n) 판별에 사용합니다.
    icon: condition.icon ?? '',
    // [중복 검토] 상세 설명입니다. 현재 status와 같은 값일 수 있으며 상세 Hero에서 사용합니다.
    description: condition.description ?? '현재 날씨 설명이 제공되지 않습니다.',

    // [사용, %] 상대 습도입니다.
    humidity: weather.main?.humidity ?? null,
    // [사용, hPa] 해수면 기준 대기압입니다.
    pressure: weather.main?.pressure ?? null,
    // [사용, m/s] 풍속입니다. units=metric 기준입니다.
    windSpeed: weather.wind?.speed ?? null,
    // [사용, degree] 북쪽 0° 기준 풍향입니다.
    windDegree: weather.wind?.deg ?? null,
    // [사용, m/s·선택 값] 돌풍 속도이며 응답에 없을 수 있습니다.
    windGust: weather.wind?.gust ?? null,
    // [사용, m] 가시거리입니다. 화면에서는 km로 변환합니다.
    visibility: weather.visibility ?? null,
    // [사용, %] 전운량입니다.
    clouds: weather.clouds?.all ?? null,
    // [사용, mm·선택 값] 최근 1시간 강수량과 적설량이며 응답에 없을 수 있습니다.
    rainLastHour: weather.rain?.['1h'] ?? null,
    snowLastHour: weather.snow?.['1h'] ?? null,

    // [사용, ms] 관측 시각·일출·일몰의 Unix 초 값을 JS Date용 밀리초로 변환합니다.
    observedAt: weather.dt ? weather.dt * 1000 : null,
    sunrise: weather.sys?.sunrise ? weather.sys.sunrise * 1000 : null,
    sunset: weather.sys?.sunset ? weather.sys.sunset * 1000 : null,
    // [사용, second] UTC 기준 현지 시차이며 관측·일출·일몰 현지 시각 계산에 사용합니다.
    timezoneOffset: weather.timezone ?? 0,
    // [사용, ms] API 필드가 아닌 수신 시각이며 2시간 Refresh 판정과 갱신 표시에 사용합니다.
    fetchedAt: Date.now(),
  }
}

export const searchLocations = async (query, { limit = 5 } = {}) => {
  const locations = await request('/geo/1.0/direct', {
    q: query,
    limit,
  })

  return locations.map(normalizeLocation)
}

export const getCurrentWeather = async ({ lat, lon }) => {
  const weather = await request('/data/2.5/weather', {
    lat,
    lon,
    units: 'metric',
    lang: 'kr',
  })

  return normalizeCurrentWeather(weather)
}
