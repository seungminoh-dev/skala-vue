import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'

const app = createApp(App)

/* Router 등록 */
app.use(router)
/* Pinia를 전역 저장소로 등록 */
app.use(createPinia())
/* ElementPlus 등록 */
app.use(ElementPlus)
/* SPA 서비스 시작 */
app.mount('#app')
