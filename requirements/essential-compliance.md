<!-- AI GENERATED CODE: Weather Canvas 재설계 후에도 필수 과제 동작이 유지되는지 점검했습니다. -->

# essentialCheck 구현 점검

> `essentialCheck.md` 원문은 변경하지 않고 현재 구현 위치만 점검합니다.

| 구분 | 필수 항목                                               | 구현 상태 | 구현 위치                                 |
| ---- | ------------------------------------------------------- | --------: | ----------------------------------------- |
| DAY1 | `v-for`와 `:key="item.id"`                              |      충족 | `WeatherHomeView.vue`                     |
| DAY1 | 25도 기준 `v-if/v-else`                                 |      충족 | `WeatherCard.vue`                         |
| DAY1 | 네이티브 `:value`, `@input` 한글 검색                   |      충족 | `SearchBar.vue`                           |
| DAY1 | 카드 클릭 선택 상태                                     |      충족 | `WeatherCard` → `WeatherHomeView`         |
| DAY1 | 상세 버튼 버블링 방지·동적 이동                         |      충족 | `@click.stop`, `router.push`              |
| DAY2 | `searchQuery`, `selectedCityInfo`, `weatherList` 반응성 |      충족 | `WeatherHomeView.vue`                     |
| DAY2 | `filteredWeatherList` computed                          |      충족 | `WeatherHomeView.vue`                     |
| DAY2 | `watch`, `watchEffect` 콘솔 로그                        |      충족 | `WeatherHomeView.vue`                     |
| DAY2 | 빈 검색어 전체·일치·불일치 상태                         |      충족 | `WeatherHomeView.vue`                     |
| DAY3 | 부모·Base·Search·Card 분리                              |      충족 | `WeatherHomeView`와 `components/exercise` |
| DAY3 | Props, Emits, Slot, Scoped style                        |      충족 | 각 Exercise 컴포넌트                      |
| DAY4 | RouterLink, RouterView, Lazy Route, Catch-all           |      충족 | `App.vue`, `router/index.js`              |
| DAY4 | 동적 상세 ID 조회                                       |      충족 | `WeatherDetailView.vue`                   |
| DAY5 | 설정 Store                                              | 대체 충족 | `src/stores/config.js`의 `useConfigStore` |
| DAY5 | `UnitToggler.vue`와 Nav 인접 배치                       |      충족 | `SettingsToolbar.vue`, `App.vue`          |
| DAY5 | 메인·상세 섭씨/화씨 변환                                |      충족 | `WeatherCard`, `WeatherDetailView`        |
| DAY5 | Axios·OpenWeather 준비                                  |      충족 | `openWeatherApi.js`                       |
| 추가 | Element Plus 적용                                       |      충족 | Card, Alert, Dialog, Descriptions 등      |

## Mock Data 항목 해석

DAY4의 Mock Data는 “나중에 Pinia Store로 이전”하기 위한 임시 단계로 작성된 요구입니다. 최신 요구에 따라 Mock 파일은 복원하지 않고, 같은 동적 ID 조회 과정을 실제 OpenWeather 응답과 Pinia Store로 상향 구현했습니다.

## Weather Canvas 재설계 영향

- `App.vue`의 배경과 Floating Chrome은 표시 계층만 변경하며 Router 구조를 유지합니다.
- `weatherVisuals.js`의 Unicode 기호는 외부 이미지 호출을 만들지 않으며 실제 API 상태값만 시각화합니다.
- 검색·선택·상세 이동·온도 조건·단위 변환의 변수명과 이벤트 계약은 변경하지 않았습니다.
- 전역 `weather-surface`와 scoped 배치 스타일의 책임을 분리했으며 Component 중첩 구조는 변경하지 않았습니다.

## 최신 파일명 변경 반영

- `essentialCheck.md` 원문은 보존했습니다.
- 최신 요청에 따라 `stores/configStore.js`는 `stores/config.js`로 이름만 변경했습니다.
- Store ID, `useConfigStore` export, 섭씨·화씨 및 테마 기능은 변경하지 않았습니다.

## 상세 Route 식별자

- 과제 형식인 `/weather/:id`와 동적 상세 조회는 유지합니다.
- URL과 Store 모두 `seoul`처럼 영문 도시명을 정리한 하나의 `id`를 사용합니다.
- `v-for :key="item.id"`, 선택·삭제·메인 지역 연결은 기존 내부 ID 계약을 그대로 유지합니다.

## API Refresh 단순화

- `weatherList` 배열 전체를 localStorage에 JSON으로 저장해 과제의 배열 반응성을 유지합니다.
- 접속 시 2시간 경과 항목 갱신, 도시 추가 시 단건 조회, 상단 버튼의 전체 갱신만 수행합니다.
- 호출 제한 추적·재시도·검색 Cache·국내 도시 preset은 제거했으며 Essential 항목에는 영향이 없습니다.
