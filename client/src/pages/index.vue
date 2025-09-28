<script setup>
import { ref, onMounted } from 'vue'

const songs = ref([])

async function load() {
  const raw = import.meta.env.VITE_API_BASE_URL || '/api'
  const base = (raw.startsWith('http') || raw.startsWith('/')) ? raw : `https://${raw}`
  const res = await fetch(`${base}/songs`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Failed to load songs: ${res.status}`)

  const json = await res.json()

  songs.value = json?.songs || []
}

const q = ref('')

const filteredSongs = computed(() => {
  if (!q.value) return songs.value

  return songs.value.filter(s => s.title.toLowerCase().includes(q.value.toLowerCase()))
})

onMounted(load)
</script>


<template>
  <div class="p-4">
    <VTextField 
      v-model="q" 
      label="Search"
      density="compact" 
      class="mb-2" 
      clearable
    />
    <VList>
      <VListItem 
        v-for="s in filteredSongs" 
        :key="s.id" 
        :to="`/songs/${s.id}`" 
        link
      >
        <VListItemTitle>{{ s.title }}</VListItemTitle>
        <VListItemSubtitle>{{ s.key }} · {{ s.composer }}</VListItemSubtitle>
        <template #append>
          <VChip 
            v-for="part in s.references" 
            :key="part"
            size="x-small"
          >
            {{ part.title }}
          </VChip>
        </template>
      </VListItem>
    </VList>
    <VBtn 
      class="mt-4" 
      to="/add"
      color="primary"
    >
      Add Song
    </VBtn>
  </div>
</template>
