<!-- AI GENERATED CODE: OpenWeather Geocoding 검색 결과를 바로 등록하는 단순 Modal입니다. -->
<script setup>
import { ref } from 'vue'
import { ElAlert, ElButton, ElDialog, ElEmpty, ElInput, ElTag } from 'element-plus'
import { useWeatherStore } from '@/stores/weather.js'

const emit = defineEmits(['city-registered'])
const weatherStore = useWeatherStore()

const dialogVisible = ref(false)
const query = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const registeringKey = ref(null)
const feedback = ref(null)

const candidateKey = (candidate) =>
  [candidate.name, candidate.country, candidate.lat, candidate.lon].join(':')

const formatLocation = (candidate) =>
  [candidate.state, candidate.country].filter(Boolean).join(' · ')

const setFeedback = (type, message) => {
  feedback.value = { type, message }
}

const errorMessage = (error) => {
  return error?.response?.data?.message ?? error?.message ?? '요청을 완료하지 못했습니다.'
}

const searchCandidates = async () => {
  if (query.value.trim() && query.value.trim().length < 2) {
    setFeedback('info', '지역 이름을 두 글자 이상 입력해 주세요.')
    return
  }

  isSearching.value = true
  feedback.value = null

  try {
    searchResults.value = await weatherStore.searchLocationCandidates(query.value)

    if (searchResults.value.length === 0) {
      setFeedback('info', '일치하는 지역을 찾지 못했습니다. 국가 코드를 함께 입력해 보세요.')
    }
  } catch (error) {
    searchResults.value = []
    setFeedback('error', errorMessage(error))
  } finally {
    isSearching.value = false
  }
}

const openDialog = () => {
  dialogVisible.value = true
  query.value = ''
  searchResults.value = []
  feedback.value = null
}

const registerCandidate = async (candidate) => {
  registeringKey.value = candidateKey(candidate)
  feedback.value = null

  try {
    const result = await weatherStore.registerLocation(candidate)

    setFeedback('success', `${result.location.name} 날씨를 등록했습니다.`)
    emit('city-registered', result.location)
  } catch (error) {
    setFeedback('error', errorMessage(error))
  } finally {
    registeringKey.value = null
  }
}
</script>

<template>
  <div class="city-registration">
    <ElButton class="city-add-button" type="primary" @click="openDialog">+ 도시 추가</ElButton>

    <ElDialog
      v-model="dialogVisible"
      title="도시 추가"
      width="min(92vw, 640px)"
      destroy-on-close
      append-to-body
      :close-on-click-modal="!registeringKey"
      :close-on-press-escape="!registeringKey"
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
          @keyup.enter="searchCandidates()"
        >
          <template #append>
            <ElButton :loading="isSearching" @click="searchCandidates()">검색</ElButton>
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
            <p>{{ searchResults.length }}개 지역</p>
          </div>
        </div>

        <ul v-if="searchResults.length" class="location-results">
          <li v-for="candidate in searchResults" :key="candidateKey(candidate)">
            <button
              class="location-option"
              type="button"
              :disabled="Boolean(registeringKey)"
              @click="registerCandidate(candidate)"
            >
              <span class="location-copy">
                <strong>{{ candidate.name }}</strong>
                <small>{{ formatLocation(candidate) }}</small>
              </span>
              <ElTag effect="plain">API 검색</ElTag>
              <span v-if="registeringKey === candidateKey(candidate)" class="registering-label">
                등록 중
              </span>
            </button>
          </li>
        </ul>

        <ElEmpty v-else description="표시할 지역이 없습니다." :image-size="80" />
      </div>

      <template #footer>
        <ElButton :disabled="Boolean(registeringKey)" @click="dialogVisible = false">
          닫기
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.city-registration {
  display: flex;
  justify-content: flex-end;
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

@media (max-width: 767px) {
  .result-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .location-option {
    flex-wrap: wrap;
  }
}
</style>
