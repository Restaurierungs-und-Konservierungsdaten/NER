async function calculateResult(gliner, texts) {
  //const texts = ["Your input text here"];
  const entities = ["city", "country", "person"];
  const options = {
    flatNer: false, // Optional
    threshold: 0.1, // Optional
    multiLabel: false, // Optional
  };
    
  const results = await gliner.inference({
    texts,
    entities,
    ...options,
  });
  console.log(results);
}

export { calculateResult }; 