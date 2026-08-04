// AI GENERATED CODE: 좌표 기반 내부 Key와 분리된 사람이 읽기 쉬운 Location URL slug를 생성합니다.

const normalizeSlugSegment = (value) =>
  String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const createShortHash = (value) => {
  let hash = 2166136261

  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(36).slice(0, 5)
}

const createBaseSlug = (location) => {
  const locationName =
    normalizeSlugSegment(location.englishName) ||
    normalizeSlugSegment(location.name) ||
    'location'
  const country = normalizeSlugSegment(location.country)

  return [locationName, country].filter(Boolean).join('-')
}

export const createUniqueLocationSlug = (location, reservedSlugs = []) => {
  const reserved = new Set([...reservedSlugs].map(normalizeSlugSegment))
  const baseSlug = normalizeSlugSegment(location.slug) || createBaseSlug(location)

  if (!reserved.has(baseSlug)) {
    return baseSlug
  }

  const coordinateFingerprint = createShortHash(
    `${Number(location.lat).toFixed(4)}:${Number(location.lon).toFixed(4)}`,
  )
  const fingerprintedSlug = `${baseSlug}-${coordinateFingerprint}`

  if (!reserved.has(fingerprintedSlug)) {
    return fingerprintedSlug
  }

  let suffix = 2
  while (reserved.has(`${fingerprintedSlug}-${suffix}`)) {
    suffix += 1
  }

  return `${fingerprintedSlug}-${suffix}`
}

export const addLocationSlugs = (locations) => {
  const reservedSlugs = new Set()

  return locations.map((location) => {
    const slug = createUniqueLocationSlug(location, reservedSlugs)
    reservedSlugs.add(slug)

    return location.slug === slug ? location : { ...location, slug }
  })
}
