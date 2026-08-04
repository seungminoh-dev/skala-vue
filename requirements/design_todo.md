### 현재 디자인이 어색한 부분을 표시

1. 관측범위: 34/34 체감 아래 습도/풍속/가시거리/일몰 등이 너무 바로 아래에 붙어있어 어색하게 느껴짐
2. 굳이 Navigation Bar와 Setting을 분리할 필요성?
3. 아래 도시 List에서도 Setting을 변경할 일이 있는데, 주 도시 아래로 내렸을 때 동작이 불편하게 느껴짐
4. 도시 검색 부터 아래로 이어지는 지역들이 위의 주 정보와 width가 일치하지 않아서 어색함
5. MY LOCATIONS~ 가 Round Box로 처리되어 있는데 글씨가 깨짐 내부 패딩이 안되있음
6. 마찬가지로 날씨 카드들이 내부 패딩이 안되있어 정보가 제대로 전달되지 않음
7. 조금더 전체적인 Width를 좁힐 필요성이 있어보임(개인적인 생각) 현재는 너무 퍼져있는 느낌이 있음(생각보다 사람들이 Full Size로 인터넷을 보지 않는다는 점)
8. 반응형 디자인 개선 필요

<!-- AI GENERATED CODE: 위 디자인 점검 항목의 구현 결과를 추적합니다. -->

### 반영 결과

1. Hero의 자동 `space-between` 배치를 제거하고 관측 요약과 Metric 사이에 명시적 여백을 적용했습니다.
2. Navigation과 Settings를 단일 Service Bar Surface로 통합했습니다.
3. Desktop Service Bar를 Sticky로 설정하고 Tablet·Mobile에서는 Sticky를 해제했습니다.
4. Header·Hero·검색·목록·Footer를 공통 최대 `1120px` 기준선으로 통일했습니다.
5. 목록 패널의 불필요한 Round Surface를 제거하고 제목의 패딩·행간을 보완했습니다.
6. Weather Card의 Element Plus Body 패딩을 명시해 내부 정보가 모서리에 붙지 않도록 수정했습니다.
7. 전체 최대 너비를 `1280px`에서 `1120px`로 축소했습니다.
8. Breakpoint를 `1119px`, `1023px`, `767px`, `479px` 역할별 기준으로 정리했습니다.
