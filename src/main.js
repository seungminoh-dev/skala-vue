import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'

const app = createApp(App)

/* Router, Pinia, ElementPlus 등록 */
app.use(router)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
