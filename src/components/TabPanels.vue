<template>
  <q-option-group
    v-model="panel"
    inline
    :options="optionGroupArray"
  />
  <q-tab-panels v-model="panel" animated class="shadow-2 rounded-borders">
    <q-tab-panel
      v-for="panelObj in panelObjects"
      :key="panelObj.name"
      :name="panelObj.name">
      <div class="text-h6">{{ panelObj.name }}</div>
      <div v-if="isProcessing">Processing...</div>
      <div v-else>
        {{ panelObj.result }}
      </div>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { pipeline } from '@huggingface/transformers';
import { useTextStore } from '../stores/TextStore';

// Access the store only for the input text
const store = useTextStore();

// Local state for processing status
const isProcessing = ref(false);

// Initialize panel selection
const panel = ref('');

// Create a reactive object to hold pipelines
const pipelines = reactive({});

// Define panel objects with all relevant data
const panelObjects = reactive([
  {
    name: 'caps',
    pipelineType: null,
    result: ref(null),
    process: (text) => {
      return text.toUpperCase();
    }
  },
  {
    name: 'sentiment',
    pipelineType: 'sentiment-analysis',
    result: ref(null),
    process: async (text) => {
      if (!pipelines.sentiment) return null;
      return await pipelines.sentiment(text);
    }
  },
  {
    name: 'entities',
    pipelineType: 'ner',
    result: ref(null),
    process: async (text) => {
      if (!pipelines.entities) return null;
      return await pipelines.entities(text);
    }
  }
]);

// Generate option group array from panelObjects
const optionGroupArray = computed(() => 
  panelObjects.map(tab => ({
    label: tab.name,
    value: tab.name
  }))
);

// Initialize pipelines on component mount
onMounted(async () => {
  try {
    // Load all required pipelines in parallel
    const pipelinePromises = [];
    
    for (const panelObj of panelObjects) {
      if (panelObj.pipelineType) {
        const pipelineName = panelObj.name.toLowerCase();
        pipelinePromises.push(
          pipeline(panelObj.pipelineType)
            .then(pipelineInstance => {
              pipelines[pipelineName] = pipelineInstance;
              console.log(`Loaded ${panelObj.name} pipeline`);
            })
            .catch(error => {
              console.error(`Failed to load ${panelObj.name} pipeline:`, error);
            })
        );
      }
    }
    
    await Promise.all(pipelinePromises);
  } catch (error) {
    console.error('Error loading pipelines:', error);
  }
});

// Function to calculate results for all panels
async function calculateResults() {
  const inputText = store.inputText;
 
  if (!inputText) {
    console.error('No text to analyze');
    return;
  }
 
  isProcessing.value = true;
  
  try {
    // Process all panels in parallel
    await Promise.all(panelObjects.map(async (panelObj) => {
      try {
        panelObj.result = await panelObj.process(inputText);
        console.log(`${panelObj.name} result:`, panelObj.result.value);
      } catch (error) {
        console.error(`Error processing ${panelObj.name}:`, error);
        panelObj.result.value = null;
      }
    }));
  } catch (error) {
    console.error('Error during processing:', error);
  } finally {
    isProcessing.value = false;
    
    // Auto-select the first panel if none is selected
    if (!panel.value && panelObjects.length > 0) {
      panel.value = panelObjects[0].name;
    }
  }
}

// Expose public function
defineExpose({
  calculateResults
});
</script>