<script setup lang="ts">
import { ref } from 'vue';
import { saveAs } from 'file-saver';

const fileName = ref('sample.txt');

const downloadFile = () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain' });
  saveAs(blob, fileName.value);
};

</script>

<template>
  <div>
    <input type="text" v-model="fileName" />
    <button @click="downloadFile">download</button>
  </div>
</template>

<style scoped></style>
