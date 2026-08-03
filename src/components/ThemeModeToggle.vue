<script setup>
import { onMounted, ref } from 'vue'

const isDarkMode = ref(false)

const applyTheme = () => {
  document.documentElement.dataset.theme = isDarkMode.value ? 'dark' : 'light'
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

onMounted(() => {
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme()
})
</script>

<template>
  <section class="practice-card" aria-labelledby="theme-mode-title">
    <h2 id="theme-mode-title">Dark/Bright 모드 테스트</h2>
    <p aria-live="polite">현재 모드: {{ isDarkMode ? 'Dark' : 'Bright' }}</p>
    <button class="green" type="button" :aria-pressed="isDarkMode" @click="toggleTheme">
      {{ isDarkMode ? '☀️ Bright 모드로 변경' : '🌙 Dark 모드로 변경' }}
    </button>
  </section>
</template>
