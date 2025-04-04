<template>
    <q-file
    v-model="file"
    label="Load Thesaurus"
    filled
    style="max-width: 300px"
    @update:modelValue="handleFileChange"
    />
</template>

<script setup>
  //  accept="text/plain"
  import { ref } from 'vue';
  import { graph, parse, Namespace } from 'rdflib';

  const file = ref(null);

  // Define emits for the component
  const emit = defineEmits(['thesaurus-processed']);

  const handleFileChange = async (newFile) => {
  console.log("File changed:", newFile);
  if (!newFile) return;
  const fileType = newFile.type;
  console.log("File type:", fileType);
  // Check if the file ends with .ttl
  if (newFile.name.endsWith('.ttl')) {
    processTurtleFile(newFile);
  } else if (newFile.name.endsWith('.json')) {
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
  }

  // Helper function to process Turtle files
  const processTurtleFile = (file) => {
    // Create a FileReader to read the file as string
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      console.log("File content:", fileContent);
      // emit fileContent
      var uri = 'https://example.org/resource.ttl'
      var mimeType = 'text/turtle'
      var store = graph()
      try {
          parse(fileContent, store, uri, mimeType)
      } catch (err) {
          console.log(err)
      }
      const SKOS = Namespace('http://www.w3.org/2004/02/skos/core#');
      const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

      const concepts = store.statementsMatching(
        null,
        RDF('type'),
        SKOS('Concept')
      );

      // Create the output object
      const conceptsMap = {};

      // Iterate through all concepts
      concepts.forEach(conceptStatement => {
      const conceptURI = conceptStatement.subject.value;
      
      // Find the preferred label for this concept
      const prefLabelStatements = store.statementsMatching(
        conceptStatement.subject,
        SKOS('prefLabel'),
        null
      );
      
      // Use the first prefLabel found (you may want to filter by language)
      if (prefLabelStatements.length > 0) {
        const prefLabel = prefLabelStatements[0].object.value;
        conceptsMap[conceptURI] = prefLabel;
      } else {
        // If no prefLabel found, use the URI as the label or mark as undefined
        conceptsMap[conceptURI] = undefined;
      }
    });
      console.log("Concepts Map:", conceptsMap);

      emit('thesaurus-processed', conceptsMap);
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error.message);
    };
    reader.readAsText(file);
  }

</script>