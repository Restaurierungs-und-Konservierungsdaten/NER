<template>
  <q-page class="flex flex-center column">
    <div class="row" >
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
          @submit="onSubmit"
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
            <q-btn label="Absenden" type="submit" color="primary"/>
            <q-btn label="Zurücksetzen" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
  import FileInput from '../components/FileInput.vue'
  import OcrFileInput from '../components/OcrFileInput.vue'
  import { ref } from 'vue'
  import { pipeline } from '@huggingface/transformers';

  // Allocate a pipeline for sentiment-analysis
  const pipe = await pipeline('sentiment-analysis');
  // [{'label': 'POSITIVE', 'score': 0.999817686}]

  const inputText = ref('')
  const fileInputRef = ref(null)
  const ocrFileInputRef = ref(null)

  const handleProcessedFile = (text, source) => {
    inputText.value = text.replace(/\n\s*\n/g, '\n\n');

    // Clear the other input if it exists
    if (source === 'fileInput' && ocrFileInputRef.value) {
      // Assuming the file input component has a method to clear its file
      ocrFileInputRef.value = null
    } else if (source === 'ocrInput' && fileInputRef.value) {
      // Assuming the file input component has a method to clear its file
      fileInputRef.value = null
    }
  }

  const onSubmit = () => {
    async function classify(input) {
      const out = await pipe(input);
      return out
    }
    console.log(classify(inputText.value))
  }

  const onReset = () => {
    console.log("Reset")
    inputText.value = ''
    
    // Clear files in both input components
    if (fileInputRef.value) {
      fileInputRef.value = null
    }
    if (ocrFileInputRef.value) {
      ocrFileInputRef.value = null
    }
  }
</script>