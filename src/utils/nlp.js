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

export { tokenizeSentences, tokenizeWords };