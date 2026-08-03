<!-- Weather 서비스를 제공하는 Root Container -->
<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const searchQuery = ref('') // 현재 입력된 검색어를 반응형 연동
const selectedCityInfo = ref(null) // 현재 선택된 도시 객체를 저장

/* WeatherList */
const filteredWeatherList = computed(() => {
  return weatherList.value.filter((weather) => {
    return weather.name.includes(searchQuery.value)
  })
})
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

/* 자식에서 받은 event를 처리하는 부분 */
const updateSearchQuery = (content) => {
  searchQuery.value = content
}
const selectCity = (city) => {
  selectedCityInfo.value = city
}
const showDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}

/* 반응형 변수 변경 감지 */
watch(selectedCityInfo, (newCity, oldCity) => {
  console.log(
    `[Watch감지] 상태바 업데이트 : ${newCity.name}이/가 선택되었습니다. | ${oldCity?.name ?? '미선택'}->${newCity.name}`,
  )
})
watchEffect(() => {
  console.log(
    `[WatchEffect] 검색어 변경이 감지되었습니다. ${searchQuery.value}에 해당하는 Filter Updated`,
  )
})
</script>

<template>
  <!-- Main Container-->
  <section class="weather-container" aria-labelledby="weather-title">
    <!-- Title -->
    <h1 id="weather-title" class="weather-title">
      <span aria-hidden="true">🌤️</span>
      날씨 서비스
    </h1>
    <!-- Search Area -->
    <BaseDashboardCard>
      <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />
    </BaseDashboardCard>
    <!-- Weather List Area-->
    <BaseDashboardCard>
      <section aria-labelledby="weather-list-title">
        <h2 id="weather-list-title" class="weather-card-title">
          <span aria-hidden="true">🏙️</span>
          지역별 날씨 현황
        </h2>
        <p v-if="filteredWeatherList.length === 0">검색한 도시와 일치하는 도시가 없습니다.</p>
        <ul v-else class="weather-list">
          <WeatherCard
            v-for="item in filteredWeatherList"
            :key="item.id"
            :city="item"
            :is-selected="selectedCityInfo?.id === item.id"
            @select-card="selectCity"
            @click-detail="showDetail"
          />
        </ul>
      </section>
    </BaseDashboardCard>
    <output class="weather-status" aria-live="polite">
      <span v-if="selectedCityInfo">{{ selectedCityInfo.name }}이/가 선택되었습니다.</span>
      <span v-else>카드를 클릭하거나 검색해 보세요.</span>
    </output>
  </section>
</template>

<style scoped>
/* 메인 컨테이너 스타일 설정: 중앙 정렬과 Box 형태 디자인으로 */
.weather-container {
  width: min(100%, 800px);
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-background);
  box-shadow: 0 12px 30px rgb(0 0 0 / 10%);
}

/* Title 아래 구분선 추가 스타일 지정 */
.weather-title {
  margin: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-heading);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
}

.weather-card-title {
  margin: 0 0 1rem;
  color: var(--color-heading);
  font-size: 1.25rem;
  font-weight: 600;
}

.weather-list {
  display: grid;
  gap: 0.9rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

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
}
</style>
