<template>
  <q-file
    v-model="file"
    label="Load Thesaurus"
    filled
    style="max-width: 300px"
    @update:modelValue="handleFileChange"
  >
  <template v-slot:label v-if="!file">
    Konservierungsthesaurus.ttl
  </template>
  </q-file>
</template>


<script setup>
  import { ref, onMounted } from 'vue';
  import { processTurtleContent } from '../utils/rdf.js';  
  import { useTextStore } from '../stores/TextStore'

  const store = useTextStore()

  const file = ref(null) //({name: 'Konservierungsthesaurus.ttl', type: '', size: 0, content: ''});
  
  // Hardcoded path to default thesaurus
  const defaultThesaurusPath = 'thesaurus/thesaurus.ttl'; // ../../public/

  onMounted(async () => {
    // Load the default thesaurus when component mounts
    try {
      const response = await fetch(defaultThesaurusPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch default thesaurus: ${response.status}`);
      }

      // Get blob directly from the response
      const blob = await response.blob();

      // Create a File object from the fetched content
      const fileName = defaultThesaurusPath.split('/').pop();
      const fileObject = new File([blob], fileName, { type: 'text/turtle' });
      
      // Use the existing processTurtleFile function with the File object
      processTurtleFile(fileObject);

    } catch (error) {
      console.error("Error loading default thesaurus:", error);
    }
  });

  const handleFileChange = async (newFile) => {
    console.log("File changed:", newFile);
    if (!newFile) return;
    const fileType = newFile.type;
    console.log("File type:", fileType);
    // Check if the file ends with .ttl
    if (newFile.name.endsWith('.ttl')) {
      processTurtleFile(newFile);
    } 
  };

  // Helper function to process Turtle files from upload
  const processTurtleFile = (file) => {
    // Create a FileReader to read the file as string
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      const maps = processTurtleContent(fileContent);

      const conceptsMap = maps[0];
      console.log("conceptsMap:", conceptsMap);
      store.setConceptsMap(conceptsMap);
      
      const labelsMap = maps[1];
      console.log("labelsMap:", labelsMap);
      store.setLabelsMap(labelsMap);
      
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error.message);
    };
    reader.readAsText(file);
  };
</script>