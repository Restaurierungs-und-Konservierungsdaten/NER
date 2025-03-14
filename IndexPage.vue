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

    <div class="q-pa-md">
    <div class="q-gutter-sm">
      <q-radio v-model="shape" val="class" label="Classify" />
      <q-radio v-model="shape" val="entity" label="Entitify" />
      <q-radio v-model="shape" val="embedding" label="Embeddify" />
    </div>
    </div>

      <div class="q-pa-md">
        <q-btn
          label="Classification"
          color="primary"
          @click="calculate(model)"
        />
      </div>

  </q-page>
</template>

<script setup>
  import { ref } from 'vue';
  //import { computed } from 'vue';
  import Tesseract from 'tesseract.js';
  import { pipeline } from '@huggingface/transformers';
  import { Gliner } from 'gliner';
  
  const inputText = ref("Da die Bleche starke Abplatzungen aufwiesen, war es damals nicht gelungen, sie wieder ganz zusammenzusetzen.");
  const outputText = ref("");
  const file = ref(null);
  const ocrFile = ref(null);
  const shape = ref("class")
  console.log("Loading model");
  const model =  await pipeline("zero-shot-classification", "MoritzLaurer/ModernBERT-large-zeroshot-v2.0", {dtype: 'q4'});  // "MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7" 'Xenova/mobilebert-uncased-mnli'  // {dtype: 'q4'}  "MoritzLaurer/ModernBERT-large-zeroshot-v2.0"
  console.log("Model loaded");

  function calculate(model) {
    if (shape.value === "class") {
      classifyText(model);
    }
    if (shape.value === "entity") {
      entityText(model);
    }
  }

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
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const textItems = textContent.items;
      let finalString = '';

      for (let i = 0; i < textItems.length; i++) {
        finalString += textItems[i].str + ' ';
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

const classifyText = async (model) => {
  const labels =  ['gebrochen', 'Abplatzung', 'Verhärtung'];
  const result = model(inputText.value, labels, { multi_label: true }); //await
  outputText.value = JSON.stringify(result);
};

const entityText = async () => {
  const model = new Gliner({
      tokenizerPath: "onnx-community/gliner_multi-v2.1",
      onnxSettings: {
      modelPath: "C:/repos/WaiRKBLAETTER/public/model_quantized.onnx",
      executionProvider: "cpu" // Optional: "cpu", "wasm", "webgpu", or "webgl"
      },
      maxWidth: 12,
      });

  await model.initialize();

const texts = [inputText.value];
const entities = ["Abplatzung", "Beschädigung", "Verwurstung"];
const options = {
  flatNer: false, // Optional
  threshold: 0.1, // Optional
  multiLabel: false, // Optional
};

const results = await model.inference({
  texts,
  entities,
  options,
});
console.log(results);

};

</script>
