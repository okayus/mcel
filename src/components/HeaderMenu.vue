<template>
  <div>
      <select v-model="selectedMarkdownType" @change="updateInputValues">
        <optgroup label="見出し">
          <option value="H1">見出し1</option>
          <option value="H2">見出し2</option>
          <option value="H3">見出し3</option>
          <option value="H4">見出し4</option>
          <option value="H5">見出し5</option>
          <option value="H6">見出し6</option>
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
import { defineProps, ref } from 'vue';

const props = defineProps({
  inputValues: {
    type: Object,
    required: true,
  },
  updateInputValues: {
    type: Function,
    required: true,
  },
});

// const selectedMarkdownType = ref(props.inputValues.markdownType);
const selectedMarkdownType = ref(props.inputValues);

const updateInputValues = () => {
  props.updateInputValues({
    markdownType: selectedMarkdownType.value,
  });
};
</script>

