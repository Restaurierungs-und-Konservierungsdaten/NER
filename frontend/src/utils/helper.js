import { stem } from '../utils/cistem.js'; 
import { tokenizeWords } from '../utils/nlp.js';

function generateStemmedLabelsMap(labelsMap) {

    const stemmedLabelsMap = {};
    for (const key in labelsMap) {
    // only one word terms that are not all uppercase
        if (tokenizeWords(key).length < 2 && key !== key.toUpperCase()) {
            const stemmedKey = stem(key);
            // check if stemmedKey with heading uppercase or lowercase already exists in labelsMap
            if (stemmedKey.length !== key.length) {
                if (!stemmedLabelsMap[stemmedKey]) { // stemmedKey !== key.toLowerCase && 
                    stemmedLabelsMap[stemmedKey] = labelsMap[key];
                } else {
                // join array stemmedLabelsMap[stemmedKey] with array labelsMap[key]
                stemmedLabelsMap[stemmedKey].push(...labelsMap[key]);
                // remove duplicates
                stemmedLabelsMap[stemmedKey] = [...new Set(stemmedLabelsMap[stemmedKey])];
                }
            }
        } 
    }
    return stemmedLabelsMap;
}

export { generateStemmedLabelsMap };