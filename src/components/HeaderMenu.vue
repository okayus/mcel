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
  <div class="header">
    <el-input type="text" v-model="fileName" />
    <el-button @click="downloadFile">Save as {{ fileName }}</el-button>
  </div>
</template>

<style scoped></style>
