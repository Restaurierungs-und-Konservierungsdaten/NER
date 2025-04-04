import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export const useTextStore = defineStore('Text', () => {

// State
const inputText = ref('')
const sentimentResult = ref(null)
const cappifyResult = ref(null)
const entitiesResult = ref(null)
const isProcessing = ref(false)
const thesaurusObject = ref(null)

// Actions
function setInputText(text) {
  inputText.value = text
}

function setSentimentResult(result) {
  sentimentResult.value = result
}

function setCappifyResult(result) {
  cappifyResult.value = result
}

function setEntitiesResult(result) {
  entitiesResult.value = result
}

function setIsProcessing(value) {
  isProcessing.value = value
}

function setThesaurusObject(object) {
  thesaurusObject.value = object
}

function resetAll() {
  inputText.value = ''
  sentimentResult.value = null
  cappifyResult.value = null
  entitiesResult.value = null
  isProcessing.value = false
}

return {
  // State
  inputText,
  sentimentResult,
  cappifyResult,
  entitiesResult,
  isProcessing,
  thesaurusObject,
  
  // Actions
  setInputText,
  setSentimentResult,
  setCappifyResult,
  setEntitiesResult,
  setIsProcessing,
  setThesaurusObject,
  resetAll
}
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTextStore, import.meta.hot))
}
