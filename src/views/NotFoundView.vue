<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <ElResult
    class="not-found-view route-card weather-surface"
    icon="warning"
    aria-labelledby="not-found-title"
  >
    <template #title>
      <h1 id="not-found-title">페이지를 찾을 수 없습니다</h1>
    </template>
    <template #sub-title>
      <p class="error-message">
        <strong>{{ route.fullPath }}</strong> 주소가 변경되었거나 존재하지 않습니다.
      </p>
    </template>
    <template #extra>
      <RouterLink class="route-home-link" :to="{ name: 'home' }"> ← 홈으로 돌아가기 </RouterLink>
    </template>
  </ElResult>
</template>

<style scoped>
.not-found-view {
  padding: clamp(2rem, 7vw, 4rem);
  border-radius: var(--weather-radius-hero);
}

.not-found-view :deep(.el-result__icon svg),
.error-code {
  color: var(--weather-accent-text);
}

.error-code {
  font-size: clamp(3.5rem, 12vw, 5rem);
  font-weight: 900;
  line-height: 1;
}

h1 {
  margin-top: 0.75rem;
  color: var(--weather-on-panel);
  font-size: clamp(2rem, 6vw, 2.5rem);
  font-weight: 850;
  line-height: 1.1;
}

.error-message {
  color: var(--weather-on-panel-muted);
  font-size: 16px;
}

.error-message strong {
  color: var(--weather-on-panel);
  font-weight: 800;
  overflow-wrap: anywhere;
}
</style>
