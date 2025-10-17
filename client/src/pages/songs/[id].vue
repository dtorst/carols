<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VuePdfEmbed from 'vue-pdf-embed'

const route = useRoute(); const router = useRouter()
const song = ref(null)
const audio = ref(null)
const selected = ref('ref_full_url')
const notes = ref('')
const playerDrawerIsOpen = ref(false)

const currentPage = ref(1)
const numPages = ref(1)

function onPdfLoaded(pdf) {
  numPages.value = pdf?.numPages || 1
}

watch(() => song.value?.score_url, () => {
  currentPage.value = 1
})


async function load() {
  const raw = import.meta.env.VITE_API_BASE_URL || '/api'
  let base = (raw.startsWith('http') || raw.startsWith('/')) ? raw : `https://${raw}`
  if (!base.includes('/api')) base = base.replace(/\/$/, '') + '/api'
  const res = await fetch(`${base}/songs/${route.params.id}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Failed to load song: ${res.status}`)

  const json = await res.json()

  song.value = json?.song
  notes.value = json?.song?.notes ?? ''
}

const tracks = [
  { title: 'Full Choir', value: 'ref_full_url' },
  { title: 'Soprano', value: 'ref_s_url' },
  { title: 'Alto', value: 'ref_a_url' },
  { title: 'Tenor', value: 'ref_t_url' },
  { title: 'Bass', value: 'ref_b_url' },
]

function play() { audio.value?.play() }
function pause() { audio.value?.pause() }
function stop() { if (!audio.value) return; audio.value.pause(); audio.value.currentTime = 0 }
function ff(sec=5) { if (audio.value) audio.value.currentTime += sec }
function rw(sec=5) { if (audio.value) audio.value.currentTime -= sec }


async function saveNotes() {
  const raw = import.meta.env.VITE_API_BASE_URL || '/api'
  let base = (raw.startsWith('http') || raw.startsWith('/')) ? raw : `https://${raw}`
  if (!base.includes('/api')) base = base.replace(/\/$/, '') + '/api'

  const res = await fetch(`${base}/songs/${route.params.id}/notes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ notes: notes.value || '' }),
  })

  if (!res.ok) throw new Error(`Failed to save notes: ${res.status}`)


  if (song.value)
    song.value.notes = notes.value || ''
}



function openPlayer() {
  playerDrawerIsOpen.value = true
}


onMounted(load)
</script>

<template>
  <VAppBar 
    density="comfortable" 
    class="px-2" 
    scroll-behavior="hide" 
    scroll-threshold="1"
  >
    <template #prepend>
      <VBtn 
        variant="text"
        color="primary"
        icon="tabler-chevron-left"
        @click="router.back()"
      />  
    </template>
    <VAppBarTitle>
      {{ song?.title }}
    </VAppBarTitle>
    <template #append>
      <VBtn 
        variant="text"
        color="primary"
        icon="tabler-play"
        @click="openPlayer"
      />
    </template>
  </VAppBar>
  
  <VNavigationDrawer
    v-model="playerDrawerIsOpen"
    temporary
    location="right"
    :width="300"
    absolute
    scrim="transparent"
    class="pa-4"
    :style="{ top: 0, height: '100vh', zIndex: 3000 }"
  >
    <VRow>
      <VCol
        cols="12"
        class="d-flex align-center justify-space-between px-3 py-2"
      >
        <div class="text-subtitle-2">
          Player
        </div>
        <VBtn
          variant="text"
          icon="tabler-x"
          @click="playerDrawerIsOpen = false"
        />
      </VCol>
      <VCol cols="12">
        <VRow class="me-3 px-3">
          <VChip 
            v-for="track in tracks"
            :key="track.value"
            class="mx-1 mb-2"
            :label="false"
            :value="track.value"
            :disabled="!song?.[track.value]"
            :color="selected === track.value ? 'success' : 'default'"
            @click="selected = track.value"
          >
            {{ track.title }}
          </VChip>
        </VRow>
        <VBtnGroup class="d-none">
          <VBtn 
            icon="tabler-rewind-backward-5"
            @click="rw"
          />
          <VBtn 
            v-if="audio"
            icon="tabler-player-play" 
            @click="play"
          />
          <VBtn 
            v-if="!audio"
            icon="tabler-player-pause" 
            @click="pause"
          />
          <VBtn 
            icon="tabler-player-stop" 
            @click="stop"
          />
          <VBtn 
            icon="tabler-rewind-forward-5" 
            @click="ff"
          />
        </VBtnGroup>
        <VRow class="px-3 mt-5">
          <audio 
            ref="audio" 
            :src="song?.[selected] || ''" 
            controls 
            class="w-100"
          />
        </VRow>
      </VCol>
    </VRow>
    <!-- Notes -->
    <VCard class="pa-4 position-absolute bottom-0 left-0 right-0">
      <div class="d-flex align-center justify-space-between gap-2 mb-2">
        <div class="text-sm">
          Notes
        </div>
        <VBtn 
          v-if="notes"
          size="x-small" 
          @click="saveNotes"
        >
          Save
        </VBtn>
      </div>
      <VTextarea 
        v-model="notes" 
        auto-grow 
        rows="3" 
        placeholder="Breath here; watch vowel on bar 12; take low note on ending…"
      />
    </VCard>
  </VNavigationDrawer>
  <VRow class="d-block h-100 w-100">
    <VBtn
      variant="text"
      icon="tabler-chevron-left"            
      style="position: absolute;z-index:3550; top: 50%; left: 0; transform: translateY(-50%);"
      :disabled="currentPage <= 1"
      @click="currentPage = Math.max(1, currentPage - 1)"
    />
    <VBtn
      variant="text"
      icon="tabler-chevron-right"            
      style="position: absolute;z-index:3550; top: 50%; right: 0; transform: translateY(-50%);"
      :disabled="currentPage >= numPages"
      @click="currentPage = Math.min(numPages, currentPage + 1)"
    />
    <div class="p-2 sm:p-4 h-100">
      <div
        class="mt-4 grid gap-3 h-100" 
        style="grid-template-columns: 1fr;"
      >
        <!-- Score preview -->
        <VCard 
          v-if="song?.score_url" 
          class="p-2 w-full h-100 d-flex flex-column"
        >
          <template v-if="song.score_url.toLowerCase().includes('.pdf')">
            <div class="d-flex flex-column align-center flex-grow-1 w-100 overflow-auto">
              <VuePdfEmbed
                :source="song.score_url"
                :page="currentPage"
                class="w-100 h-100"
                @loaded="onPdfLoaded"
              />
              <!--
                <div class="d-flex align-center justify-center gap-2 mt-2">
                <VBtn
                size="small"
                variant="tonal"
                icon="tabler-chevron-left"
                :disabled="currentPage <= 1"
                @click="currentPage = Math.max(1, currentPage - 1)"
                />
                <span class="text-caption px-2">Page {{ currentPage }} / {{ numPages }}</span>
                <VBtn
                size="small"
                variant="tonal"
                icon="tabler-chevron-right"
                :disabled="currentPage >= numPages"
                @click="currentPage = Math.min(numPages, currentPage + 1)"
                />
                </div>
              -->
            </div>
          </template>
          <template v-else>
            <img 
              :src="song.score_url" 
              alt="Score" 
              class="w-full object-contain rounded"
              @click="() => window.open(song.score_url, '_blank')" 
            >
          </template>
        </VCard>
      </div>
    </div>
  </VRow>
</template>
