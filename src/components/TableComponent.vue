<template>
  <div class="spreadsheet-container">
    <table class="spreadsheet">
      <tr v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`">
        <td v-for="(col, colIndex) in cols" :key="`col-${colIndex}`">
          <div class="cell-content">
          <input
            v-model="inputValues[rowIndex * cols + colIndex]"
            type="text"
            class="input-items"
            @keydown.prevent.right="moveRight(rowIndex, colIndex)"
            @keydown.prevent.left="moveLeft(rowIndex, colIndex)"
            @keydown.prevent.up="moveUp(rowIndex, colIndex)"
            @keydown.prevent.down="moveDown(rowIndex, colIndex)"
            @keydown.prevent.enter="moveDown(rowIndex, colIndex)"
          />
        </div>
        </td>
      </tr>
    </table>
    <button @click="downloadMarkdown">Download as Markdown</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import { saveAs } from 'file-saver';

export default defineComponent({
  setup() {
    const rows = ref(40);
    const cols = ref(10);
    const inputValues = ref(Array(rows.value * cols.value).fill(''));

    const moveFocus = (rowIndex: number, colIndex: number) => {
      const index = rowIndex * cols.value + colIndex;
      const elements = document.getElementsByClassName('input-items');
      if (elements[index]) {
        (elements[index] as HTMLElement).focus();
      }
    };

    const moveRight = (rowIndex: number, colIndex: number) => {
      const currentCol = colIndex;
      if (currentCol < cols.value - 1) {
        moveFocus(rowIndex, colIndex+1);
      }
    };

    const moveLeft = (rowIndex: number, colIndex: number) => {
      const currentCol = colIndex;
      if (currentCol > 0) {
        moveFocus(rowIndex, colIndex-1);
      }
    };

    const moveUp = (rowIndex: number, colIndex: number) => {
      moveFocus(rowIndex-1, colIndex);
    };

    const moveDown = (rowIndex: number, colIndex: number) => {
      moveFocus(rowIndex+1, colIndex);
    };

    watchEffect(() => {
      inputValues.value = Array(rows.value * cols.value).fill('');
    });

    const downloadMarkdown = () => {
      const markdownContent = generateMarkdown();
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      saveAs(blob, 'output.md');
    };

    const generateMarkdown = () => {
      const markdownRows = [];

      // 行ごとに処理
      for (let rowIndex = 0; rowIndex < rows.value; rowIndex++) {
        const rowStart = rowIndex * cols.value;
        const rowEnd = rowStart + cols.value;
        const rowContent = inputValues.value.slice(rowStart, rowEnd);

        // 空でないセルがある場合のみ追加
        const nonEmptyCells = rowContent.filter(value => value.trim() !== '');
        if (nonEmptyCells.length > 0) {
          markdownRows.push(`- ${nonEmptyCells.join('\n  - ')}`);
        }
      }

      return markdownRows.join('\n');
    };

    return {
      rows,
      cols,
      inputValues,
      downloadMarkdown,
      moveRight: moveRight,
      moveLeft: moveLeft,
      moveUp: moveUp,
      moveDown: moveDown,
    };
  },
});
</script>

<style scoped>
.spreadsheet-container {
  margin: 20px;
}

.spreadsheet {
  border-collapse: collapse;
  width: 100%;
}

.spreadsheet td {
  border: 1px solid #ddd;
  padding: 0;
}

.cell-content {
  overflow: hidden; /* はみ出るコンテンツを非表示にする */
  white-space: nowrap; /* テキストを折り返さずに表示 */
  text-overflow: ellipsis; /* はみ出した場合に省略記号 (...) を表示 */
}

.input-items {
  width: 100%;
  box-sizing: border-box;
  border: none; /* セルとの境界線をなくす */
  outline: none; /* フォーカス時のアウトラインを非表示にする */
}
</style>