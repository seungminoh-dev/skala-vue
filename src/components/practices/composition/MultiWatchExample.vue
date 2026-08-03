<script setup>
/*
    여러 반응형 변수를 동시에 감시할 수도 있습니다.
*/
import { ref, watch } from 'vue'
const city = ref('서울')
const dateType = ref('오늘')
const apiStatus = ref('대기중 ....')
watch([city, dateType], ([newCity, newDType], [oldCity, oldDType]) => {
  apiStatus.value = `City: ${oldCity}->${newCity}, DateType: ${oldDType}->${newDType}`
})
</script>

<template>
  <div class="practice-card">
    <h2>여러 개의 변수 동시 감시(watch)</h2>
    <h3>날씨 조건 설정</h3>
    <label>도시: </label>
    <select v-model="city">
      <option value="서울">서울</option>
      <option value="대구">대구</option>
      <option value="부산">부산</option>
    </select>
    <label>날짜: </label>
    <label><input type="radio" value="오늘" v-model="dateType" /> 오늘</label>
    <label><input type="radio" value="내일" v-model="dateType" /> 내일</label>
    <label><input type="radio" value="주간예보" v-model="dateType" /> 주간예보</label>
    <div class="monitor">
      <h3>통합 모니터링 로그</h3>
      <p>현재 상태: {{ apiStatus }}</p>
    </div>
  </div>
</template>
