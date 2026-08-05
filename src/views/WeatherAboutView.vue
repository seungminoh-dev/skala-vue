<script setup>
import { RouterLink } from 'vue-router'

const features = [
  {
    icon: '⌖',
    title: '내 위치와 관심 지역',
    description: '현재 위치나 국내·해외 도시를 등록하고 대표 지역을 지정할 수 있습니다.',
  },
  {
    icon: '◷',
    title: '시간별·주간 예보',
    description: '현재 시각 이후 12시간의 날씨 예보와 7일 예보를 확인합니다.',
  },
  {
    icon: '°',
    title: '개인화된 표시',
    description: '다양한 개인화된 설정을 제공합니다.',
  },
]
</script>

<template>
  <ElCard class="about-view route-card" shadow="never" aria-labelledby="about-title">
    <section class="about-hero weather-surface">
      <p class="about-kicker">ABOUT TODAY WEATHER</p>
      <h1 id="about-title">원하는 지역의 날씨를<br />한 화면에서 확인하세요</h1>
      <p class="about-description">
        현재 날씨와 예보를 한 곳에서 확인할 수 있습니다. 자주 확인하는 지역을 등록하고, 내 지역의
        날씨를 빠르게 확인하세요.
      </p>
    </section>

    <section class="feature-section" aria-labelledby="feature-title">
      <h2 id="feature-title">서비스 기능</h2>
      <div class="feature-grid">
        <ElCard
          v-for="feature in features"
          :key="feature.title"
          class="feature-card weather-surface"
          shadow="never"
        >
          <span class="feature-icon" aria-hidden="true">{{ feature.icon }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </ElCard>
      </div>
    </section>

    <div class="data-policy weather-surface">
      <div>
        <strong>Data policy</strong>
        <p>교육용으로 제작되었습니다. API: OpenWeather, Open-Meteo 제공, 배경 이미지: PIXABAY</p>
      </div>
      <div class="data-tags">
        <ElTag effect="plain">PIXABAY</ElTag>
        <ElTag effect="plain">OpenWeather</ElTag>
        <ElTag effect="plain">Open-Meteo Forecast</ElTag>
      </div>
    </div>

    <RouterLink class="home-link route-home-link" :to="{ name: 'home' }">
      ← 홈으로 돌아가기
    </RouterLink>
  </ElCard>
</template>

<style scoped>
.about-hero {
  padding: clamp(1.5rem, 4vw, 3rem);
  border-radius: var(--weather-radius-hero);
}

.about-kicker {
  color: var(--weather-accent-text);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

h1 {
  margin-top: 0.75rem;
  color: var(--weather-on-panel);
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 850;
  line-height: 1.03;
  letter-spacing: -0.055em;
}

.about-description {
  max-width: 700px;
  margin-top: 1.5rem;
  color: var(--weather-on-panel-muted);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}

.feature-section {
  margin-top: 1.5rem;
}

.feature-section > h2 {
  margin-bottom: 1rem;
  color: var(--weather-on-panel);
  font-size: 22px;
  font-weight: 850;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  border-radius: var(--weather-radius-surface);
}

.feature-card > :deep(.el-card__body) {
  padding: 1.25rem;
}

.feature-icon {
  display: grid;
  width: 44px;
  height: 44px;
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
  font-size: 22px;
  font-weight: 900;
  place-items: center;
}

.feature-card h3 {
  margin-top: 1rem;
  color: var(--weather-on-panel);
  font-size: 17px;
  font-weight: 850;
}

.feature-card p {
  margin-top: 0.5rem;
  color: var(--weather-on-panel-muted);
  font-size: 14px;
}

.data-policy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--weather-radius-surface);
}

.data-policy strong {
  color: var(--weather-on-panel);
  font-size: 14px;
  font-weight: 850;
}

.data-policy p {
  margin-top: 0.15rem;
  color: var(--weather-on-panel-muted);
  font-size: 12px;
}

.data-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.home-link {
  margin-top: 1.5rem;
}

@media (max-width: 767px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .data-policy {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
