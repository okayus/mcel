<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { saveAs } from 'file-saver';

const props = defineProps({
  tableValue: {
    type: Object,
    required: true,
  },
});

//format: YYYYMMDDHHmmss
const nowTime = new Date().toLocaleString().replace(/\/|:|\s/g, '');

const fileName = ref('mcel' + nowTime);

const downloadFile = () => {
  console.log(props.tableValue);
  const blob = new Blob(['Hello, world!'], { type: 'text/plain' });
  saveAs(blob, fileName.value);
};
</script>

<template>
    <div class="flex gap-1">
      <el-button class="bg-green-300" @click="downloadFile">Save as</el-button>
      <el-input type="text" v-model="fileName" />
      <p class="pt-1.5">.md</p>
    </div>
</template>

<style scoped></style>
