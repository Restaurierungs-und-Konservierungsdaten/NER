<template>
  <div class="q-pa-md">
    <q-card v-if="store.annotationResultObject.length > 0">
      <q-card-section>
        <h5>Annotation</h5>
      </q-card-section>
      <q-card-section>
        {{ store.annotationResultObject }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
//import { ref } from 'vue'
import { useTextStore } from '../stores/TextStore'
//import { getNGrams, tokenizeWords } from '../utils/nlp.js'; // ,tokenizeSentences

const store = useTextStore()

</script>