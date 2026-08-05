import heatwaveBackground from '@/assets/bg/optimized/heatwave.jpg'
import rainBackground from '@/assets/bg/optimized/rain.jpg'
import snowBackground from '@/assets/bg/optimized/snow.jpg'
import sunnyBackground from '@/assets/bg/optimized/sunny.jpg'

const HEAT_THRESHOLD = 35

const visuals = {
  clear: {
    emoji: '☀️',
    condition: 'condition-clear',
    filter: 'clear',
    background: sunnyBackground,
    tone: 'weather-tone-sunny',
  },
  clouds: {
    emoji: '⛅',
    condition: 'condition-clouds',
    filter: 'clouds',
    background: sunnyBackground,
    tone: 'weather-tone-sunny',
  },
  rain: {
    emoji: '🌧️',
    condition: 'condition-rain',
    filter: 'rain',
    background: rainBackground,
    tone: 'weather-tone-rain',
  },
  snow: {
    emoji: '🌨️',
    condition: 'condition-snow',
    filter: 'snow',
    background: snowBackground,
    tone: 'weather-tone-snow',
  },
  thunder: {
    emoji: '⛈️',
    condition: 'condition-thunder',
    filter: 'rain',
    background: rainBackground,
    tone: 'weather-tone-rain',
  },
  mist: {
    emoji: '🌫️',
    condition: 'condition-mist',
    filter: 'other',
    background: sunnyBackground,
    tone: 'weather-tone-sunny',
  },
}

export const getVisual = (weather = {}) => {
  if (Number(weather.temp) >= HEAT_THRESHOLD) {
    return {
      ...visuals.clear,
      emoji: '🌞',
      background: heatwaveBackground,
      tone: 'weather-tone-heat',
    }
  }

  const visual = visuals[weather.kind] ?? visuals.mist

  if (!weather.night) return visual
  if (weather.kind === 'clear') return { ...visual, emoji: '🌙' }
  if (weather.kind === 'clouds') return { ...visual, emoji: '☁️' }
  return visual
}
