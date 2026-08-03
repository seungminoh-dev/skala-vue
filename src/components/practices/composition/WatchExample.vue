<script setup>
/*
    Watch가 어떻게 작동하는지 실습합니다 With 기본자료형
    watch(감시할 대상, (newVal, oldVal ) => {})
*/
import { ref, watch } from 'vue'
const currentCity = ref('서울')
const logMessage = ref('아직 감시 시스템이 작동하지 않았습니다')

//currentCity Ref를 감시하는 함수 설정
watch(currentCity, (newCity, oldCity) => {
  logMessage.value = `감시자 발동! : ${newCity} -> ${oldCity}로 변경됨.`
})
</script>

<template>
  <div class="practice-card">
    <h2>감시자 watch()의 원리와 실무 활용</h2>
    <h3>지역 선택 제어판</h3>
    <p>현재 선택된 도시: {{ currentCity }}</p>
    <button @click="currentCity = '서울'">서울 선택</button>
    <button @click="currentCity = '수원'">수원 선택</button>
    <button @click="currentCity = '부산'">부산 선택</button>
    <div class="monitor">
      <h3>파수꾼(watch) 모니터링 시스템</h3>
      <p>{{ logMessage }}</p>
    </div>
  </div>
</template>
