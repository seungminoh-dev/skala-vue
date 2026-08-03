<script setup>
/*
  ref()로 참조형 변수를 담은 경우, 참조 객체의 주소값을 저장하고 있기 때문에 참조형 변수가 가르키는 실제 값의 변경은 추적하지 못한다.
  이 경우 watch의 3번째 인자에 Object {deep: true} 속성을 준다. 
  아니면 특정 속성을 감지하도록 () => 속성 형태로 Getter를 줍니다.
*/
import { ref, watch } from 'vue'
const user = ref({
  name: '홍길동',
  age: 30,
})

const logDeep = ref('반응 없음')
const logTarget = ref('반응 없음')
// User가 참조하는 주소가 바뀌지 않으면 아래의 코드는 동작하지 않는다.
// watch(user, () => {
//   console.log('이 로그가 영원히 안찍히는지 실험')
// })

// 1. deep:true로 감지 -> 단점: old값을 감지할 수 없음
watch(
  user,
  (newVal, oldVal) => {
    logDeep.value = `뭔가 변경됨(old추적 불가) ${oldVal.name}->${newVal.name}} | ${oldVal.age} ->${newVal.age}`
  },
  { deep: true },
)

// 2. 특정 속성을 Getter로 지정하여 감시
watch(
  () => user.value.age,
  (newAge, oldAge) => {
    logTarget.value = `${oldAge}->${newAge}`
  },
)
</script>

<template>
  <div class="practice-card">
    <h2>ref 객체/배열 감지</h2>
    <h3>회원 데이터 조작</h3>
    <p>이름: {{ user.name }} | 나이: {{ user.age }}</p>
    <button @click="user.name = '이순신'">이름만 변경</button>
    <button @click="user.age++">나이만 변경</button>
    <div class="monitor">
      <p>전체 감시</p>
      <p>{{ logDeep }}</p>
    </div>
    <div class="monitor">
      <p>부분 감시</p>
      <p>{{ logTarget }}</p>
    </div>
  </div>
</template>
