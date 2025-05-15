<template>
  <q-page class="flex flex-center column">
    <div class="container">
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
      <div class="q-pa-md">
        <ResultTable>
        </ResultTable>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useTextStore } from '../stores/TextStore'
import { useQuasar } from 'quasar'
import { onMounted } from 'vue'
import { Gliner } from 'gliner'

import FileInput from '../components/FileInput.vue'
import OcrFileInput from '../components/OcrFileInput.vue'
import ResultCard from 'src/components/ResultCard.vue'
import ResultTable from 'src/components/ResultTable.vue'

import { calculateResult } from '../utils/annotationResult.js'; 

const $q = useQuasar()

// Access the store
const store = useTextStore()

// Local reactive state for input - synced with store
const localInputText = computed({
  get: () => store.inputText,
  set: (value) => store.setInputText(value)
})

onMounted(async () => {
  const gliner = new Gliner({
  tokenizerPath:  "public/onnx-community/gliner_multi-v2.1/", // Can be a string path or Uint8Array/ArrayBufferLike "public/tokenizer.json"
  onnxSettings: {
    modelPath: "public/onnx-community/gliner_multi-v2.1/model_int8.onnx", // Can be a string path or Uint8Array/ArrayBufferLike "public/model.onnx"
    executionProvider: "webgpu", // Optional: "cpu", "wasm", "webgpu", or "webgl"
    wasmPaths: "path/to/wasm", // Optional: path to WASM binaries
    multiThread: true, // Optional: enable multi-threading (for wasm/cpu providers)
    maxThreads: 4, // Optional: specify number of threads (for wasm/cpu providers)
    fetchBinary: true, // Optional: prefetch binary from wasmPaths
  },
  transformersSettings: {
    // Optional
    allowLocalModels: true,
    useBrowserCache: true,
  },
  maxWidth: 12, // Optional
  modelType: "gliner", // Optional
  });

  await gliner.initialize();


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

// Submit handler
const onSubmit = async () => {
  if (!store.inputText.trim()) {
    $q.notify('No text to analyze')
    return
  }
  // Call the function to calculate results
  const result = calculateResult(store.gliner, store.inputText)
  const tableResultObject = result[1]
  console.log('tableResultObject:', result)
  const annotationResultObject = result[0]
  console.log('annotationResultObject:', annotationResultObject)
  store.setTableResultObject(tableResultObject)
  store.setAnnotationResultObject(annotationResultObject)
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