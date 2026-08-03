<script setup>
// import { ref } from 'vue'
const welcomeMessage = 'Welcome to Skala-Vue'
</script>

<template>
  <div class="practice-section practice-card">
    <h2>{{ welcomeMessage }}</h2>
    <!-- Text Interpolation 안에서는 함수도 사용 가능합니다!!-->
    <p>{{ welcomeMessage.toUpperCase() }}</p>
    <!-- 일반 함수도 사용 가능합니다!-->
    <p>{{ 'Random Number:' + Math.ceil(Math.random() * 100) }}</p>
  </div>
</template>
