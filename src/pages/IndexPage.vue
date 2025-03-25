<template>
  <q-page class="flex flex-center column">
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
            v-model="inputText"
            filled
            autogrow
            style="width: 525px;"
          />
          <div>
            <q-btn label="Analyze" type="submit" color="primary"/>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </div>
    </div>
    <div v-if="sentimentResult" class="q-pa-md">
      <q-card>
        <q-card-section>
          <div class="text-h6">Sentiment Analysis Result</div>
          <div>Label: {{ sentimentResult[0].label }}</div>
          <div>Score: {{ sentimentResult[0].score.toFixed(4) }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FileInput from '../components/FileInput.vue'
import OcrFileInput from '../components/OcrFileInput.vue'
import { pipeline } from '@huggingface/transformers'

// Reactive state
const inputText = ref('')
const fileInputRef = ref(null)
const ocrFileInputRef = ref(null)
const sentimentResult = ref(null)

// Sentiment analysis pipeline
const sentimentPipeline = ref(null)

// Initialize pipeline on component mount
onMounted(async () => {
  sentimentPipeline.value = await pipeline('sentiment-analysis')
})

// Handle file processing
const handleProcessedFile = (text, source) => {
  inputText.value = text.replace(/\n\s*\n/g, '\n\n')
  
  // Clear the other input
  if (source === 'fileInput' && ocrFileInputRef.value) {
    ocrFileInputRef.value = null
  } else if (source === 'ocrInput' && fileInputRef.value) {
    fileInputRef.value = null
  }
}

// Submit handler
const onSubmit = async () => {
  if (!sentimentPipeline.value) {
    console.error('Sentiment pipeline not loaded')
    return
  }

  if (!inputText.value.trim()) {
    console.error('No text to analyze')
    return
  }

  try {
    sentimentResult.value = await sentimentPipeline.value(inputText.value)
    console.log('Sentiment Analysis Result:', sentimentResult.value)
  } catch (error) {
    console.error('Sentiment analysis error:', error)
  }
}

// Reset handler
const onReset = () => {
  inputText.value = ''
  sentimentResult.value = null
  
  // Clear files in both input components
  if (fileInputRef.value) {
    fileInputRef.value = null
  }
  if (ocrFileInputRef.value) {
    ocrFileInputRef.value = null
  }
}
</script>