<script setup>
import { ref, onMounted } from 'vue'

const songs = ref([])

async function load() {
  const res = await fetch(import.meta.env.VITE_API_URL + '/api/songs')
  const json = await res.json()

  songs.value = json.songs
}

const q = ref('')

const filteredSongs = computed(() => {
  if (!q.value) return songs.value

  return songs.value.filter(s => s.title.toLowerCase().includes(q.value.toLowerCase()))
})

onMounted(load, console.log(import.meta.env.VITE_API_URL))
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
