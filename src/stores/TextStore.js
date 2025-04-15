import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

export const useTextStore = defineStore('Text', () => {
  // State - only what's needed across components
  const inputText = ref(
  `In ein dünnes Edelmetallblech wird mit flachen Punzen eine Grube eingesenkt, in die Stege eingelegt werden, die der Zeichnung entsprechend gebogen sind. Die Zellen werden bis zur Ebene des umgebenden Blechs mit Email gefüllt.
  `);
  const thesaurusObject = ref({});
  const labelObject = ref({});
  const resultObject = ref({});
  const analyse = ref(false);

  // Actions
  function setInputText(text) {
    inputText.value = text;
  }

  function setThesaurusObject(object) {
    thesaurusObject.value = object;
  }

  function setLabelObject(object) {
    labelObject.value = object;
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
    labelObject,
    analyse,
    
    // Actions
    setInputText,
    setThesaurusObject,
    setLabelObject,
    setAnalyse,
    resetText
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTextStore, import.meta.hot));
}