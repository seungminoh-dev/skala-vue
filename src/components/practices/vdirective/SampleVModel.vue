<script setup>
import { ref } from 'vue'
const text1 = ref('')
const text2 = ref('')
</script>

<template>
  <div class="practice-card">
    <h2>v-model 양방향 데이터 바인딩</h2>
    <h3>1) v-model 축약 문법(양방향)</h3>
    <input type="text" v-model="text1" placeholder="여기에 입력하세요" />
    <p>
      입력된 값: <strong>{{ text1 }}</strong>
    </p>
    <!-- V-Model을 풀어서 구현하기 -->
    <h3>2) v-model의 내부 작동 원리(단방향+이벤트)</h3>
    <input
      type="text"
      :value="text2"
      @input="
        (e) => {
          text2 = e.target.value
        }
      "
      placeholder="원리 파악용 입력창"
    />
    <p>
      입력된 값: <strong>{{ text2 }}</strong>
    </p>
  </div>
</template>
