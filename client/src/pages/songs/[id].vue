<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PDF from "pdf-vue3"
import { $api } from '@/utils/api.js'

const route = useRoute(); const router = useRouter()
const song = ref(null)
const audio = ref(null)
const selected = ref('ref_full_url')
const notes = ref('')


async function load() {
  const { song: s } = await $api(`/songs/${route.params.id}`)
  song.value = s
  notes.value = s?.notes ?? ''
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
  await $api(`/songs/${route.params.id}/notes`, {
    method: 'PATCH',
    body: { notes: notes.value || '' },
  })

  if (song.value)
    song.value.notes = notes.value || ''
}


onMounted(load)
</script>

<template>
  <div class="p-2 sm:p-4">
    <VBtn 
      variant="text"
      color="primary"
      prepend-icon="tabler-chevron-left"
      @click="router.back()"
    >
      All Songs
    </VBtn>
    <VRow>
      <VCol cols="6">
        <h2 class="text-xl font-semibold mt-2">
          {{ song?.title }} 
          <span 
            v-if="song?.key" 
            class="opacity-70"
          >({{ song?.key }})</span>
        </h2>
        <div class="text-sm opacity-70">
          {{ song?.composer }}
        </div>
      </VCol>
      <VCol cols="6" class="d-flex align-center justify-end">
        <!-- Transport / tracks -->
        <VRow class="me-3">
          <VChip 
            v-for="track in tracks"
            :key="track.value"
            class="mx-1"
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
        <VRow>
          <audio 
            ref="audio" 
            :src="song?.[selected] || ''" 
            controls 
            class="w-full"
          />
        </VRow>
      </VCol>
    </VRow>
    
    <div
      class="mt-4 grid gap-3" 
      style="grid-template-columns: 1fr;"
    >
      <!-- Score preview -->
      <VCard 
        v-if="song?.score_url" 
        class="p-2 w-full"
      >
        <template v-if="song.score_url.toLowerCase().includes('.pdf')">
          <PDF :src="song.score_url" />
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
      
      <!-- Notes -->
      <VCard class="p-2">
        <div class="flex items-center gap-2 mb-2">
          <div class="text-sm">
            Notes
          </div>
          <VBtn 
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
    </div>
  </div>
</template>
