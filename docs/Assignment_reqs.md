## SKALA - Vue3:JS 과정 과제 요구사항 정리##

# PART1

1. 배열 렌더링 (v-for)

- 날씨 데이터 배열을 활용해 화면에 날씨 카드를 반복 출력한다.
- :key에 id 바인딩 필수

2. 조건부 렌더링 (v-if)

- 기온이 25도 이상인 도시는 "🔥 더움(25도 이상)", 25도 미만인 도시는 "❄️ 선선함(25도 미만)" 라벨을 붙힌다.

3. 양방향 바인딩 및 한글 처리

- 도시 이름을 한글로 검색하는 input을 만든 후 한글 입력 후 입력 한 도시명을 출력한다.
- 이 때 v-model말고 (:value, @input)으로 구현해서, 자/모 단위로 인식할 수 있도록 한다.

4. 이벤트 및 수식어

- 지역별 날씨 현황 카드를 누르면 상태바에 선택된 도시를 표기한다.
- 상세보기를 누르면 버블링 이벤트를 방지하여, 날씨 현황 카드가 클릭되지 않도록 한다.

# PART2

1. 반응형 상태 관리: 검색어(searchQuery), 선택된 도시(selectedCityInfo), 그리고 지역별 날씨 데이터 배열(weatherList)를 반응형 상태로 정의한다.
2. 검색 도시(computed 활용): 전체 날씨 리스트 중에서 사용자가 입력한 검색어가 도시 이름에 포함된 항목만 필터링하여 Computed 배열에 담아 놓는다. (filteredWeatherList)
3. 반응형 변수 변화 감시 (watch, watchEffect)

- selectedCityInfo 감시 (watch이용): 상태바 문구가 바뀔때마다 콘솔로그를 작성
- searchQuery 감시 (watchEffect이용): 도시 검색어를 타이핑 할 때 마다 변하는 searchQuery를 추적하여 콘솔로그로 작성

4. 검색 결과 표시(Template영역)

- 검색어가 비었을 때는 원본 데이터를 출력한다
- 검색어와 일치하는 데이터가 있을 때는 해당 데이터를 출력한다
- 검색어와 일치하는 데이터가 없으면 검색 결과가 일치하는 도시가 없다고 안내한다

# PART3

1. 위에서 작성했던 하나의 컴포넌트를 기능 변경 없이 4개의 Component 파일로 분리한다.
2. 분리된 컴포넌트
   2.1 WeatherParent.vue

- 모든 반응형 데이터 유지
  2.2 BaseDashboardCard.vue
- 검색박스와 리스트박스의 디자인을 공통화.
- <slot> 배치하여 부모 컴포넌트가 도시 검색, 날씨 현황 주입
  2.3 SearchBar.vue
- 부모로 부터 검색도시 반응형 데이터를 전달받아 표시 (props)
- 도시 검색 시 update-query 이벤트를 발생하면서 검색어를 부모에게 전달 (emits)
  2.4 WeatheCard.vue
- 선택된 도시 객체를 전달 받아 표시 (props)
- 카드를 선택하는 것(select-card 이벤트)과 상세보기(click-detail 이벤트)를 부모에게 전달
  (emits)

3. 각 컴포넌트로 분리하면서 Component에 해당되는 디자인은 <style scoped>로 각각 분리

# PART4

1. 프로젝트 폴더트리를 아래와 같이 한다
   src/
   ├── main.js # 라우터 인스턴스 전역 주입 (.use(router))
   ├── App.vue # 내비게이션 바 (<RouterLink>) 및 메인 수문장 (<RouterView />) 배치
   ├── router/
   │ └── index.js # 라우트 규칙(routes 배열) 정의 및 Lazy Loading 설정
   ├── components/
   │ └── exercise/ # ⭐ 실습용 부품 컴포넌트 격리 폴더
   │ ├── BaseDashboardCard.vue
   │ ├── SearchBar.vue
   │ └── WeatherCard.vue
   └── views/ # 페이지 단위 컴포넌트 보관 폴더
   ├── WeatherHomeView.vue # 메인 날씨 대시보드 화면
   ├── WeatherAboutView.vue # 서비스 소개용 정적 페이지
   ├── WeatherDetailView.vue # :cityId 패턴을 수신하는 동적 상세 페이지
   └── NotFoundView.vue # 정의되지 않은 경로 접근 시 (Catch-all Route)

2. Vue Router 설정 : 라우터 지연 로딩 적용, Catch-all Route 적용
3. App.vue : Navigation Bar 추가 (RouterLink) 및 메인 콘텐츠 영역 배치(RouterView)
4. WeatherHomeView.vue : WeatherParent 대체 (WeatherParent를 참고하여 / 경로에 맞게 작성)

- 상세보기 버튼 클릭 시 window.alert()를 제거하고, Programmatic Navigation 처리 (router.push('/weather/' + id)

5. WeatherDetailView.vue : 지역별 상세 기상관측 정보를 보여주는 페이지

- 도시 코드에 해당하는 Mock Data를 임시로 활용
- Router 동적 경로 매칭에 해당되는 도시ID (cityId)를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택

6. WeatherAboutView.vue : 적당한 내용 작성 및 메인 대시보드로 돌아가기 작성

# PART5

1. 날씨 단위를 세팅하는 stores/configStore.js 작성

- state / unit / 단위를 저장하는 변수 (초기값: celsius)
- getters / unitSymbol / 현재 단위 상태에 맞는 기호 (℃ / ℉)
- actions / toggleUnit / 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수

2. UnitToggler.vue : 대시보드 상단에 배치되어 단위 설정을 변경하는 UI 버튼과 영역
3. Navigation Bar 옆에 UnitToggler.vue 배치
4. 메인과 상세 날씨에 단위 설정 변경 적용

```js
const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp // 기본 원본 데이터는 섭씨 숫자
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
})
```

5. 참고사항) 메인/상세 날씨에 단위 설정을 변경을 적용할 경우 유사한 코드가 중복됨 → Composable 로 해결 가능함 (범위 제외)

# PART6

1. Axios 라이브러리 설치
2. OpenWeatherMap API 가입 및 Key 발급

# PART7

1. 과제에 Element Plus를 자유롭게 적용해 본다.
2. 메뉴를 추가하고 활용 API를 추가해서 과제를 확장한다.
3. ESLint로 점검하여 제출 과제의 Error를 없도록 한다.
4. API 키는 환경 변수로 조정하고 Git에 업로드 되지 않도록 한다.
