<!-- AI GENERATED CODE: Dashboard 영역을 위한 공통 Glass Surface 컴포넌트입니다. -->
<template>
  <!-- AI CODE: 공통 대시보드 박스를 Element Plus Card로 교체합니다. -->
  <ElCard class="base-card weather-surface" shadow="never">
    <slot>
      <p>BaseDashboardCard Area</p>
    </slot>
  </ElCard>
</template>

<style scoped>
.base-card {
  --el-card-padding: clamp(1.125rem, 3vw, 1.5rem);

  border-radius: var(--weather-radius-hero);
}

.base-card > :deep(.el-card__body) {
  padding: var(--el-card-padding);
}
</style>
