function calculateResult(text, labelsMap, conceptsMap) {
    const normdataArray = []
    const annotatedText = text
    
    for (const [label, uriArray] of Object.entries(labelsMap)) {
      console.log('Label:', label)
      // Check if any label is in the text
      if (text.includes(label)) {
        // Add this concept to our results
        for (const uri of uriArray) {
          console.log('URI:', uri)
          const conceptValues = conceptsMap[uri]
          const prefLabel = conceptValues.prefLabel
          const altLabels = conceptValues.altLabel || []
          const definition = conceptValues.definition || ''
          // Check if the concept is already in the array
          const conceptObject = {
            uri: uri,
            prefLabel: prefLabel,
            altLabels: altLabels,
            definition: definition
          }
          console.log('Concept Object:', conceptObject)
          normdataArray.push(conceptObject)
        }
      } 
    }
    
  return [annotatedText, normdataArray]
}

  export { calculateResult };