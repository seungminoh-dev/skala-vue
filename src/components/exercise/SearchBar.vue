<!-- AI GENERATED CODE: Essential의 :value/@input 한글 검색을 유지한 서비스형 SearchBar입니다. -->
<script setup>
defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-query'])
const changeSearchQuery = (event) => {
  // AI CODE: 네이티브 input 이벤트로 한글 IME 조합 중인 값도 즉시 부모에 전달합니다.
  emit('update-query', event.target.value)
}
</script>

<template>
  <!-- AI CODE: 한글 조합 단계까지 반응하도록 검색 영역만 네이티브 HTML로 구성합니다. -->
  <section id="weather-search" class="weather-search" aria-labelledby="weather-search-title">
    <h2 id="weather-search-title" class="card-title">
      <span aria-hidden="true">🔍</span>
      도시 검색(한글 즉시 동기화)
    </h2>
    <label class="search-label" for="city-search">검색할 도시</label>
    <input
      id="city-search"
      class="search-input"
      name="city"
      type="search"
      placeholder="검색할 도시 이름 입력"
      autocomplete="off"
      :value="searchQuery"
      @input="changeSearchQuery"
    />
    <p class="search-result">
      검색 중인 도시:
      <output for="city-search">
        <span class="search-keyword">{{ searchQuery || '전체' }}</span>
      </output>
    </p>
  </section>
</template>

<style scoped>
.weather-search {
  display: grid;
  gap: 0.625rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--weather-on-panel);
  font-size: 18px;
  font-weight: 800;
}

.search-label {
  color: var(--weather-on-panel-muted);
  font-size: 12px;
  font-weight: 700;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--weather-panel-border);
  border-radius: var(--weather-radius-control);
  outline: none;
  background: var(--weather-panel-soft);
  color: var(--weather-on-panel);
  font-size: 15px;
  transition:
    border-color 0.16s ease,
    outline-color 0.16s ease;
}

.search-input:focus-visible {
  border-color: var(--focus-ring);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.search-input::placeholder {
  color: var(--weather-on-panel-faint);
}

.search-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--weather-on-panel-faint);
  font-size: 12px;
}

.search-keyword {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0.2rem 0.75rem;
  border-radius: 7px;
  background: var(--weather-panel-soft);
  color: var(--weather-accent-text);
  font-weight: 700;
  line-height: 1.2;
}
</style>
