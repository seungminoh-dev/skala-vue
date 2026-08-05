<script setup>
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { ElButton, ElTooltip } from 'element-plus'
import { useConfigStore } from '@/stores/config.js'

const configStore = useConfigStore()
const isDarkMode = computed({
  get: () => configStore.isDarkMode,
  set: (isDark) => configStore.setTheme(isDark ? 'dark' : 'bright'),
})
</script>

<template>
  <ElTooltip
    :content="isDarkMode ? '밝은 모드로 변경' : '다크 모드로 변경'"
    placement="bottom"
    :show-after="300"
  >
    <ElButton
      class="theme-mode-toggle"
      plain
      :aria-label="isDarkMode ? '밝은 모드로 변경' : '다크 모드로 변경'"
      :aria-pressed="isDarkMode"
      @click="isDarkMode = !isDarkMode"
    >
      <Moon v-if="isDarkMode" class="mode-icon" aria-hidden="true" />
      <Sunny v-else class="mode-icon" aria-hidden="true" />
    </ElButton>
  </ElTooltip>
</template>

<style scoped>
.theme-mode-toggle {
  width: 40px;
  height: 40px;
  min-height: 40px;
  margin: 0;
  padding: 0;
  border-color: var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
}

.theme-mode-toggle:hover,
.theme-mode-toggle:focus-visible {
  border-color: rgb(255 255 255 / 38%);
  background: var(--weather-panel-strong);
  color: var(--weather-on-panel);
}

.mode-icon {
  width: 17px;
  height: 17px;
}
</style>
