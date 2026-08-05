<script setup>
import { ref } from 'vue'
import { ElAlert, ElButton, ElDialog, ElEmpty, ElInput, ElTag } from 'element-plus'
import { current, search } from '@/services/openWeatherApi.js'
import { useWeatherStore } from '@/stores/weather.js'

const emit = defineEmits(['city-registered'])
const weatherStore = useWeatherStore()

const dialogVisible = ref(false)
const query = ref('')
const results = ref([])
const searching = ref(false)
const addingId = ref(null)
const feedback = ref(null)

const errorMessage = (error) => {
  return error?.response?.data?.message ?? error?.message ?? '요청을 완료하지 못했습니다.'
}

const findCities = async () => {
  if (query.value.trim() && query.value.trim().length < 2) {
    feedback.value = { type: 'info', message: '지역 이름을 두 글자 이상 입력해 주세요.' }
    return
  }

  searching.value = true
  feedback.value = null

  try {
    results.value = await search(query.value)

    if (results.value.length === 0) {
      feedback.value = {
        type: 'info',
        message: '일치하는 지역을 찾지 못했습니다. 국가 코드를 함께 입력해 보세요.',
      }
    }
  } catch (error) {
    results.value = []
    feedback.value = { type: 'error', message: errorMessage(error) }
  } finally {
    searching.value = false
  }
}

const openModal = () => {
  dialogVisible.value = true
  query.value = ''
  results.value = []
  feedback.value = null
}

const addCity = async (location) => {
  addingId.value = location.id
  feedback.value = null

  try {
    const weather = weatherStore.add(location, await current(location))

    feedback.value = { type: 'success', message: `${weather.name} 날씨를 등록했습니다.` }
    emit('city-registered', weather)
  } catch (error) {
    feedback.value = { type: 'error', message: errorMessage(error) }
  } finally {
    addingId.value = null
  }
}
</script>

<template>
  <div class="city-registration">
    <button class="city-add-card" type="button" @click="openModal">
      <span class="add-card-icon" aria-hidden="true">+</span>
      <strong>도시 추가</strong>
      <span>새 지역을 검색해 등록하세요</span>
    </button>

    <ElDialog
      v-model="dialogVisible"
      class="registration-dialog"
      title="도시 추가"
      width="min(92vw, 640px)"
      destroy-on-close
      append-to-body
      :close-on-click-modal="!addingId"
      :close-on-press-escape="!addingId"
    >
      <div class="registration-content">
        <p class="registration-guide">
          OpenWeather에서 도시를 검색합니다. 정확한 결과를 위해
          <strong>Seoul, KR</strong>처럼 국가 코드를 함께 입력해 주세요.
        </p>

        <ElInput
          v-model="query"
          class="location-search-input"
          placeholder="서울 또는 Tokyo, JP"
          clearable
          aria-label="등록할 도시 검색"
          @keyup.enter="findCities"
        >
          <template #append>
            <ElButton :loading="searching" @click="findCities">검색</ElButton>
          </template>
        </ElInput>

        <ElAlert
          v-if="feedback"
          class="registration-feedback"
          :title="feedback.message"
          :type="feedback.type"
          show-icon
          :closable="false"
        />

        <div class="result-heading">
          <div>
            <h3>검색 결과</h3>
            <p>{{ results.length }}개 지역</p>
          </div>
        </div>

        <ul v-if="results.length" class="location-results">
          <li v-for="location in results" :key="location.id">
            <button
              class="location-option"
              type="button"
              :disabled="Boolean(addingId)"
              @click="addCity(location)"
            >
              <span class="location-copy">
                <strong>{{ location.name }}</strong>
                <small>{{ location.region }}</small>
              </span>
              <ElTag effect="plain">API 검색</ElTag>
              <span v-if="addingId === location.id" class="registering-label"> 등록 중 </span>
            </button>
          </li>
        </ul>

        <ElEmpty v-else description="표시할 지역이 없습니다." :image-size="80" />
      </div>

      <template #footer>
        <ElButton :disabled="Boolean(addingId)" @click="dialogVisible = false"> 닫기 </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.city-registration {
  min-width: 0;
  height: 100%;
}

