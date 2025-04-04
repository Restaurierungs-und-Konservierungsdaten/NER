<template>
  <q-option-group
    v-model="panel"
    inline
    :options="optionGroupArray"
  />
  <q-tab-panels v-model="panel" animated class="shadow-2 rounded-borders">
    <q-tab-panel
      v-for="tabPanelObject in tabPanelObjects"
      :key="tabPanelObject.name"
      :name="tabPanelObject.name">
      <div class="text-h6">{{ tabPanelObject.name }}</div>
      <div v-if="store.isProcessing">Processing...</div>
      <div v-else>
        {{ getResultForPanel(tabPanelObject.name) }}
      </div>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted } from 'vue';
import { pipeline } from '@huggingface/transformers';
import { useTextStore } from '../stores/TextStore';

// Access the store
const store = useTextStore();

// Analysis pipelines
const sentimentPipeline = ref(null);
const entitiesPipeline = ref(null);

// Initialize pipeline on component mount
onMounted(async () => {
  sentimentPipeline.value = await pipeline('sentiment-analysis');
  entitiesPipeline.value = await pipeline('ner');
});

const panel = ref('');

function cappify(text) {
  return text.toUpperCase();
}

// Function to retrieve the correct result based on panel name
function getResultForPanel(panelName) {
  switch(panelName) {
    case 'CAPS':
      return store.cappifyResult;
    case 'sentiment':
      return store.sentimentResult;
    case 'entities':
      return store.entitiesResult;
    default:
      return null;
  }
}

// This function can be exposed to be called from parent if needed
async function calculateResults() {
  const inputText = store.inputText;
  
  if (!inputText) {
    console.error('No text to analyze');
    return;
  }
  
  store.setIsProcessing(true);
  
  if (!sentimentPipeline.value) {
    console.error('Sentiment pipeline not loaded');
    store.setIsProcessing(false);
    return;
  }
  
  if (!entitiesPipeline.value) {
    console.error('Entities pipeline not loaded');
    store.setIsProcessing(false);
    return;
  }

  try {
    const sentimentResult = await sentimentPipeline.value(inputText);
    store.setSentimentResult(sentimentResult);
    console.log('Sentiment Analysis Result:', sentimentResult);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
  }

  try {
    const cappifyResult = cappify(inputText);
    store.setCappifyResult(cappifyResult);
    console.log('Cappify Result:', cappifyResult);
  } catch (error) {
    console.error('Cappify error:', error);
  }

  try {
    const entitiesResult = await entitiesPipeline.value(inputText);
    store.setEntitiesResult(entitiesResult);
    console.log('Entities Result:', entitiesResult);
  } catch (error) {
    console.error('Entities error:', error);
  }
  
  store.setIsProcessing(false);
  
  // Auto-select the first panel if none is selected
  if (!panel.value && tabPanelObjects.length > 0) {
    panel.value = tabPanelObjects[0].name;
  }
}

// Expose the calculate function
defineExpose({
  calculateResults
});

const tabPanelObjects = [
  {
    name: 'CAPS',
    result: computed(() => store.cappifyResult)
  },
  {
    name: 'sentiment',
    result: computed(() => store.sentimentResult)
  },
  {
    name: 'entities',
    result: computed(() => store.entitiesResult)
  }
];

const optionGroupArray = tabPanelObjects.map(tab => ({
  label: tab.name,
  value: tab.name
}));
</script>