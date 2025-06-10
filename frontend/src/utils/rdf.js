import { graph, parse, Namespace } from 'rdflib';

function processTurtleContent(fileContent) {
  console.log("Processing turtle content");
  var uri = 'https://example.org/resource.ttl';
  var mimeType = 'text/turtle';
  var store = graph();
  try {
    parse(fileContent, store, uri, mimeType);
  } catch (err) {
    console.error("Error parsing turtle file:", err);
    return;
  }
 
  const SKOS = Namespace('http://www.w3.org/2004/02/skos/core#');
  const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
  const concepts = store.statementsMatching(
    null,
    RDF('type'),
    SKOS('Concept')
  );
  // Create the output object
  const conceptsMap = {};
  const labelsMap = {};
  // Iterate through all concepts
  concepts.forEach(conceptStatement => {
    const conceptURI = conceptStatement.subject.value;
   
    // Find the preferred label for this concept
    const prefLabelStatements = store.statementsMatching(
      conceptStatement.subject,
      SKOS('prefLabel'),
      null
    );
   
    // Use the first prefLabel found (you may want to filter by language)
    if (prefLabelStatements.length > 0) {
      const prefLabel = prefLabelStatements[0].object.value;
      
      // Skip concepts whose prefLabel starts with "[" and ends with "]"
      if (prefLabel.startsWith("[") && prefLabel.endsWith("]")) {
        console.log("Structural concept omitted", conceptURI, prefLabel);
        return; // Skip this concept and continue with the next one
      }
      
      // If we get here, the prefLabel is valid, so initialize the concept in the map
      conceptsMap[conceptURI] = {};
      conceptsMap[conceptURI]["prefLabel"] = prefLabel;
      AddLabelToMap(conceptURI, prefLabel, labelsMap);
    } else {
      // If no prefLabel found, use the URI as the label or mark as undefined
      console.error("Error reading file:", "error: No prefLabel found for concept", conceptURI);
      return; // Skip this concept and continue with the next one
    }
    
    // Find the german alternative labels for this concept
    const altLabelStatements = store.statementsMatching(
      conceptStatement.subject,
      SKOS('altLabel'),
      null
      ).filter(statement => 
      statement.object.termType === 'Literal' && 
      statement.object.language === 'de'
    );
    if (altLabelStatements.length > 0) {
      const altLabels = [];
      altLabelStatements.forEach(altLabelStatement => {
        const altLabel = altLabelStatement.object.value;
        altLabels.push(altLabel);
        AddLabelToMap(conceptURI, altLabel, labelsMap);
      });
      conceptsMap[conceptURI]["altLabel"] = altLabels;
    }
    
    // Find the definition for this concept
    const definitionStatements = store.statementsMatching(
      conceptStatement.subject,
      SKOS('definition'),
      null
    );
    if (definitionStatements.length > 0) {
      const definition = definitionStatements[0].object.value;
      conceptsMap[conceptURI]["definition"] = definition;
    }
  });
  return [conceptsMap, labelsMap];
}

function AddLabelToMap(conceptURI, label, map) {
  // delete brackets and content in brackets from label
  label = label.replace(/[([][^()[\]]*[)\]]/g, "").trim();
  // Check if the concept already exists in the map
  if (!map[label]) {
    map[label] = [conceptURI];
  } else {
    map[label].push(conceptURI);
  }
}
  
  export { processTurtleContent };