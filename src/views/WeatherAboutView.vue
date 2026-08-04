<!-- AI GENERATED CODE: 실제 데이터·설정·Cache 정책을 설명하는 Weather Board 소개 화면입니다. -->
<script setup>
import { RouterLink } from 'vue-router'

const features = [
  {
    icon: '⌖',
    title: '내 위치와 관심 지역',
    description: '현재 위치나 국내·해외 도시를 등록하고 메인 지역을 지정할 수 있습니다.',
  },
  {
    icon: '↻',
    title: '안전한 날씨 갱신',
    description: '호출 횟수를 관리하며 오류가 발생하면 마지막 정상 날씨를 유지합니다.',
  },
  {
    icon: '°',
    title: '개인화된 표시',
    description: '섭씨·화씨와 Bright·Dark 화면 모드를 서비스 전체에 동일하게 적용합니다.',
  },
]
</script>

<template>
  <ElCard class="about-view route-card" shadow="never" aria-labelledby="about-title">
    <section class="about-hero weather-surface">
      <p class="about-kicker">ABOUT WEATHER BOARD</p>
      <h1 id="about-title">필요한 지역의 날씨를<br />한 화면에서 확인하세요</h1>
      <p class="about-description">
        OpenWeather의 현재 관측 데이터와 브라우저 저장소를 연결해, 자주 확인하는 지역을 빠르게
        비교하는 반응형 날씨 대시보드입니다.
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
        <p>등록 지역과 마지막 정상 응답은 이 브라우저의 localStorage에 저장됩니다.</p>
      </div>
      <ElTag effect="plain">OpenWeather Current Weather</ElTag>
    </div>

    <RouterLink class="home-link" :to="{ name: 'home' }">
      <ElButton type="primary">메인 대시보드로 돌아가기</ElButton>
    </RouterLink>
  </ElCard>
</template>

<style scoped>
.about-hero {
  padding: clamp(2rem, 7vw, 4.5rem);
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
  font-size: clamp(2.25rem, 7vw, 4.5rem);
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
  margin-top: 2rem;
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

.feature-card :deep(.el-card__body) {
  padding: 1.5rem;
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

.home-link {
  display: inline-flex;
  margin-top: 1.5rem;
  text-decoration: none;
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
