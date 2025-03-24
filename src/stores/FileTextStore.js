import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export const useFileTextStore = defineStore('fileText', () => {

  const fileText = ref("");

  /*
  function createConceptObject(rows) {
    if (!rows) {
      return null;
    }
    else{
      const conceptObject = {};
      for (let i = 0; i < rows.length; i++) {
        conceptObject[rows[i].identifier] = rows[i];
      }
      console.log("computed conceptDict: ", conceptObject);
      return conceptObject
    }
  };
  */

  return {
    fileText,
    // createConceptObject
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFileTextStore, import.meta.hot))
}
