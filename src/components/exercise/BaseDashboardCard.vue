<template>
  <ElCard class="base-card weather-surface" shadow="never">
    <slot>
      <p>BaseDashboardCard Area</p>
    </slot>
  </ElCard>
</template>

<style scoped>
.base-card {
  --el-card-padding: clamp(1rem, 2vw, 1.25rem);

  border-radius: var(--weather-radius-surface);
}

.base-card > :deep(.el-card__body) {
  padding: var(--el-card-padding);
}
</style>
