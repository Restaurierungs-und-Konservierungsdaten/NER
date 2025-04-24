import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

export const useTextStore = defineStore('Text', () => {
  // State - only what's needed across components
  const inputText = ref(
  `In ein dünnes Edelmetallblech wird mit flachen Punzen eine Grube eingesenkt, in die Stege eingelegt werden, die der Zeichnung entsprechend gebogen sind. Die Zellen werden bis zur Ebene des umgebenden Blechs mit Email gefüllt.
  `);
  const conceptsMap = ref({});
  const labelsMap = ref({});
  const annotationResultObject = ref({});
  const tableResultObject = ref([]);

  // Actions
  function setInputText(text) {
    inputText.value = text;
  }

  function setConceptsMap(object) {
    conceptsMap.value = object;
  }

  function setLabelsMap(object) {
    labelsMap.value = object;
  }

  function setAnnotationResultObject(object) {
    annotationResultObject.value = object;
  }

  function setTableResultObject(object) {
    tableResultObject.value = object;
  }
  
  function resetText() {
    inputText.value = '';
    conceptsMap.value = {};
    labelsMap.value = {};
    annotationResultObject.value = {};
    tableResultObject.value = [];
  }

  return {
    // State
    inputText,
    conceptsMap,
    labelsMap,
    annotationResultObject,
    tableResultObject,
    
    // Actions
    setInputText,
    setConceptsMap,
    setLabelsMap,
    setAnnotationResultObject,
    setTableResultObject,
    resetText
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTextStore, import.meta.hot));
}