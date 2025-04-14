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
  import { processTurtleContent } from '../utils/rdf.js'; // Adjust the import path as necessary

  const file = ref(null) //({name: 'Konservierungsthesaurus.ttl', type: '', size: 0, content: ''});

  // Define emits for the component
  const emit = defineEmits(['thesaurus-processed']);
  
  // Hardcoded path to default thesaurus
  const defaultThesaurusPath = 'thesaurus/thesaurus.ttl'; // ../../public/

  onMounted(async () => {
    // Load the default thesaurus when component mounts
    try {
      const response = await fetch(defaultThesaurusPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch default thesaurus: ${response.status}`);
      }
      const fileContent = await response.text();
      emit('thesaurus-processed', processTurtleContent(fileContent));
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
    
    /* deal with json files
    else if (newFile.name.endsWith('.json')) {
      // Handle JSON files
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target.result;
        console.log("File content:", fileContent);
        // Parse the JSON content
        try {
          const jsonData = JSON.parse(fileContent);
          console.log("Parsed JSON Data:", jsonData);
          emit('thesaurus-processed', jsonData);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Error parsing JSON: " + error.message);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("Error reading file: " + error.message);
      };
      reader.readAsText(newFile);
    }
    */
  };

  // Helper function to process Turtle files from upload
  const processTurtleFile = (file) => {
    // Create a FileReader to read the file as string
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      processTurtleContent(fileContent);
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error.message);
    };
    reader.readAsText(file);
  };
</script>