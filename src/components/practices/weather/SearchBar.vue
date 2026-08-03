<script setup>
defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-query'])
const changeSearchQuery = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <section id="weather-search" class="weather-search" aria-labelledby="weather-search-title">
    <!-- 제목 영역 -->
    <h2 id="weather-search-title" class="card-title">
      <span aria-hidden="true">🔍</span>
      도시 검색(한글 즉시 동기화)
    </h2>
    <!-- 검색창 -->
    <label class="search-label" for="city-search">검색할 도시</label>
    <input
      id="city-search"
      class="search-input"
      name="city"
      type="search"
      :value="searchQuery"
      @input="changeSearchQuery"
      placeholder="검색할 도시 이름 입력"
    />
    <!-- 검색 상태 표시 -->
    <p class="search-result">
      검색 중인 도시:
      <output for="city-search">{{ searchQuery }}</output>
    </p>
  </section>
</template>

<style scoped>
/* 제목 영역 */
.card-title {
  margin: 0 0 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-heading);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
}

/* 입력 영역 */
.search-label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-border-hover);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
}

.search-input:focus-visible {
  border-color: #42b883;
  outline: 3px solid rgb(66 184 131 / 20%);
}

/* 결과 영역 */
.search-result {
  margin: 0.75rem 0 0;
}
</style>
