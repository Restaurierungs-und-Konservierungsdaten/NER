import { tokenizeSentences, tokenizeWords, lowerCase, upperCase } from '../utils/nlp.js';
import {stem } from '../utils/cistem.js';

function indexArrayOfSubstrings(str, searchValue, label, uris) {
  let i = 0;
  const searchValueLenght = searchValue.length
  const indices = [];
  while (true) {
    const r = str.indexOf(searchValue, i);
    if (r !== -1) {
      indices.push([r, r+searchValueLenght - 1, label, uris]);
      i = r + 1;
    } else return indices;
  }
};

function getWordMatches(words, indexLabel, uriArray, stemmed) {
  const wordMatches = [];
  let index = 0;
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    /*
    let pointation = 0;
    // if word last character ends with punctuation, remove it and add 1 to pointation
    if (word[word.length - 1].match(/[.,!?;:]/)) {
      word = word.slice(0, -1);
      pointation = 1;
    }
    */
    let comparator = word;
    if (stemmed) {
      comparator = stem(word);
    }
    if (comparator === indexLabel) {
      const start = index;
      const end = index + word.length - 1 // - pointation;
      wordMatches.push([start, end, word, uriArray]);
    }
    index +=  words[i].length; //word.length +1 + pointation; // +1 for the space -1 for index as part of the word
  }
  return wordMatches;
}

function getMatches(sentence, labelsMap, stemmed) {
  const matches = []; // Store [start, end, match, uris, ] for all matches in this sentence
  for (const [label, uriArray] of Object.entries(labelsMap)) {
    let indexLabel = label;
    // split sentence into words and join words with spaces
    let indexSentence = sentence;
    // lowercase label for matching if not all uppercase
    if (upperCase(label) != label) {
      indexLabel = lowerCase(label)
      indexSentence = lowerCase(sentence);
    }
    if (indexLabel.length < 4 || stemmed) {
      const words = tokenizeWords(indexSentence) //.filter((item) => item !== " ");
      const wordMatches = getWordMatches(words, indexLabel, uriArray);
      // add all wordMatches to matches
      matches.push(...wordMatches);
    } else {
      let indices = indexArrayOfSubstrings(indexSentence, indexLabel, label, uriArray);
      matches.push(...indices);
    }
  }
  return matches;
}

function calculateResult(text, labelsMap, stemmedLabelsMap, conceptsMap, stemmed) {
  console.log("Stemming:", stemmed);
  const sentences = tokenizeSentences(text);
  const normdataArray = [];
  const annotatedSentences = [];
  for (let sentence of sentences) {
    sentence = tokenizeWords(sentence).join('');
    console.log("sentence", sentence);
    const sentenceObj = {
      string: sentence,
      concepts: []
    };
    const matches = getMatches(sentence, labelsMap, false);
    console.log("matches", matches);
    sentenceObj.concepts.push(...matches);
    if (stemmed) {
      const stemmedMatches = getMatches(sentence, stemmedLabelsMap, true);
      console.log("stemmedMatches", stemmedMatches);
      sentenceObj.concepts.push(...stemmedMatches);
    }
    annotatedSentences.push(sentenceObj.concepts);
  }
    
  return [
    annotatedSentences,
    normdataArray
  ];
}
  /*

  // Add concept information to normdataArray
  // !!!change to use allMatches!!!
  for (const uri of uriArray) {
    const conceptValues = conceptsMap[uri];
    const prefLabel = conceptValues.prefLabel;
    const altLabels = conceptValues.altLabel || [];
    const definition = conceptValues.definition || '';
    

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
  */
  
export { calculateResult };