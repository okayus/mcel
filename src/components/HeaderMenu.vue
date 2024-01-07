<template>
  <div>
    <select>
      <option value="text">テキスト</option>
      <optgroup label="見出し">
        <option value="h1">見出し1</option>
        <option value="h2">見出し2</option>
        <option value="h3">見出し3</option>
        <option value="h4">見出し4</option>
        <option value="h5">見出し5</option>
        <option value="h6">見出し6</option>
      </optgroup>
      <optgroup label="リスト">
        <option value="ul">箇条書きリスト</option>
        <option value="ol">番号付きリスト</option>
      </optgroup>
      <option value="blockquote">引用</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watchEffect } from 'vue';
import { detectMarkdownType } from '@/lib/MarkdownDetector';

const markdownType = ref<string | null>('');

const props = defineProps({
  cellValues: {
    type: Object,
    required: true,
  },
});

watchEffect(() => {
  const cellValues = props.cellValues.value.cellValue;
  const select = document.querySelector('select');
  if (!select) return;
  markdownType.value = detectMarkdownType(cellValues);
  if (select) {
    select.value = markdownType.value;
  }
});
</script>
