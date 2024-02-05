<script setup lang="ts">
import { makeMarkdownFile } from '@/lib/MakeMarkdownFile';
import { defineProps, ref } from 'vue';
import { saveAs } from 'file-saver';

interface TableValue {
  rows: number;
  cols: number;
  inputValues: string[][];
  markdownType: string[][];
}

const props = defineProps({
  tableValue: {
    type: Object as () => TableValue,
    required: true,
  },
});

//format: YYYYMMDDHHmmss
const nowTime = new Date().toLocaleString().replace(/\/|:|\s/g, '');

const fileName = ref('mcel' + nowTime);

const downloadFile = () => {
  const blob = new Blob([makeMarkdownFile(props.tableValue)], {
    type: 'text/markdown',
  });
  saveAs(blob, fileName.value + '.md');
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
