import { createRouter, createWebHistory } from 'vue-router'

// 모든 Route는 동적으로 작성해, Lazy Loading을 적용하고 Memory를 절약합니다.

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // AI CODE: 새 페이지는 상단에서 시작하고 브라우저 뒤로/앞으로 이동 시에는 기존 위치를 복원합니다.
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/WeatherHomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:id',
      name: 'detail',
      component: () => import('@/views/WeatherDetailView.vue'),
    },
    //Catch-all Route적용
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
