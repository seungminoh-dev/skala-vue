<script setup>
import RefExample from './practices/composition/RefExample.vue'
import ComputedExample from './practices/composition/ComputedExample.vue'
import WatchExample from './practices/composition/WatchExample.vue'
import MultiWatchExample from './practices/composition/MultiWatchExample.vue'
import DeepWatchExample from './practices/composition/DeepWatchExample.vue'
import WatchEffectExample from './practices/composition/WatchEffectExample.vue'
</script>

<template>
  <section class="practice-section">
    <h1>1. 반응형 상태 ref() 기초</h1>
    <hr />
    <RefExample />
    <h1>2. compute, watch 실습</h1>
    <hr />
    <ComputedExample />
    <WatchExample />
    <MultiWatchExample />
    <DeepWatchExample />
    <WatchEffectExample />
  </section>
</template>

<style scoped></style>
