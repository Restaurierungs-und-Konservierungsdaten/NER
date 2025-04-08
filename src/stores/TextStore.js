import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

export const useTextStore = defineStore('Text', () => {
  // State - only what's needed across components
  const inputText = ref('');
  const thesaurusObject = ref({});
  const analyse = ref("");

  // Actions
  function setInputText(text) {
    inputText.value = text;
  }

  function setThesaurusObject(object) {
    thesaurusObject.value = object;
  }

  function setAnalyse(value) {
    analyse.value = value;
  }
  
  function resetText() {
    inputText.value = '';
    thesaurusObject.value = {};
    analyse.value = '';
  }

  return {
    // State
    inputText,
    thesaurusObject,
    analyse,
    
    // Actions
    setInputText,
    setThesaurusObject,
    setAnalyse,
    resetText
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTextStore, import.meta.hot));
}