import {nGram} from 'n-gram'

function tokenizeSentences(text) {
  const segmenterDe = new Intl.Segmenter("de", { granularity: "sentence" });
  const segments = segmenterDe.segment(text);
  return Array.from(segments).map((segment) => segment.segment);
}

function tokenizeWords(text) {
  const segmenterDe = new Intl.Segmenter("de", { granularity: "word" });
  const segments = segmenterDe.segment(text);
  return Array.from(segments).map((segment) => segment.segment);
}

function getNGrams(input, n) {
  return nGram(n)(input);
}

function lowerCase(input) {
  return input.toLowerCase();
}

function upperCase(input) {
  return input.toUpperCase();
}

function indexArrayOfSubstrings(str, searchValue) {
  let i = 0;
  const searchValueLenght = searchValue.length
  console.log(searchValueLenght)
  const indices = [];
  while (true) {
    const r = str.indexOf(searchValue, i);
    if (r !== -1) {
      indices.push([r, r+searchValueLenght]);
      i = r + 1;
    } else return indices;
  }
};

export { tokenizeSentences, tokenizeWords, getNGrams, lowerCase, indexArrayOfSubstrings, upperCase };