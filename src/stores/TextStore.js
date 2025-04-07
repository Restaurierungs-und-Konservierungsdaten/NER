import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

export const useTextStore = defineStore('Text', () => {
  // State - only what's needed across components
  const inputText = ref('');
  const thesaurusObject = ref({});

  // Actions
  function setInputText(text) {
    inputText.value = text;
  }

  function setThesaurusObject(object) {
    thesaurusObject.value = object;
  }
  
  function resetText() {
    inputText.value = '';
  }

  return {
    // State
    inputText,
    thesaurusObject,
    
    // Actions
    setInputText,
    setThesaurusObject,
    resetText
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTextStore, import.meta.hot));
}