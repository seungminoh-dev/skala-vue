<script setup>
/*
  특정 값을 감지하는 것이 아니라 watchEffect내에서 사용된 반응형 변수의 변경을 감지하도록 자동 등록합니다.
  구값은 감지할 수 없고, 변경시 업데이트 하도록 설계할 떄 사용합니다.
*/
import { ref, watchEffect } from 'vue'

const username = ref('홍길동')
const age = ref(20)
const logMessage = ref('대기중')

//watchEffect
watchEffect(() => {
  logMessage.value = `[자동 감지] 이름: ${username.value} | 나이: ${age.value}`
  console.log('Watch Effect 작동')
})
</script>

<template>
  <div class="practice-card">
    <h2>자동 감시자: Watch Effect</h2>
    <p>이름: {{ username }} | 나이: {{ age }}</p>
    <button @click="username = '이순신'">이름 변경</button>
    <button @click="age++">나이 1up</button>
    <div class="monitor">
      <h3>Watch Effect Monitoring</h3>
      <p>{{ logMessage }}</p>
    </div>
  </div>
</template>
