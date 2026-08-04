import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css' // 전역 스타일 적용

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  ElAlert,
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElResult,
  ElSpace,
  ElSwitch,
  ElTag,
} from 'element-plus'

import App from './App.vue'
import router from './router'

const app = createApp(App)

/* ElementPlus 등록 */
const elementPlusComponents = [
  ElAlert,
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElResult,
  ElSpace,
  ElSwitch,
  ElTag,
]
elementPlusComponents.forEach((component) => app.use(component))
/* Pinia를 전역 저장소로 등록 */
app.use(createPinia())
/* Router 등록 */
app.use(router)
/* SPA 서비스 시작 */
app.mount('#app')
