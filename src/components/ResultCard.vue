<template>
  <div>
    <div class="q-pa-md">
      <q-card v-if="conceptResult.length > 0">
        <q-card-section>
          <h5>Annotation</h5>
        </q-card-section>
        <q-card-section>
          Annotation Text Placeholder
        </q-card-section>
      </q-card>
    </div>
    
    <div class="q-pa-md">
      <q-table
        title="SKOS Concepts"
        :rows="tableRows"
        :columns="columns"
        row-key="uri"
        v-if="tableRows.length > 0"
        wrap-cells
        dense
        class="full-width"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTextStore } from '../stores/TextStore'
import { watch } from 'vue'

const conceptResult = ref([])
const store = useTextStore()

const columns = [
  {
    name: 'uri',
    required: true,
    label: 'URI',
    align: 'left',
    field: row => row.uri,
    format: val => `${val}`,
    sortable: true,
    style: 'max-width: 25%; word-break: break-word'
  },
  { 
    name: 'prefLabel', 
    label: 'Preferred Label', 
    field: 'prefLabel', 
    sortable: true 
  },
  { 
    name: 'altLabel', 
    label: 'Alternative Labels', 
    field: 'altLabels', 
    format: val => Array.isArray(val) ? val.join(', ') : val
  },
  { 
    name: 'definition', 
    label: 'Definition', 
    field: 'definition' 
  }
]

// Convert the result array to the format expected by q-table
const tableRows = computed(() => {
  return conceptResult.value.map(item => ({
    uri: item.uri,
    prefLabel: item.prefLabel,
    altLabels: item.altLabels,
    definition: item.definition
  }))
})

function calculateResult(text) {
  console.log('inputText:', text)
  const normdataArray = []
  
  for (const [uri, value] of Object.entries(store.thesaurusObject)) {
    let allLabels = []
    
    // Correctly handle altLabels
    if (value.altLabels && Array.isArray(value.altLabels)) {
      allLabels = [...value.altLabels]
    }
    
    // Add prefLabel to allLabels
    if (value.prefLabel) {
      allLabels.push(value.prefLabel)
    }
    
    // Check if any label is in the text
    for (let label of allLabels) {
      if (text.includes(label)) {
        // Add this concept to our results
        normdataArray.push({
          uri: uri,
          prefLabel: value.prefLabel,
          altLabels: value.altLabels || [],
          definition: value.definition
        })
        break // Only add each concept once
      }
    }
  }
  
  return normdataArray
}

// Watch for changes to the analyze flag
watch(() => store.analyse, (newValue) => {
  if (newValue) {
    conceptResult.value = calculateResult(store.inputText)
  } else {
    conceptResult.value = []
  }
})
</script>