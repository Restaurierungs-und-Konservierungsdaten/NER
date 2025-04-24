import {tokenizeSentences, lowerCase, indexArrayOfSubstrings,} from '../utils/nlp.js'; //  tokenizeWords  , getNGrams, { tokenizeSentences, tokenizeWords, getNGrams, lowerCase,  }

function calculateResult(text, labelsMap, conceptsMap) {
    const normdataArray = []
    const annotatedText = ""
    const sentences = tokenizeSentences(text)
    console.log('Sentences:', sentences)

    // Iterate over each sentence
    for (const sentence of sentences) {
      for (const [label, uriArray] of Object.entries(labelsMap)) {
        const lowerCasedLabel = lowerCase(label)
        const lowerCasedSentence = lowerCase(sentence)
        //const words = tokenizeWords(lowerCasedSentence) 
        const indices = indexArrayOfSubstrings(lowerCasedSentence, lowerCasedLabel)
        console.log('Indices:', indices)
        // check if indices start and end with words

        if (indices.length > 0) {
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
        } else {
          console.log('Label not found in text:', label)
        }

      }
    }

  return [annotatedText, normdataArray]
}

  export { calculateResult };