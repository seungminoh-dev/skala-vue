# Weather Board

관심 지역의 현재 날씨와 예보를 확인하는 Vue 대시보드입니다.

## 주요 기능

- 도시 검색 및 관심 지역 등록
- 현재 날씨, 12시간·주간 예보 확인
- 섭씨·화씨 및 화면 테마 변경

## 실행

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정합니다.

```env
API_KEY=OpenWeather_API_KEY
VITE_WEATHER_API_URL=OPEN-METRO_API_URL
```

```sh
npm install
npm run dev
```

## 사용 기술

Vue 3, Pinia, Vue Router, Element Plus, Axios
