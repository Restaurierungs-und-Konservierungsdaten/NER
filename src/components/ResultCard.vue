<template>
  <div class="q-pa-md">
    <q-card v-if="conceptResult.length > 0">
      <q-card-section>
        <h5>Annotation</h5>
      </q-card-section>
      <q-card-section>
        {{getNGrams(tokenizeWords(store.inputText), 2)}}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTextStore } from '../stores/TextStore'
import { getNGrams, tokenizeWords } from '../utils/nlp.js'; // ,tokenizeSentences

const store = useTextStore()
const conceptResult = ref([])

</script>