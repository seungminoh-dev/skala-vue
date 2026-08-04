/*
  날씨 상태를 받아와 이모지, 배경으로 반환해주는 모듈입니다.
*/

import heatwaveBackground from '@/assets/bg/optimized/heatwave.jpg'
import rainBackground from '@/assets/bg/optimized/rain.jpg'
import snowBackground from '@/assets/bg/optimized/snow.jpg'
import sunnyBackground from '@/assets/bg/optimized/sunny.jpg'

const HEAT_THRESHOLD = 35 // 폭염을 판단하는 온도 기준 상수

// 날씨에 맞는 배경 이미지와 화면 Tone을 반환합니다.
export const resolveWeatherCanvas = (weather = null) => {
  const wStatus = String(weather?.statusGroup ?? '').toLocaleLowerCase()

  if (wStatus.includes('snow')) {
    return { background: snowBackground, tone: 'weather-tone-snow' }
  }

  if (wStatus.includes('rain') || wStatus.includes('drizzle') || wStatus.includes('thunder')) {
    return { background: rainBackground, tone: 'weather-tone-rain' }
  }

  if (Number(weather?.temp) >= HEAT_THRESHOLD) {
    return { background: heatwaveBackground, tone: 'weather-tone-heat' }
  }

  return { background: sunnyBackground, tone: 'weather-tone-sunny' }
}

// 날씨와 주야간 상태에 맞는 Unicode 기호를 반환합니다.
export const getWeatherEmoji = ({ statusGroup = '', icon = '', temp = null } = {}) => {
  const wStatus = statusGroup.toLocaleLowerCase()
  const isNight = icon.endsWith('n')

  if (wStatus.includes('thunder')) return '⛈️'
  if (wStatus.includes('drizzle')) return '🌦️'
  if (wStatus.includes('rain')) return '🌧️'
  if (wStatus.includes('snow')) return '🌨️'
  if (
    wStatus.includes('mist') ||
    wStatus.includes('fog') ||
    wStatus.includes('haze') ||
    wStatus.includes('smoke') ||
    wStatus.includes('dust')
  ) {
    return '🌫️'
  }
  if (wStatus.includes('cloud')) return isNight ? '☁️' : '⛅'
  if (isNight) return '🌙'
  if (Number(temp) >= HEAT_THRESHOLD) return '🌞'
  return '☀️'
}
