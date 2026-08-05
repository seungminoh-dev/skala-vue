import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.openweathermap.org',
  timeout: 10_000,
})

const slug = (value) =>
  String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const locationId = ({ englishName, name, state, country }) => {
  const parts = [englishName || name, state, country].map(slug).filter(Boolean)
  return [...new Set(parts)].join('-') || 'location'
}

const weatherKind = (main = '') => {
  const value = main.toLocaleLowerCase()

  if (value.includes('thunder')) return 'thunder'
  if (value.includes('rain') || value.includes('drizzle')) return 'rain'
  if (value.includes('snow')) return 'snow'
  if (value.includes('cloud')) return 'clouds'
  if (value.includes('clear')) return 'clear'
  return 'mist'
}

const request = async (path, params) => {
  const apiKey = import.meta.env.API_KEY
  if (!apiKey) throw new Error('OpenWeather API Key가 설정되지 않았습니다.')

  const { data } = await api.get(path, { params: { ...params, appid: apiKey } })
  return data
}

const mapLocation = (raw) => {
  const location = {
    name: raw.local_names?.ko ?? raw.name,
    englishName: raw.name,
    state: raw.state ?? '',
    country: raw.country ?? '',
    lat: Number(raw.lat),
    lon: Number(raw.lon),
  }

  return {
    ...location,
    id: locationId(location),
    region: [location.state, location.country].filter(Boolean).join(' · '),
  }
}

export const search = async (query) => {
  const q = String(query ?? '').trim()
  if (q.length < 2) return []

  const raw = await request('/geo/1.0/direct', { q, limit: 10 })
  return raw.map(mapLocation)
}

export const current = async ({ lat, lon }) => {
  const raw = await request('/data/2.5/weather', {
    lat,
    lon,
    units: 'metric',
    lang: 'kr',
  })
  const condition = raw.weather?.[0] ?? {}

  return {
    temp: raw.main?.temp ?? null,
    feelsLike: raw.main?.feels_like ?? null,
    status: condition.description ?? condition.main ?? '정보 없음',
    kind: weatherKind(condition.main),
    night: condition.icon?.endsWith('n') ?? false,
    humidity: raw.main?.humidity ?? null,
    pressure: raw.main?.pressure ?? null,
    windSpeed: raw.wind?.speed ?? null,
    windDegree: raw.wind?.deg ?? null,
    visibility: raw.visibility ?? null,
    clouds: raw.clouds?.all ?? null,
    rainLastHour: raw.rain?.['1h'] ?? null,
    snowLastHour: raw.snow?.['1h'] ?? null,
    sunset: raw.sys?.sunset ? raw.sys.sunset * 1000 : null,
    timezoneOffset: raw.timezone ?? 0,
    fetchedAt: Date.now(),
  }
}
