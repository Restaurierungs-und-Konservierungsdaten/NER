<template>
  <q-page class="flex flex-center column">
    <div class="row" > 
      <div class="q-pa-md">
        <q-file
          v-model="file"
          label="Read PDF/DOCX/DOC"
          filled
          style="max-width: 300px"
          accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          @update:modelValue="handleFileChange"
        />
      </div>
      <div class="q-pa-md">
        <q-file
          v-model="ocrFile"
          label="OCR Image/PDF"
          filled
          style="max-width: 300px"
          accept="application/pdf,image/*"
          @update:modelValue="handleOcrFileChange"
        />
      </div>
    </div>
    <div class="row"> 
      <div class="q-pa-md" style="max-width: 300px">
        <q-form
          @submit="onSubmit"
          @reset="onReset"
          class="q-gutter-md"
        >
          <q-input
            label="Paste Text"
            v-model="inputText"
            filled
            autogrow
          />
          <div>
            <q-btn label="Absenden" type="submit" color="primary"/>
            <q-btn label="Zurücksetzen" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </div>
    <q-input
          v-model="outputText"
          filled
          autogrow
    />

    </div>


  </q-page>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import Tesseract from 'tesseract.js';
  import mammoth from 'mammoth';
  import * as pdfjs from 'pdfjs-dist';
  import { createCanvas } from 'canvas';

  const inputText = ref("");
  const outputText = ref(computed(() => inputText.value.toUpperCase()));
  const file = ref(null);
  const ocrFile = ref(null);

  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  const ocrLanguage = 'deu';

  const handleFileChange = async (newFile) => {
    console.log("File changed:", newFile);
    if (!newFile) return;

    const reader = new FileReader();
    
    // Determine file type
    const fileType = newFile.type || newFile.name.split('.').pop().toLowerCase();
    
    if (fileType === 'application/pdf' || fileType === 'pdf') {
    // PDF processing
    reader.onload = async (e) => {
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
        
        // Add page marker
        // finalString += `\n--- Page ${pageNum} ---\n`;
        
        // Extract text from current page
        for (let i = 0; i < textItems.length; i++) {
          finalString += textItems[i].str + ' ';
        }
      }
      
      inputText.value = finalString;
    };
    
    reader.readAsArrayBuffer(newFile);
  } 
  else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
           fileType === 'application/msword' || 
           fileType === 'docx' || 
           fileType === 'doc') {
    // Word document processing
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Use mammoth to convert Word to text
        const result = await mammoth.extractRawText({arrayBuffer});
        const text = result.value; // Extracted text
        
        // Set the text in the input field
        inputText.value = text;
        
        // Log any warnings
        if (result.messages.length > 0) {
          console.warn("Warnings when parsing Word document:", result.messages);
        }
      } catch (error) {
        console.error("Error processing Word document:", error);
        inputText.value = "Error reading document: " + error.message;
      }
    };
    
    reader.readAsArrayBuffer(newFile);
  }
  else {
    // Unsupported file type
    inputText.value = `File type not supported: ${fileType}`;
  }
};

const handleOcrFileChange = async (newFile) => {
    console.log("OCR File changed:", newFile);
    if (!newFile) return;

    const fileType = newFile.type;
    const reader = new FileReader();

    if (fileType === 'application/pdf') {
      // Handle PDF files
      reader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        let allText = '';
        
        // Process each page of the PDF
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          console.log(`Processing page ${pageNum} of ${numPages}`);
          const page = await pdf.getPage(pageNum);
          
          // Set scale for better OCR results
          const viewport = page.getViewport({ scale: 2.0 });
          
          // Create a canvas - Handle browser environment
          let canvas;
          let context;
          let imageData;
          
          try {
            // Try browser canvas first
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render PDF page to canvas
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;
            
            // Get image data for Tesseract
            imageData = canvas.toDataURL('image/png');
          } catch (error) {
            console.error("Browser canvas error, trying Node canvas:", error);
            // Fall back to Node.js canvas if in Node environment
            canvas = createCanvas(viewport.width, viewport.height);
            context = canvas.getContext('2d');
            
            // Render PDF page to canvas
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;
            
            // Get buffer for Node.js
            imageData = canvas.toBuffer('image/png');
          }
          
          // Run OCR on the image
          const { data: { text } } = await Tesseract.recognize(imageData, ocrLanguage, {
            logger: m => console.log(`Page ${pageNum}: ${m.status} (${Math.floor(m.progress * 100)}%)`)
          });
          
          // Append text with page separator
          allText += `\n${text}\n\n`;
        }
        
        // Set the combined text from all pages
        inputText.value = allText;
      };
      
      reader.readAsArrayBuffer(newFile);
    } else {
      // Handle image files (existing code)
      reader.onload = async (e) => {
        const imageData = e.target.result;
        const { data: { text } } = await Tesseract.recognize(imageData, ocrLanguage, {
          logger: m => console.log(m)
        });
        inputText.value = text;
      };
      
      reader.readAsDataURL(newFile);
    }
  };

</script>
