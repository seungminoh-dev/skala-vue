<script setup>
import { ref } from 'vue' // 래핑을 통해 해당 JS 변수를 반응형으로 만들어주는 Vue의 Composition API
const count = ref(0)
const name = ref('홍길동')
const isActive = ref(true)
const items = ref(['사과', '배'])
const user = ref({ name: '장보고', age: 30 })
const increaseRef = () => {
  count.value++ // 꼭 value로 접근하세요
}
</script>

<template>
  <div class="practice-card">
    <h2>반응형 상태 ref() 기초</h2>
    <p>
      Ref 카운트: <strong>{{ count }}</strong>
    </p>
    <p>이름: <input v-model="name" />{{ name }}</p>
    <p>활성 상태: {{ isActive ? '활성' : '비활성' }}</p>
    <p>과일 목록: {{ items.join(', ') }}</p>
    <p>사용자 정보: 이름 = {{ user.name }}, 나이 - {{ user.age }}</p>
    <button @click="increaseRef">Ref 변수 증가</button>
  </div>
</template>

<style scoped></style>
