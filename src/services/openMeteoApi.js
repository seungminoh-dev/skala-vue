import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.open-meteo.com',
  timeout: 10_000,
})

const WMO = {
  0: ['clear', '맑음'],
  1: ['clear', '대체로 맑음'],
  2: ['clouds', '구름 조금'],
  3: ['clouds', '흐림'],
  45: ['mist', '안개'],
  48: ['mist', '서리 안개'],
  51: ['rain', '약한 이슬비'],
  53: ['rain', '이슬비'],
  55: ['rain', '강한 이슬비'],
  56: ['rain', '약한 어는 이슬비'],
  57: ['rain', '강한 어는 이슬비'],
  61: ['rain', '약한 비'],
  63: ['rain', '비'],
  65: ['rain', '강한 비'],
  66: ['rain', '약한 어는 비'],
  67: ['rain', '강한 어는 비'],
  71: ['snow', '약한 눈'],
  73: ['snow', '눈'],
  75: ['snow', '강한 눈'],
  77: ['snow', '싸락눈'],
  80: ['rain', '약한 소나기'],
  81: ['rain', '소나기'],
  82: ['rain', '강한 소나기'],
  85: ['snow', '약한 눈 소나기'],
  86: ['snow', '강한 눈 소나기'],
  95: ['thunder', '뇌우'],
  96: ['thunder', '우박을 동반한 뇌우'],
  99: ['thunder', '강한 우박 뇌우'],
}

const condition = (code) => {
  const [kind, status] = WMO[code] ?? ['mist', '정보 없음']
  return { code, kind, status }
}

export const forecast = async ({ lat, lon }) => {
  const { data } = await api.get('/v1/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      hourly: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'is_day',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_probability_max',
        'precipitation_sum',
        'sunrise',
        'sunset',
      ].join(','),
      timezone: 'auto',
      forecast_hours: 24,
      forecast_days: 7,
      wind_speed_unit: 'ms',
    },
  })

  const hourly = (data.hourly?.time ?? []).map((time, index) => ({
    time,
    temp: data.hourly.temperature_2m?.[index] ?? null,
    feelsLike: data.hourly.apparent_temperature?.[index] ?? null,
    humidity: data.hourly.relative_humidity_2m?.[index] ?? null,
    rainChance: data.hourly.precipitation_probability?.[index] ?? null,
    precipitation: data.hourly.precipitation?.[index] ?? null,
    windSpeed: data.hourly.wind_speed_10m?.[index] ?? null,
    night: data.hourly.is_day?.[index] === 0,
    ...condition(data.hourly.weather_code?.[index]),
  }))

  const daily = (data.daily?.time ?? []).map((date, index) => ({
    date,
    min: data.daily.temperature_2m_min?.[index] ?? null,
    max: data.daily.temperature_2m_max?.[index] ?? null,
    rainChance: data.daily.precipitation_probability_max?.[index] ?? null,
    precipitation: data.daily.precipitation_sum?.[index] ?? null,
    sunrise: data.daily.sunrise?.[index] ?? null,
    sunset: data.daily.sunset?.[index] ?? null,
    ...condition(data.daily.weather_code?.[index]),
  }))

  return {
    hourly,
    daily,
    timezone: data.timezone,
    timezoneName: data.timezone_abbreviation,
    fetchedAt: Date.now(),
  }
}
