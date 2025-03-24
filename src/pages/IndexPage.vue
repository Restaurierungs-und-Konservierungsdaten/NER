<template>
  <q-page class="flex flex-center column">
    <div class="row" > 
      <div class="q-pa-md">
        <FileInput @text-generated="updateInputText" />
      </div>
      <div class="q-pa-md">
        <OcrFileInput @text-generated="updateInputText" />
      </div>
    </div>
    <div class="row"> 
      <div class="q-pa-md" style="max-width: 300px">
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

</script>
