/*
날씨 ㅅ
*/

import heatwaveBackground from '@/assets/bg/optimized/heatwave.jpg'
import rainBackground from '@/assets/bg/optimized/rain.jpg'
import snowBackground from '@/assets/bg/optimized/snow.jpg'
import sunnyBackground from '@/assets/bg/optimized/sunny.jpg'

const WEATHER_CANVAS = Object.freeze({
  sunny: Object.freeze({ background: sunnyBackground, tone: 'weather-tone-sunny' }),
  heat: Object.freeze({ background: heatwaveBackground, tone: 'weather-tone-heat' }),
  rain: Object.freeze({ background: rainBackground, tone: 'weather-tone-rain' }),
  snow: Object.freeze({ background: snowBackground, tone: 'weather-tone-snow' }),
})

export const resolveWeatherCanvas = (weather = null) => {
  const normalizedStatus = String(weather?.statusGroup ?? '').toLocaleLowerCase()

  if (normalizedStatus.includes('snow')) {
    return WEATHER_CANVAS.snow
  }

  if (
    normalizedStatus.includes('rain') ||
    normalizedStatus.includes('drizzle') ||
    normalizedStatus.includes('thunder')
  ) {
    return WEATHER_CANVAS.rain
  }

  if (Number(weather?.temp) >= 33) {
    return WEATHER_CANVAS.heat
  }

  return WEATHER_CANVAS.sunny
}
