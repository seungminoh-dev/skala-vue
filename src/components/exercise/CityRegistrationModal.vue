<!-- AI GENERATED CODE: 국내 주요 도시와 OpenWeather Geocoding 후보를 등록하는 Element Plus Modal입니다. -->
<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElAlert, ElButton, ElDialog, ElEmpty, ElInput, ElTag } from 'element-plus'
import { createLocationKey, useWeatherStore } from '@/stores/weather.js'

const emit = defineEmits(['city-registered'])
const weatherStore = useWeatherStore()

const dialogVisible = ref(false)
const query = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const registeringKey = ref(null)
const feedback = ref(null)

const registeredKeys = computed(
  () => new Set(weatherStore.registeredLocations.map((location) => location.key)),
)

const hasPresetResults = computed(() =>
  searchResults.value.some((location) => location.source === 'preset'),
)

const isRegistered = (candidate) => registeredKeys.value.has(createLocationKey(candidate))

const formatLocation = (candidate) =>
  [candidate.state, candidate.country].filter(Boolean).join(' · ')

const setFeedback = (type, message) => {
  feedback.value = { type, message }
}

const errorMessage = (error) => {
  const messages = {
    API_KEY_MISSING: 'OpenWeather API Key를 먼저 설정해 주세요.',
    LOCAL_RATE_LIMIT: '안전 호출 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.',
    RATE_LIMITED: 'OpenWeather 호출 한도를 초과했습니다. 마지막 저장 데이터는 유지됩니다.',
    MAX_LOCATIONS: '등록 가능한 도시 수를 모두 사용했습니다.',
    HTTP_401: 'API Key가 유효하지 않거나 아직 활성화되지 않았습니다.',
    HTTP_404: '해당 지역의 날씨 정보를 찾지 못했습니다.',
  }

  return messages[error.code] ?? error.message ?? '요청을 완료하지 못했습니다.'
}

const searchCandidates = async ({ forceRemote = false } = {}) => {
  if (query.value.trim() && query.value.trim().length < 2) {
    setFeedback('info', '지역 이름을 두 글자 이상 입력해 주세요.')
    return
  }

  isSearching.value = true
  feedback.value = null

  try {
    searchResults.value = await weatherStore.searchLocationCandidates(query.value, { forceRemote })

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

const openDialog = async () => {
  dialogVisible.value = true
  query.value = ''
  feedback.value = null
  await searchCandidates()
}

const registerCandidate = async (candidate) => {
  const locationKey = createLocationKey(candidate)
  registeringKey.value = locationKey
  feedback.value = null

  try {
    const result = await weatherStore.registerLocation(candidate)

    if (result.status === 'duplicate') {
      setFeedback('info', `${result.location.name}은(는) 이미 등록된 도시입니다.`)
      return
    }

    setFeedback('success', `${result.location.name} 날씨를 등록했습니다.`)
    emit('city-registered', result.location)
  } catch (error) {
    setFeedback('error', errorMessage(error))
  } finally {
    registeringKey.value = null
  }
}

onMounted(() => {
  weatherStore.hydrate()
})
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
          국내 주요 도시는 저장된 좌표를 사용해 검색 호출을 줄입니다. 해외 도시는
          <strong>Tokyo, JP</strong>처럼 국가 코드를 함께 입력해 주세요.
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
            <h3>{{ query ? '검색 결과' : '한국 주요 도시' }}</h3>
            <p>{{ searchResults.length }}개 지역</p>
          </div>
          <ElButton
            v-if="query.trim().length >= 2 && hasPresetResults"
            text
            :loading="isSearching"
            @click="searchCandidates({ forceRemote: true })"
          >
            해외·추가 결과 검색
          </ElButton>
        </div>

        <ul v-if="searchResults.length" class="location-results">
          <li v-for="candidate in searchResults" :key="createLocationKey(candidate)">
            <button
              class="location-option"
              type="button"
              :disabled="Boolean(registeringKey) || isRegistered(candidate)"
              @click="registerCandidate(candidate)"
            >
              <span class="location-copy">
                <strong>{{ candidate.name }}</strong>
                <small>{{ formatLocation(candidate) }}</small>
              </span>
              <ElTag v-if="isRegistered(candidate)" effect="plain">등록됨</ElTag>
              <ElTag v-else-if="candidate.source === 'preset'" effect="plain">저장 좌표</ElTag>
              <ElTag v-else effect="plain">API 검색</ElTag>
              <span
                v-if="registeringKey === createLocationKey(candidate)"
                class="registering-label"
              >
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