.city-add-card {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 320px;
  align-content: center;
  justify-items: center;
  gap: 0.65rem;
  padding: 2rem 1.25rem;
  border: 2px dashed var(--weather-panel-border);
  border-radius: var(--weather-radius-surface);
  background: var(--weather-panel-strong);
  box-shadow: var(--weather-shadow-surface);
  color: var(--weather-on-panel);
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.city-add-card:hover {
  border-color: var(--weather-accent-text);
  transform: translateY(-3px);
  box-shadow: var(--weather-shadow-hover);
}

.city-add-card:focus-visible {
  outline: 3px solid rgb(255 255 255 / 90%);
  outline-offset: 2px;
}

.add-card-icon {
  display: grid;
  width: 58px;
  height: 58px;
  border: 1px solid var(--weather-panel-border);
  border-radius: 50%;
  background: var(--weather-panel-soft);
  color: var(--weather-accent-text);
  font-size: 36px;
  font-weight: 300;
  line-height: 1;
  place-items: center;
}

.city-add-card strong {
  font-size: 20px;
  font-weight: 850;
}

.city-add-card > span:last-child {
  max-width: 190px;
  color: var(--weather-on-panel-muted);
  font-size: 13px;
}

.registration-content {
  display: grid;
  gap: 1.25rem;
}

.registration-guide {
  color: var(--text-secondary);
  font-size: 14px;
}

.registration-guide strong {
  color: var(--text-primary);
  font-weight: 800;
}

.location-search-input :deep(.el-input__wrapper) {
  min-height: 44px;
  border-radius: var(--weather-radius-control) 0 0 var(--weather-radius-control);
}

.location-search-input :deep(.el-input-group__append) {
  overflow: hidden;
  border-radius: 0 var(--weather-radius-control) var(--weather-radius-control) 0;
}

.location-search-input :deep(.el-input-group__append .el-button) {
  min-height: 44px;
  border-radius: 0 var(--weather-radius-control) var(--weather-radius-control) 0;
}

.registration-feedback {
  width: 100%;
}

.result-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.result-heading h3 {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 850;
}

.result-heading p {
  color: var(--text-tertiary);
  font-size: 12px;
}

.location-results {
  display: grid;
  gap: 0.75rem;
  max-height: min(46vh, 420px);
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.location-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 68px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--weather-radius-control);
  background: var(--surface-raised);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    transform 0.16s ease;
}

.location-option:active:not(:disabled) {
  transform: scale(0.99);
}

.location-option:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.location-option:disabled {
  cursor: default;
  opacity: 0.64;
}

.location-copy {
  display: grid;
  flex: 1;
  gap: 0.15rem;
  min-width: 0;
}

.location-copy strong {
  overflow: hidden;
  font-size: 17px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-copy small,
.registering-label {
  color: var(--text-tertiary);
  font-size: 12px;
}

:global(.registration-dialog.el-dialog) {
  display: flex;
  max-height: calc(100dvh - 2rem);
  flex-direction: column;
  margin-block: max(1rem, 5vh) !important;
}

:global(.registration-dialog .el-dialog__header),
:global(.registration-dialog .el-dialog__footer) {
  flex: none;
}

:global(.registration-dialog .el-dialog__body) {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

@media (max-width: 767px) {
  :global(.registration-dialog.el-dialog) {
    width: calc(100vw - 2rem) !important;
    margin-block: 1rem !important;
  }

  :global(.registration-dialog .el-dialog__body) {
    padding: 0.75rem 1rem 1rem;
  }

  :global(.registration-dialog .el-dialog__footer) {
    padding: 0.75rem 1rem 1rem;
    border-top: 1px solid var(--border-subtle);
  }

  .registration-content {
    gap: 0.9rem;
  }

  .location-results {
    max-height: none;
  }

  .result-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .location-option {
    flex-wrap: wrap;
  }
}
</style>
