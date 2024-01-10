<script setup lang="ts">
import { ref } from 'vue';
import { saveAs } from 'file-saver';

//format: YYYYMMDDHHmmss
const nowTime = new Date().toLocaleString().replace(/\/|:|\s/g, '');

const fileName = ref('mcel' + nowTime + '.md');

const downloadFile = () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain' });
  saveAs(blob, fileName.value);
};
</script>

<template>
  <div>
    <input type="text" v-model="fileName" />
    <button @click="downloadFile">Save as {{ fileName }}</button>
  </div>
</template>

<style scoped></style>
