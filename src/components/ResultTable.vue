<template>
    <div class="q-pa-md">
      <q-table
        title="SKOS Concepts"
        :rows="rows"
        :columns="columns"
        row-key="uri"
      />
    </div>
  </template>
  
  <script setup>
  const columns = [
    {
      name: 'uri',
      required: true,
      label: 'URI',
      align: 'left',
      field: row => row.uri,
      format: val => `${val}`,
      sortable: true
    },
    { 
      name: 'prefLabel', 
      label: 'prefLabel', 
      field: 'prefLabel', 
      sortable: true 
    },
    { 
      name: 'altLabel', 
      label: 'altLabel', 
      field: 'altLabel'
    },
    { 
      name: 'definition', 
      label: 'definition', 
      field: 'definition' 
    }
  ]
  
  const rows = [
    {
      uri: 'http://example.org/concept/1',
      prefLabel: 'Computer Science',
      altLabel: 'CS, Computing, Informatics',
      definition: 'The study of computers and computational systems.'
    },
    {
      uri: 'http://example.org/concept/2',
      prefLabel: 'Artificial Intelligence',
      altLabel: 'AI, Machine Intelligence',
      definition: 'The simulation of human intelligence processes by machines.'
    },
    {
      uri: 'http://example.org/concept/3',
      prefLabel: 'Machine Learning',
      altLabel: 'ML, Statistical Learning',
      definition: 'The scientific study of algorithms that computer systems use to perform tasks without explicit instructions.'
    },
    {
      uri: 'http://example.org/concept/4',
      prefLabel: 'Natural Language Processing',
      altLabel: 'NLP, Computational Linguistics',
      definition: 'The ability of computers to understand text and spoken words in the same way humans can.'
    },
    {
      uri: 'http://example.org/concept/5',
      prefLabel: 'Knowledge Representation',
      altLabel: 'KR, Knowledge Engineering',
      definition: 'The field of artificial intelligence dedicated to representing information about the world in a form that a computer system can utilize.'
    }
  ]
  </script>