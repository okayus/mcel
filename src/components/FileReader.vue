<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue';

const emit = defineEmits(['fileContent']);
const fileContent = ref<string|ArrayBuffer|null>('');

const hookReaFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) fileContent.value = e.target.result;
        if(fileContent.value) emit('fileContent', fileContent.value);
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

</script>

<template>
  <el-button type="primary" @click="hookReaFile()">Read file</el-button>
</template>