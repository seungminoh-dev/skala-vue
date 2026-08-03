<script setup>
const rawHtmlData =
  '이 글자는 <span style="color: red; font-weight: bold;">빨간색 굵은 글자</span>이다.'
</script>

<template>
  <div class="practice-card">
    <h2>v-html 디렉티브 학습</h2>
    <h3>일반 보간법 {{}} 사용 결과:</h3>
    <p>{{ rawHtmlData }}</p>
    <br />
    <!-- v-html을 주면 innerHTML처럼 작동합니다-->
    <!-- XSS 공격에 노출되니까 사용을 지양해주세요 -->
    <h3>v-html 디렉티브 사용 결과:</h3>
    <p v-html="rawHtmlData"></p>
  </div>
</template>
