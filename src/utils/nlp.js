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

export { tokenizeSentences, tokenizeWords, getNGrams, lowerCase, upperCase };