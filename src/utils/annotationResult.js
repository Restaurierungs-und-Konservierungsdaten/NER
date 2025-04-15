function calculateResult(text, thesaurusObject) {
    console.log('inputText:', text)
    const normdataArray = []
    
    for (const [uri, value] of Object.entries(thesaurusObject)) {
      let allLabels = []
      
      // Correctly handle altLabels
      if (value.altLabels && Array.isArray(value.altLabels)) {
        allLabels = [...value.altLabels]
      }
      
      // Add prefLabel to allLabels
      if (value.prefLabel) {
        allLabels.push(value.prefLabel)
      }
      
      // Check if any label is in the text
      for (let label of allLabels) {
        if (text.includes(label)) {
          // Add this concept to our results
          normdataArray.push({
            uri: uri,
            prefLabel: value.prefLabel,
            altLabels: value.altLabels || [],
            definition: value.definition
          })
          break // Only add each concept once
        }
      }
    }
    
    return normdataArray
  }

  export { calculateResult };