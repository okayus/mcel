<script setup lang="ts">
import { defineProps, ref, defineEmits } from 'vue';


const props = defineProps({
    inputValue: {
        type: Object,
        required: true,
    },
});

const inputValue = ref(props.inputValue);

const emits = defineEmits(['update:inputValue']);

const handleEnterPress = (rowIndex: number, colIndex: number) => {
  /*inputValues.value[rowIndex][colIndex]の最初の三文字が数値+半角ドット+半角スペースの場合、
  上のセルのolタグの個数を取得して、inputValues.value[rowIndex][colIndex]の最初の三文字をolタグの個数+1 + 半角ドット + 半角スペースに変換する
  */
  const inputText = inputValues.value[rowIndex][colIndex];
  const firstThreeChars = inputText.slice(0, 3);
  const regex = /^[0-9]+\.\s$/;
  if (regex.test(firstThreeChars)) {
    let olCount = 0;
    while (
      convertedValues.value[rowIndex - 1 - olCount][colIndex].includes('<ol') &&
      convertedValues.value[rowIndex - 1 - olCount][colIndex].includes('</ol>')
    ) {
      olCount++;
    }
    // inputValues.value[rowIndex][colIndex]の最初の三文字をolCount+1 + 半角ドット + 半角スペースに変換する
    inputValues.value[rowIndex][colIndex] =
      olCount + 1 + '. ' + inputText.slice(3);
  }
  convertedValues.value[rowIndex][colIndex] = marked(
    inputValues.value[rowIndex][colIndex]
  );
  cellInputStatus.value[rowIndex][colIndex] = false;
  if (markdownType.value[rowIndex][colIndex] !== 'Table') {
    markdownType.value[rowIndex][colIndex] = detectMarkdownType(
      inputValues.value[rowIndex][colIndex]
    );
  }
  selectedOption.value = markdownType.value[rowIndex][colIndex];
};

const handleCellBlur = (rowIndex: number, colIndex: number) => {
  convertedValues.value[rowIndex][colIndex] = marked(
    inputValues.value[rowIndex][colIndex]
  );
  for (let i = 0; i < rows.value; i++) {
    for (let j = 0; j < cols.value; j++) {
      cellInputStatus.value[i][j] = false;
    }
  }
};

</script>

<template>
  <input
    class="editable"
    v-model="inputValues[rowIndex][colIndex]"
    @keydown.enter="handleEnterPress(rowIndex, colIndex)"
    @blur="handleCellBlur(rowIndex, colIndex)"
  />
</template>

<style scoped>
  .editable {
    border: none;
    outline: none;
    background-color: transparent;
    width: 100%;
    height: 100%;
  }
</style>