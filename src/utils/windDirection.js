/*
  풍향을 포맷된 문자열로 매핑해주는 모듈입니다.
*/

export const formatWindDirection = (degree, showDegree = false) => {
  if (degree === null || degree === undefined || !Number.isFinite(Number(degree))) {
    return '정보 없음'
  }

  const normalizedDegree = ((Number(degree) % 360) + 360) % 360
  const directions = [
    '북풍↓',
    '북동풍↙',
    '동풍←',
    '남동풍↖',
    '남풍↑',
    '남서풍↗',
    '북서풍↘',
    '북풍↓',
  ]
  const direction = directions[Math.floor(normalizedDegree / 45)]

  return showDegree ? `${direction}(${Math.round(normalizedDegree) % 360}도)` : direction
}
