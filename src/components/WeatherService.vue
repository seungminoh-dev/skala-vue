<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

const searchQuery = ref('')
const selectedCityInfo = ref('')

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const filteredWeatherList = computed(() => {
  return weatherList.value.filter((weather) => {
    return weather.name.includes(searchQuery.value)
  })
})

//AI: 템플릿 안의 긴 인라인 입력 처리 -> 이름이 있는 함수로 분리해 가독성 개선
const updateSearchQuery = (event) => {
  searchQuery.value = event.target.value
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

watch(selectedCityInfo, (newCity, oldCity) => {
  console.log(
    `[Watch감지] 상태바 업데이트 : ${newCity}이/가 선택되었습니다. | ${oldCity}->${newCity}`,
  )
})

watchEffect(() => {
  console.log(
    `[WatchEffect] 검색어 변경이 감지되었습니다. ${searchQuery.value}에 해당하는 Filter Updated`,
  )
})
</script>

<template>
  <!-- AI: 일반 div 컨테이너 -> 제목을 가진 독립 영역을 나타내는 section으로 변경 -->
  <section class="weather-container" aria-labelledby="weather-title">
    <h1 id="weather-title" class="weather-title">
      <span aria-hidden="true">🌤️</span>
      과제 1: 날씨 (MockUp)
    </h1>

    <!-- AI: 장식용 hr 태그 -> 제목의 CSS border-bottom으로 변경 -->

    <!-- AI: 검색 영역 div -> 제목과 검색 입력을 묶는 section으로 변경 -->
    <section class="weather-card" aria-labelledby="search-title">
      <h2 id="search-title" class="weather-card-title">
        <span aria-hidden="true">🔍</span>
        도시 검색
      </h2>

      <!-- AI: placeholder만 있는 text input -> label이 연결된 search input으로 변경 -->
      <label class="search-label" for="city-search">검색할 도시</label>
      <input
        id="city-search"
        class="search-input"
        name="city"
        type="search"
        :value="searchQuery"
        @input="updateSearchQuery"
        placeholder="검색할 도시 이름 입력"
      />

      <!-- AI: 일반 p 출력 -> 입력 결과라는 의미를 가진 output으로 변경 -->
      <p class="search-result">
        검색 중인 도시:
        <output for="city-search">{{ searchQuery }}</output>
      </p>
    </section>

    <!-- AI: 반복되는 div 카드 묶음 -> 목록 구조인 section + ul + li로 변경 -->
    <section class="weather-card" aria-labelledby="weather-list-title">
      <h2 id="weather-list-title" class="weather-card-title">
        <span aria-hidden="true">🏙️</span>
        지역별 날씨 현황
      </h2>
      <p v-if="filteredWeatherList.length === 0">검색한 도시와 일치하는 도시가 없습니다.</p>
      <ul v-else class="weather-list">
        <li
          v-for="item in filteredWeatherList"
          :key="item.id"
          class="weather-location-card"
          :class="{ 'is-selected': selectedCityInfo === item.name }"
          @click="selectedCityInfo = item.name"
        >
          <!-- AI: 클릭 이벤트가 붙은 div 카드 -> 키보드로도 선택 가능한 실제 button으로 변경 -->
          <button
            class="weather-select-button"
            type="button"
            :aria-pressed="selectedCityInfo === item.name"
          >
            <span class="city-name">{{ item.name }} ({{ item.status }})</span>
            <span class="current-temp">현재 기온: {{ item.temp }}°C</span>

            <!-- AI: 작은 상태 라벨 div + 인라인 스타일 -> 의미에 맞는 span + CSS class로 변경 -->
            <span v-if="item.temp >= 25" class="temperature-badge is-hot">
              🔥 더움 (25도 이상)
            </span>
            <span v-else class="temperature-badge is-cool">❄️ 선선함 (25도 미만)</span>
          </button>

          <!-- AI: 기본 타입 button -> form 내부에서도 제출되지 않는 type="button"으로 명시 -->
          <button
            class="detail-button"
            type="button"
            @click.stop="showDetail(item.name, item.status)"
          >
            상세 보기
          </button>
        </li>
      </ul>
    </section>

    <!-- AI: 일반 div 상태바 -> 변경 내용을 알리는 output + aria-live 영역으로 변경 -->
    <output class="weather-status" aria-live="polite">
      <span v-if="selectedCityInfo !== ''"> {{ selectedCityInfo }}이/가 선택되었습니다. </span>
      <span v-else>카드를 클릭하거나 검색해 보세요.</span>
    </output>
  </section>
</template>

<style scoped>
/* AI: 스타일 없는 컨테이너 -> 중앙 정렬된 날씨 서비스 패널로 변경 */
.weather-container {
  width: min(100%, 800px);
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-background);
  box-shadow: 0 12px 30px rgb(0 0 0 / 10%);
}

/* AI: 별도 hr 요소 -> 제목 자체의 하단 경계선으로 구분 */
.weather-title {
  margin: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-heading);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
}

.weather-card {
  margin-top: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

.weather-card-title {
  margin: 0 0 1rem;
  color: var(--color-heading);
  font-size: 1.25rem;
  font-weight: 600;
}

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

.search-result {
  margin: 0.75rem 0 0;
}

.weather-list {
  display: grid;
  gap: 0.9rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* AI: 클릭 가능한 div -> 선택 버튼과 상세 버튼을 나란히 둔 카드 구조로 변경 */
.weather-location-card {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.weather-location-card.is-selected {
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgb(66 184 131 / 16%);
}

.weather-select-button {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 1rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.weather-select-button:focus-visible,
.detail-button:focus-visible {
  outline: 3px solid rgb(66 184 131 / 40%);
  outline-offset: -3px;
}

.city-name {
  color: var(--color-heading);
  font-size: 1.05rem;
  font-weight: 700;
}

.current-temp {
  font-size: 0.95rem;
}

/* AI: 인라인 배경색 -> 상태별 class로 분리 */
.temperature-badge {
  display: inline-flex;
  margin-top: 0.2rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}

.temperature-badge.is-hot {
  background: #ff6b6b;
}

.temperature-badge.is-cool {
  background: #339af0;
}

.detail-button {
  align-self: center;
  margin-right: 1rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border-hover);
  border-radius: 7px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

/* AI: 인라인 초록색 배경 -> 재사용 가능한 상태바 class로 변경 */
.weather-status {
  display: block;
  width: 100%;
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 10px;
  background: #e3f7e9;
  color: #17833b;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 600px) {
  .weather-container {
    padding: 1rem;
  }

  .weather-location-card {
    flex-direction: column;
  }

  .detail-button {
    align-self: stretch;
    margin: 0 1rem 1rem;
  }
}
</style>
