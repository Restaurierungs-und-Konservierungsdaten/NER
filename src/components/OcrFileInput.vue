<template>
    <q-file
        v-model="ocrFile"
        label="OCR Image/PDF"
        filled
        style="max-width: 300px"
        accept="application/pdf,image/*"
        @update:modelValue="handleOcrFileChange"
    />
</template>

<script setup>

  import { ref, getCurrentInstance } from 'vue';

  const ocrFile = ref(null);
  import Tesseract from 'tesseract.js';
  import * as pdfjs from 'pdfjs-dist';
  import { createCanvas } from 'canvas';
  
  const emit = defineEmits(['file-processed']);

  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  const ocrLanguage = 'deu';
  const { proxy } = getCurrentInstance();

  const handleOcrFileChange = async (newFile) => {
  // make qFile loading spinner visible
  proxy.$q.loading.show()
  console.log("OCR File changed:", newFile);
  if (!newFile) {
    proxy.$q.loading.hide()
    return;
  }
  
  const fileType = newFile.type;
  
  try {
    let inputText = "";
    
    if (fileType === 'application/pdf') {
      // Handle PDF files
      inputText = await processPdfFile(newFile);
    } else {
      // Handle image files
      inputText = await processImageFile(newFile);
    }
    
    
    console.log("OCR Text:", inputText);
    emit('file-processed', inputText);
    proxy.$q.loading.hide(); // Hide loading if no file
    return inputText; // Return the text if needed elsewhere

  } catch (error) {
    console.error("Error processing file:", error);
    proxy.$q.loading.hide(); // Hide loading if no file
  }
};

// Helper function to process PDF files
const processPdfFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
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
          allText += `\n\n${text}\n\n`;
        }
        
        resolve(allText);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to process image files
const processImageFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const imageData = e.target.result;
        const { data: { text } } = await Tesseract.recognize(imageData, ocrLanguage, {
          logger: m => console.log(m)
        });
        
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};
</script>