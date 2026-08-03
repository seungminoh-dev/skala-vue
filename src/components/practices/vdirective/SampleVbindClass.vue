<script setup>
import { ref } from 'vue'
const isWarning = ref(false)
const themeClass = ref('bg-dark')
</script>

<template>
  <div class="practice-card">
    <h2>v-bind 디렉티브 고급(클래스 바인딩)</h2>
    <h3>클래스 바인딩 (객체 형식))</h3>
    <!-- 1. 클래스에 단일 클래스 속성을 boolean으로 바인딩하기-->
    <p :class="{ 'text-danger': isWarning }">현재 경고 상태: {{ isWarning }}</p>
    <button @click="isWarning = !isWarning">경고 상태 토글</button>
    <br />
    <h3>클래스 바인딩 (배열 형식))</h3>
    <!-- 변수에 들어있는 클래스 이름을 할당합니다. 여러 클래스를 할당할 수 있습니다. -->
    <div :class="[themeClass, isWarning ? 'border-red' : 'border-gray']">
      다중 클래스가 조립된 박스 구역입니다.
    </div>
  </div>
</template>

<style scoped>
.text-danger {
  color: red;
  font-weight: bold;
}
.bg-dark {
  background-color: #333;
  color: white;
  padding: 15px;
}
.border-red {
  border: 3px solid red;
}
.border-gray {
  border: 3px solid #ccc;
}
</style>
