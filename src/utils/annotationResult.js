import { tokenizeSentences, lowerCase, indexArrayOfSubstrings } from '../utils/nlp.js';

function calculateResult(text, labelsMap, conceptsMap) {
  const normdataArray = [];
  const sentences = tokenizeSentences(text);
  
  // Create an array of sentence objects with annotations
  const annotatedSentences = [];
  
  // Process each sentence
  for (const sentence of sentences) {
    const sentenceObj = {
      original: sentence,
      segments: []
    };
    
    // Keep track of processed segments
    //let currentIndex = 0;
    const markers = []; // Store [start, end, label, uris] for all matches in this sentence
    
    // Find all labels in the current sentence
    for (const [label, uriArray] of Object.entries(labelsMap)) {

      let lowerCasedLabel = label;
      if (label.length > 3) {
        lowerCasedLabel = lowerCase(label)
      }
      const lowerCasedSentence = lowerCase(sentence);
      const indices = indexArrayOfSubstrings(lowerCasedSentence, lowerCasedLabel);
      
      if (indices.length > 0) {
        // Add concept information to normdataArray
        for (const uri of uriArray) {
          const conceptValues = conceptsMap[uri];
          const prefLabel = conceptValues.prefLabel;
          const altLabels = conceptValues.altLabel || [];
          const definition = conceptValues.definition || '';
          
          // Check if the concept is already in the array to avoid duplicates
          if (!normdataArray.some(item => item.uri === uri)) {
            const conceptObject = {
              uri: uri,
              prefLabel: prefLabel,
              altLabels: altLabels,
              definition: definition
            };
            normdataArray.push(conceptObject);
          }
        }
        
        // Store all matches with their associated URIs
        for (const [start, end] of indices) {
          markers.push({
            start,
            end,
            label,
            uris: uriArray
          });
        }
      }
    }
    
    // Sort markers by start position
    markers.sort((a, b) => a.start - b.start);
    
    // Process markers in order and create segments
    if (markers.length > 0) {
      // Handle potentially overlapping markers by always taking the first one
      let lastEnd = 0;
      
      for (const marker of markers) {
        // Only process if this marker starts after the previous one ended
        if (marker.start >= lastEnd) {
          // Add non-highlighted text before this marker
          if (marker.start > lastEnd) {
            sentenceObj.segments.push({
              text: sentence.substring(lastEnd, marker.start),
              highlighted: false
            });
          }
          
          // Add the highlighted segment
          sentenceObj.segments.push({
            text: sentence.substring(marker.start, marker.end),
            highlighted: true,
            label: marker.label,
            uris: marker.uris
          });
          
          lastEnd = marker.end;
        }
      }
      
      // Add remaining text after last marker
      if (lastEnd < sentence.length) {
        sentenceObj.segments.push({
          text: sentence.substring(lastEnd),
          highlighted: false
        });
      }
    } else {
      // If no markers, add the entire sentence as a non-highlighted segment
      sentenceObj.segments.push({
        text: sentence,
        highlighted: false
      });
    }
    
    annotatedSentences.push(sentenceObj);
  }
  
  return [
    annotatedSentences,
    normdataArray
  ];
}

export { calculateResult };