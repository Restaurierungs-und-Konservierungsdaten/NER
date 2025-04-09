<template>
  <q-page class="flex flex-center column">
    <div class="container">
      <div class="q-pa-md">
        <ThesaurusInput
          @thesaurus-processed="(object) => handleUploadedThesaurus(object)"
        />
      </div>
      <div class="row">
        <div class="q-pa-md col-sm-6 col-12">
          <FileInput
            v-model="fileInputRef"
            @file-processed="(text) => handleProcessedFile(text, 'fileInput')"
          />
        </div>
        <div class="q-pa-md col-sm-6 col-12">
          <OcrFileInput
            v-model="ocrFileInputRef"
            @file-processed="(text) => handleProcessedFile(text, 'ocrInput')"
          />
        </div>
      </div>
      <div class="row">
        <div class="q-pa-md col-12">
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
            />
            <div>
              <q-btn label="Analyze" type="submit" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </div>
      </div>
      <div class="q-pa-md">
        <ResultCard>
        </ResultCard>
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
import ResultCard from 'src/components/ResultCard.vue'
// Access the store
const store = useTextStore()
// Local reactive state for input - synced with store
const localInputText = computed({
  get: () => store.inputText,
  set: (value) => store.setInputText(value)
})
const fileInputRef = ref(null)
const ocrFileInputRef = ref(null)
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
}
// Submit handler
const onSubmit = async () => {
  if (!store.inputText.trim()) {
    console.error('No text to analyze')
    return
  }
  // Set the analyse to a random number
  //store.setAnalyse(!store.analyse)
  store.setAnalyse(Math.floor(Math.random() * 100))
}
// Reset handler
const onReset = () => {
  // Reset all store data
  store.resetText()
 
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
/* Container with a reasonable max-width */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Make the textarea taller */
:deep(.q-textarea textarea) {
  min-height: 200px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .container {
    padding: 0 8px;
  }
}
</style>