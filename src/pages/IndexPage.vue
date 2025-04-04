<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-md">
      <ThesaurusInput
        @thesaurus-processed="(object) => handleUploadedThesaurus(object)"
      />
    </div>
    <div class="row">
      <div class="q-pa-md">
        <FileInput
          v-model="fileInputRef"
          @file-processed="(text) => handleProcessedFile(text, 'fileInput')"
        />
      </div>
      <div class="q-pa-md">
        <OcrFileInput
          v-model="ocrFileInputRef"
          @file-processed="(text) => handleProcessedFile(text, 'ocrInput')"
        />
      </div>
    </div>
    <div class="row">
      <div class="q-pa-md">
        <q-form
          @submit.prevent="onSubmit"
          @reset="onReset"
          class="q-gutter-md"
        >
          <q-input
            label="Paste Text"
            v-model="localInputText"
            filled
            type="textarea"
            style="width: 400px"
          />
          <div>
            <q-btn label="Analyze" type="submit" color="primary" :loading="store.isProcessing"/>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </div>
    </div>
    <div class="q-pa-md">
      <div class="q-gutter-y-md" style="max-width: 350px">
        <TabPanels ref="tabPanelsRef" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTextStore } from '../stores/TextStore'
import FileInput from '../components/FileInput.vue'
import OcrFileInput from '../components/OcrFileInput.vue'
import ThesaurusInput from 'src/components/ThesaurusInput.vue'
import TabPanels from 'src/components/TabPanels.vue'


// Access the store
const store = useTextStore()

// Local reactive state for input - synced with store
const localInputText = computed({
  get: () => store.inputText,
  set: (value) => store.setInputText(value)
})

const fileInputRef = ref(null)
const ocrFileInputRef = ref(null)
const tabPanelsRef = ref(null)

// Handle file processing
const handleProcessedFile = (text, source) => {
  store.setInputText(text.replace(/\n\s*\n/g, '\n\n'))
 
  // Clear the other input
  if (source === 'fileInput' && ocrFileInputRef.value) {
    ocrFileInputRef.value = null
  } else if (source === 'ocrInput' && fileInputRef.value) {
    fileInputRef.value = null
  }
}

// Handle thesaurus processing
const handleUploadedThesaurus = (conceptObject) => {
  console.log('Thesaurus processed:', conceptObject)
  store.setThesaurusObject(conceptObject)
  store.setInputText(JSON.stringify(conceptObject))
  // Process the thesaurus as needed
}

// Submit handler
const onSubmit = async () => {
  if (!store.inputText.trim()) {
    console.error('No text to analyze')
    return
  }
  
  // Call the calculateResults method on the TabPanels component
  if (tabPanelsRef.value) {
    await tabPanelsRef.value.calculateResults()
  }
}

// Reset handler
const onReset = () => {
  // Reset all store data
  store.resetAll()
 
  // Clear files in both input components
  if (fileInputRef.value) {
    fileInputRef.value = null
  }
  if (ocrFileInputRef.value) {
    ocrFileInputRef.value = null
  }
}
</script>

<style scoped>
</style>