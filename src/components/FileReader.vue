<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue';

const emit = defineEmits(['fileContent']);
const fileContent = ref<string|ArrayBuffer|null>('');

const readFile = async (event: any) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target) fileContent.value = e.target.result;
        if(fileContent.value) emit('fileContent', fileContent.value);
    };
    reader.readAsText(file);
  }
};

</script>

<template>
    <div class="flex gap-1">
        <input type="file" @change="readFile($event)">
    </div>
</template>