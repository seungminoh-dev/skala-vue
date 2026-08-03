<script setup>
/*
    Computed 함수를 실습하기 위한 파일
*/
import { ref, computed } from 'vue'
const count = ref(0)
const dummy = ref(0)

//1. 일반 함수는 리렌더링 되면 무조건 재실행됩니다.
const generalMethod = () => {
  console.log('일반 함수 실행됨')
  return count.value * 2 // value로 접근하세요
}

//2. Computed 함수는 사용된 반응형 변수가 바뀔때만 재연산합니다.
const doubleCount = computed(() => {
  console.log('Computed 함수 실행됨')
  return count.value * 2
})
</script>

<template>
  <div class="practice-card">
    <h2>computed() 캐싱 동작 비교</h2>
    <p>count: {{ count }} | dummy: {{ dummy }}</p>
    <button @click="count++">count 증가++</button>
    <button @click="dummy++">dummy 증가++</button>
    <!-- 일반 함수는 function call을 하고, computed 함수는 computed ref 객체 자체를 명시 -->
    <p>일반 함수 결과 : {{ generalMethod() }}</p>
    <p>Computed 함수 결과 : {{ doubleCount }}</p>
  </div>
</template>
