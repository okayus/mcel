<!-- App.vue -->
<template>
  <div id="app">
    <table>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <td
          v-for="(cell, colIndex) in cols"
          :key="colIndex"
          @click="handleCellClick(rowIndex, colIndex)"
          @dblclick="handleCellDoubleClick(rowIndex, colIndex)"
          :class="{ selected: cellStatus[rowIndex][colIndex] }"
          tabindex="0"
        >
          <input
            v-if="cellInputStatus[rowIndex][colIndex]"
            class="editable"
            @blur="handleCellBlur()"
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onUpdated } from 'vue';

const rows = ref<number>(3);
const cols = ref<number>(3);
const inputValues = ref<string[][]>([]);
for (let i = 0; i < 3; i++) {
  inputValues.value.push([]);
  for (let j = 0; j < 3; j++) {
    inputValues.value[i].push('');
  }
}

const cellStatus = ref<boolean[][]>([]);
for (let i = 0; i < 3; i++) {
  cellStatus.value.push([]);
  for (let j = 0; j < 3; j++) {
    cellStatus.value[i].push(false);
  }
}

const cellInputStatus = ref<boolean[][]>([]);
for (let i = 0; i < 3; i++) {
  cellInputStatus.value.push([]);
  for (let j = 0; j < 3; j++) {
    cellInputStatus.value[i].push(false);
  }
}

const handleCellClick = (rowIndex: number, colIndex: number) => {
  cellStatus.value[rowIndex][colIndex] = true;
  for (let i = 0; i < rows.value; i++) {
    for (let j = 0; j < cols.value; j++) {
      if (i !== rowIndex || j !== colIndex) {
        cellInputStatus.value[i][j] = false;
        cellStatus.value[i][j] = false;
      }
    }
  }
};

const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
  cellInputStatus.value[rowIndex][colIndex] = true;
};

onUpdated(() => {
  const focusedCellElement = document.querySelector('.editable');
  if (focusedCellElement) {
    (focusedCellElement as HTMLElement).focus();
  }
});

const handleCellBlur = () => {
  for (let i = 0; i < rows.value; i++) {
    for (let j = 0; j < cols.value; j++) {
      cellInputStatus.value[i][j] = false;
      cellStatus.value[i][j] = false;
    }
  }
};
</script>

<style scoped>
table {
  border-collapse: collapse;
}

td {
  border: 1px solid #ccc;
  padding: 100px;
}

td:focus {
  outline: 2px solid #4285f4;
}

.selected {
  border-width: 2px;
}

input {
  width: 100%;
  box-sizing: border-box;
  outline: none; /* フォーカス時のアウトラインを非表示にする */
}
</style>
