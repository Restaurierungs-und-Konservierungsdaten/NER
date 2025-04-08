<template>
  <q-card style="width: 400px" v-if="result">
    <q-card-section>
      <h5>Result</h5>
    </q-card-section>
    <q-card-section>
      {{ result }}
    </q-card-section>
  </q-card>
  <ResultTable>
  </ResultTable>
</template>

<script setup>

import { ref } from 'vue'
import { useTextStore } from '../stores/TextStore'
import { watch } from 'vue'
import ResultTable from 'src/components/ResultTable.vue'
//import { tokenizeSentences, tokenizeWords } from '../utils/nlp.js'

const result = ref('')
const store = useTextStore()

function calculateResult(text) {
  console.log('inputText:', text)
  const normdataArray = []
  for (const [key, value] of Object.entries(store.thesaurusObject)) {
    console.log(key, value)
    let allLabels
    if (value.altLabels) {
      allLabels = value.altLabels.push(value.prefLabel)
    } else {
      allLabels = [value.prefLabel]
    }
    console.log('allLabels:', allLabels)
    //console.log('value:', value)
    for (let label of allLabels) {
      if (text.includes(label)) {
        normdataArray.push((key, value))
      }
    }
  }
  return normdataArray
}

// set watcher for store.analyze. If store.analyze is true, call calculateResults
watch(() => store.analyse, (newValue) => {
  if (newValue) {
    result.value = calculateResult(store.inputText)
  } else {
    result.value = ''
  }
})

</script>
