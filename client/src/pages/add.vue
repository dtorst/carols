<script setup>
import { ref } from 'vue'

const form = ref({ title: '', key: '', composer: '', scoreUrl: '', refFullUrl: '', refSUrl: '', refAUrl: '', refTUrl: '', refBUrl: '' })
const uploadingCount = ref(0)


async function presign(file, purpose) {
  const contentType = file.type || 'application/octet-stream'
  
  const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/uploads/presign', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, contentType, purpose }),
  })

  if (!res.ok) throw new Error('Failed to presign upload URL')


  const { uploadUrl, fileUrl } = await res.json()
 
  const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file })
  if (!putRes.ok) {
    let msg = ''
    try { msg = await putRes.text() } catch {}
    throw new Error(`Upload failed (${putRes.status}): ${msg}`)
  }
  
  return fileUrl
}


async function onFile(e, field, purpose) {
  const file = e.target.files?.[0]; if (!file) return
  uploadingCount.value++
  try {
    form.value[field] = await presign(file, purpose)
  } catch (err) {
    console.error(err)
    window.alert('File upload failed. Please try again.')
  } finally {
    uploadingCount.value--
  }
}


async function save() {
  const payload = {
    title: form.value.title,
    key: form.value.key,
    composer: form.value.composer,
    'score_url': form.value.scoreUrl || '',
    'ref_full_url': form.value.refFullUrl || '',
    'ref_s_url': form.value.refSUrl || '',
    'ref_a_url': form.value.refAUrl || '',
    'ref_t_url': form.value.refTUrl || '',
    'ref_b_url': form.value.refBUrl || '',
  }

  const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/songs', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  })

  if (res.ok) window.location.href = '/'
}
</script>


<template>
  <div class="p-4 max-w-xl mx-auto">
    <h2 class="text-xl font-semibold mb-4">
      Add Song
    </h2>
    <VTextField 
      v-model="form.title" 
      label="Title" 
      class="my-3"
      required 
    />
    <VSelect
      v-model="form.key" 
      label="Key" 
      placeholder="C"
      class="my-3"
      :items="['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']"
    />
    <VTextField 
      v-model="form.composer" 
      label="Composer" 
      class="my-3"
    />


    <div class="my-2">
      <div class="text-sm opacity-70 mb-1">
        Score (pdf/png/jpg)
      </div>
      <input 
        type="file" 
        accept="application/pdf,image/*" 
        @change="e=>onFile(e,'scoreUrl','score')"
      >
    </div>

    <div class="my-2">
      <div class="text-sm opacity-70 mt-4">
        Reference Tracks (mp3)
      </div>
      <VRow class="mb-3">
        <VCol cols="12">
          <label>Full <br>
            <input 
              type="file" 
              accept="audio/*" 
              @change="e=>onFile(e,'refFullUrl','ref_full')"
            >
          </label>
        </VCol>
      </VRow>
      <VRow class="mb-3">
        <VCol cols="12">
          <label>S <br>
            <input 
              type="file" 
              accept="audio/*" 
              @change="e=>onFile(e,'refSUrl','ref_s')"
            >
          </label>
        </VCol>
      </VRow>
      <VRow class="mb-3">
        <VCol cols="12">
          <label>A <br>
            <input 
              type="file" 
              accept="audio/*" 
              @change="e=>onFile(e,'refAUrl','ref_a')"
            >
          </label>
        </VCol>
      </VRow>
      <VRow class="mb-3">
        <VCol cols="12">
          <label>T <br>
            <input 
              type="file" 
              accept="audio/*" 
              @change="e=>onFile(e,'refTUrl','ref_t')"
            >
          </label>
        </VCol>
      </VRow>
      <VRow class="mb-3">
        <VCol cols="12">
          <label>B <br>
            <input 
              type="file" 
              accept="audio/*" 
              @change="e=>onFile(e,'refBUrl','ref_b')"
            >
          </label>
        </VCol>
      </VRow>
    </div>


    <VBtn 
      color="primary" 
      class="mt-4" 
      :disabled="uploadingCount > 0"
      @click="save"
    >
      {{ uploadingCount > 0 ? `Uploading (${uploadingCount})...` : 'Save' }}
    </VBtn>
  </div>
</template>
