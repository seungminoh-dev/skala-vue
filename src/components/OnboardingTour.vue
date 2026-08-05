<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElTour, ElTourStep } from 'element-plus'

const emit = defineEmits(['active-change'])

const STORAGE_KEY = 'weather-dashboard:onboarding:v2'
const targets = [
  '[data-tour="gps"]',
  '[data-tour="refresh"]',
  '[data-tour="city-add"]',
  '[data-tour="city-search"]',
]

const visible = ref(false)
const current = ref(0)
const contentStyle = {
  width: 'min(320px, calc(100vw - 32px))',
  padding: '18px',
  borderRadius: '14px',
}

let frameId = null
let positionFrameId = null
let active = false
let closed = false

const hasSeenTour = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'done'
  } catch {
    return false
  }
}

const saveTourState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'done')
  } catch {
    // 저장할 수 없는 환경에서는 다음 방문에 다시 안내합니다.
  }
}

const setActive = (value) => {
  if (active === value) return

  active = value
  emit('active-change', value)
}

const finishTour = () => {
  if (closed) return

  closed = true
  visible.value = false
  saveTourState()
  setActive(false)
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

const targetsAreReady = () =>
  targets.every((selector) => {
    const element = document.querySelector(selector)
    if (!element) return false

    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  })

const showWhenReady = (attempt = 0) => {
  if (targetsAreReady()) {
    current.value = 0
    visible.value = true
    return
  }

  if (attempt >= 90) {
    setActive(false)
    return
  }

  frameId = requestAnimationFrame(() => showWhenReady(attempt + 1))
}

const alignTarget = () => {
  if (positionFrameId !== null) cancelAnimationFrame(positionFrameId)

  positionFrameId = requestAnimationFrame(() => {
    positionFrameId = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
  })
}

onMounted(async () => {
  if (hasSeenTour()) return

  setActive(true)
  await nextTick()
  showWhenReady()
})

onBeforeUnmount(() => {
  if (frameId !== null) cancelAnimationFrame(frameId)
  if (positionFrameId !== null) cancelAnimationFrame(positionFrameId)
  setActive(false)
})
</script>

<template>
  <ElTour
    v-model="visible"
    v-model:current="current"
    :content-style="contentStyle"
    :gap="{ offset: 8, radius: 12 }"
    :scroll-into-view-options="{ block: 'center' }"
    :target-area-clickable="false"
    @change="alignTarget"
    @close="finishTour"
    @finish="finishTour"
  >
    <template #indicators>
      <button class="tour-skip-button" type="button" @click="finishTour">건너뛰기</button>
    </template>

    <ElTourStep
      :target="targets[0]"
      title="내 위치 추가"
      description="GPS 버튼을 누르면 현재 위치의 날씨를 등록하고 대표 지역으로 설정할 수 있어요."
      placement="bottom"
      :next-button-props="{ children: '다음', type: 'primary' }"
    />
    <ElTourStep
      :target="targets[1]"
      title="날씨 새로고침"
      description="등록한 모든 지역의 최신 날씨를 한 번에 불러옵니다."
      placement="bottom"
      :prev-button-props="{ children: '이전' }"
      :next-button-props="{ children: '다음', type: 'primary' }"
    />
    <ElTourStep
      :target="targets[2]"
      title="도시 추가"
      description="도시 이름을 검색해 관심 지역을 내 목록에 추가할 수 있어요."
      placement="top"
      :prev-button-props="{ children: '이전' }"
      :next-button-props="{ children: '다음', type: 'primary' }"
    />
    <ElTourStep
      :target="targets[3]"
      title="등록 도시 검색"
      description="등록한 도시가 많아지면 이름으로 빠르게 찾아보세요."
      placement="bottom"
      :prev-button-props="{ children: '이전' }"
      :next-button-props="{ children: '완료', type: 'primary' }"
    />
  </ElTour>
</template>

<style scoped>
.tour-skip-button {
  padding: 0.35rem 0.15rem;
  border: 0;
  background: transparent;
  color: var(--el-text-color-secondary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.tour-skip-button:hover,
.tour-skip-button:focus-visible {
  color: var(--el-color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.tour-skip-button:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
