<template>
    <q-file
    v-model="file"
    label="Read PDF/DOCX/DOC"
    filled
    style="max-width: 300px"
    accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    @update:modelValue="handleFileChange"
    />
</template>

<script setup>
    import { ref } from 'vue';
    const file = ref(null);
    import mammoth from 'mammoth';

    const handleFileChange = async (newFile) => {
  console.log("File changed:", newFile);
  if (!newFile) return;
  
  // Determine file type
  const fileType = newFile.type || newFile.name.split('.').pop().toLowerCase();
  
  try {
    let inputText = "";
    
    if (fileType === 'application/pdf' || fileType === 'pdf') {
      // PDF processing
      inputText = await processPdfFile(newFile);
    }
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             fileType === 'application/msword' ||
             fileType === 'docx' ||
             fileType === 'doc') {
      // Word document processing
      inputText = await processWordFile(newFile);
    }
    else {
      // Unsupported file type
      alert(`File type not supported: ${fileType}`);
      return null;
    }
    
    console.log("Input text:", inputText);
    return inputText;
  } catch (error) {
    console.error("Error processing file:", error);
    alert("Error reading document: " + error.message);
    return null;
  }
};

// Helper function to process PDF files
const processPdfFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/+esm');
        
        // Set the workerSrc property
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
        
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        
        // Get total page count
        const numPages = pdf.numPages;
        let finalString = '';
        
        // Iterate through all pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const textItems = textContent.items;
          
          // Add page marker if needed
          // finalString += `\n--- Page ${pageNum} ---\n`;
          
          // Extract text from current page
          for (let i = 0; i < textItems.length; i++) {
            finalString += textItems[i].str + ' ';
          }
          
          // Optionally release page resources
          // page.cleanup();
        }
        
        resolve(finalString);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to process Word files
const processWordFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Use mammoth to convert Word to text
        const result = await mammoth.extractRawText({arrayBuffer});
        const text = result.value; // Extracted text
        
        // Log any warnings
        if (result.messages && result.messages.length > 0) {
          console.warn("Warnings when parsing Word document:", result.messages);
        }
        
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

</script>