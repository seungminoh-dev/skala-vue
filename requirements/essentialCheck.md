### 아래 내용은 이 프로젝트 변경 과정에서 절대 변경되면 안되는 점을 나타낸 문서입니다.

# DAY1

1. 배열 렌더링(v-for): 날씨 데이터 배열을 이용해 화면에 날씨 카드를 반복 출력한다.(key에 id 바인딩 필수)
2. 조건부 렌더링(v-if): 기온이 25도 이상인 도시는 "더움(25도 이상)", 25도 미만인 도시는 "선선함(25도 미만) 라벨을 붙인다."
3. 양방향 바인딩 및 한글 처리(:value, @input): 도시 이름을 한글로 검색하는 input을 만든 후 한글 입력 한 도시명을 출력한다.
4. 이벤트 및 수식어

- 날씨 현황 카드를 누르면 상태바에 "{도시}이 선택되었습니다." 표기
- 지역별 날씨 현황 카드를 누르면 버블링 없이, /weather/:id 페이지로 이동한다.

# DAY2

1. 반응형 상태 관리: searchQuery, selectedCityInfo, weatherList를 반응형 상태로 정의한다.
2. 검색 도시(computed 활용): 전체 날씨 리스트 중에서 사용자가 입력한 검색어가 도시 이름에 포함된 항목만 필터링하여 Computed 배열에 담아 놓는다
   (filteredWeatherList)
3. 반응형 변수 변화 감시(watch, watchEffect)

- selectedCityInfo 감시 (watch이용) : 상태바 문구가 바뀔때마다 콘솔 로그를 작성
- searchQuery(watchEffect) : 도시 검색어를 타이핑 할때마다 콘솔로그로 작성

4. 검색 결과 표시

- 비었을때는 전체 데이터
- 일치하는 데이터는 해당 데이터만 출력
- 일치하는 데이터가 없으면 검색 결과가 일치하는 도시가 없다고 안내

# DAY3

1. 위의 기능 변경 없이 4개의 Component 파일로 분리
   WeatherParent.vue - 모든 반응형 데이터 유지
   BashDashboardCard.vue - 검색박스와 리스트박스의 디자인을 공통화. <slot>을 배치하여 부모 컴포넌트가 도시 검색, 날씨 현황등 기능을 주입
   SearchBar.vue - 부모로부터 검색 도시 반응형 데이터를 전달받아 표시(prop)

- 도시 검색시 update-query 이벤트를 발생하면서 검색어를 부모에게 전달(emits)
  WeatherCard.vue - 선택된 도시 객체를 전달 받아 표시(props), 카드를 선택하는 것(select-card)이벤트와 상세보기(click-detail)이벤트를 부모에게 전달
  각 컴포넌트로 분리하면서 Component에 해당하는 디자인은 <style scoped>로 분리

# DAY4

프로젝트 폴더 트리
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
▪ 과제 요구사항

1. 2. 3. 4. 5. Vue Router 설정 : 라우터 지연 로딩 적용, Catch-all Route 적용
               App.vue : Navigation Bar 추가 (RouterLink) 및 메인 콘텐츠 영역 배치(RouterView)
               WeatherHomeView.vue : WeatherParent 대체 (WeatherParent를 참고하여 / 경로에 맞게 작성)

- 상세보기 버튼 클릭 시 window.alert()를 제거하고, Programmatic Navigation 처리 (router.push('/weather/' + id)
  WeatherDetailView.vue : 지역별 상세 기상관측 정보를 보여주는 페이지
- 도시 코드에 해당하는 Mock Data를 임시로 활용
- Router 동적 경로 매칭에 해당되는 도시ID (cityId)를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택
  WeatherAboutView.vue : 적당한 내용 작성 및 메인 대시보드로 돌아가기 작성

# DAY5

▪ 날씨 단위를 세팅하는 stores/configStore.js 작성
▪ 과제 요구사항

1. UnitToggler.vue : 대시보드 상단에 배치되어 단위 설정을 변경하는 UI 버튼과
   영역
2. Navigation Bar 옆에 UnitToggler.vue 배치
3. 메인과 상세 날씨에 단위 설정 변경 적용
   ▪ 참고사항) 메인/상세 날씨에 단위 설정을 변경을 적용할 경우 유사한 코드
   가 중복됨 → Composable 로 해결 가능함 (범위 제외)

▪ Axios 활용 준비

1. Axios 라이브러리 설치
2. OpenWeatherMap API 가입 및 Key 발급
   ▪ 과제 요구사항
3. UnitToggler.vue : 대시보드 상단에 배치되어 단위 설정을 변경하는 UI 버튼과
   영역
4. 3. Navigation Bar 옆에 UnitToggler.vue 배치
      메인과 상세 날씨에 단위 설정 변경 적용
      const displayTemp = computed(() => {
      const rawTemp = props.cityItem.temp // 기본 원본 데이터는 섭씨 숫자
      if (configStore.unit ===
      'fahrenheit') {
      return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
      }
      return rawTemp // 'celsius'일 때는 원본 그대로 반환

# 추가 점수

▪ 3일차 과제에 Element Plus를 자유롭게 적용해 본다.

- 디자인은 자유롭게 적용
- 기존 제시한 과제말고 다양한 기능을 제공(기능 추가사항을 자유롭게 추가, 디자인은 자유롭게)
