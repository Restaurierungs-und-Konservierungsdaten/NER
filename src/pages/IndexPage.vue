<template>
  <q-page class="flex flex-center column">
    <div class="row" > 
      <div class="q-pa-md">
        <q-file
          v-model="file"
          label="Read PDF file"
          filled
          style="max-width: 300px"
          accept="application/pdf"
          @update:modelValue="handleFileChange"
        />
      </div>
      <div class="q-pa-md">
        <q-file
          v-model="ocrFile"
          label="OCR PDF file or image"
          filled
          style="max-width: 300px"
          accept="application/pdf,image/*"
          @update:modelValue="handleOcrFileChange"
        />
      </div>
    </div>
    <div class="row"> 
      <div class="q-pa-md" style="max-width: 300px">
        <q-input
          v-model="inputText"
          filled
          autogrow
        />
      </div>
      <div class="q-pa-md" style="max-width: 300px">
        <q-input
          v-model="outputText"
          filled
          autogrow
        />
      </div>

    </div>


  </q-page>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import Tesseract from 'tesseract.js';

  // Set the workerSrc property
  
  const inputText = ref("");
  const outputText = ref(computed(() => inputText.value.toUpperCase()));
  const file = ref(null);
  const ocrFile = ref(null);

  const handleFileChange = async (newFile) => {
    console.log("File changed:", newFile);
    if (newFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
      
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/+esm');
      
        // Set the workerSrc property
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
      
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        
        // Ermittle die Gesamtzahl der Seiten
        const numPages = pdf.numPages;
        let finalString = '';
        
        // Iteriere durch alle Seiten
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const textItems = textContent.items;
          
          // Füge eine Seitenmarkierung hinzu (optional)
          finalString += `\n--- Seite ${pageNum} ---\n`;
          
          // Extrahiere den Text der aktuellen Seite
          for (let i = 0; i < textItems.length; i++) {
            finalString += textItems[i].str + ' ';
          }
        }
        
        inputText.value = finalString;
      };
      reader.readAsArrayBuffer(newFile);
    }
  };

const handleOcrFileChange = async (newFile) => {
  console.log("OCR File changed:", newFile);
  if (newFile) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target.result;
      const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
        logger: m => console.log(m)
      });
      inputText.value = text;
    };
    reader.readAsDataURL(newFile);
  }
};

</script>
