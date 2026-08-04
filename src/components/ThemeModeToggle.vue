<!-- AI GENERATED CODE: 설정 Store와 동기화되는 Bright·Dark 화면 모드 제어입니다. -->
<script setup>
import { computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()
const isDarkMode = computed({
  get: () => configStore.isDarkMode,
  set: (isDark) => configStore.setTheme(isDark ? 'dark' : 'bright'),
})

onMounted(() => {
  configStore.hydrate()
})
</script>

<template>
  <div class="theme-mode-toggle">
    <span class="mode-icon" aria-hidden="true">{{ isDarkMode ? '☾' : '☀' }}</span>
    <ElSwitch
      v-model="isDarkMode"
      class="theme-switch"
      :aria-label="isDarkMode ? 'Bright 모드로 변경' : 'Dark 모드로 변경'"
    />
    <span class="mode-name">{{ isDarkMode ? 'Dark' : 'Bright' }}</span>
  </div>
</template>

<style scoped>
.theme-mode-toggle {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.625rem;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
}

.mode-icon {
  color: var(--weather-on-panel);
  font-size: 15px;
}

.mode-name {
  min-width: 40px;
  color: var(--weather-on-panel-muted);
  font-size: 12px;
  font-weight: 700;
}

.theme-switch {
  --el-switch-on-color: var(--accent);
  --el-switch-off-color: #94a3b8;
}
</style>
