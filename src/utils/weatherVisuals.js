// AI GENERATED CODE: OpenWeather 상태와 주야간 값을 가벼운 Unicode 날씨 기호로 변환합니다.

export const getWeatherEmoji = ({ statusGroup = '', icon = '', temp = null } = {}) => {
  const normalizedStatus = statusGroup.toLocaleLowerCase()
  const isNight = icon.endsWith('n')

  if (normalizedStatus.includes('thunder')) return '⛈️'
  if (normalizedStatus.includes('drizzle')) return '🌦️'
  if (normalizedStatus.includes('rain')) return '🌧️'
  if (normalizedStatus.includes('snow')) return '🌨️'
  if (
    normalizedStatus.includes('mist') ||
    normalizedStatus.includes('fog') ||
    normalizedStatus.includes('haze') ||
    normalizedStatus.includes('smoke') ||
    normalizedStatus.includes('dust')
  ) {
    return '🌫️'
  }
  if (normalizedStatus.includes('cloud')) return isNight ? '☁️' : '⛅'
  if (isNight) return '🌙'
  if (Number(temp) >= 33) return '🌞'
  return '☀️'
}
