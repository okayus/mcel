<script setup lang="ts">
import { ref, onUpdated } from 'vue';

const rows = ref<number>(20);
const cols = ref<number>(10);
const inputValues = ref<string[][]>(initializeArray(rows.value, cols.value, ''));
const cellStatus = ref<boolean[][]>(initializeArray(rows.value, cols.value, false));
const cellInputStatus = ref<boolean[][]>(initializeArray(rows.value, cols.value, false));

function initializeArray(rows: number, cols: number, initialValue: any): any[][] {
  const array: any[][] = [];
  for (let i = 0; i < rows; i++) {
    array.push([]);
    for (let j = 0; j < cols; j++) {
      array[i].push(initialValue);
    }
  }
  return array;
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

<template>
  <div id="app">
    <table class="spreadsheet">
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
            v-model="inputValues[rowIndex][colIndex]"
            @blur="handleCellBlur()"
          />
          <span v-else>{{ inputValues[rowIndex][colIndex] }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
#app {
  margin: 20px;
}

.spreadsheet {
  border-collapse: collapse;
  width: 100%;
}

td {
  border: 1px solid #ddd;
  padding: 12px; /* セルの高さを調整 */
  cursor: pointer;
  text-align: center;
}

.selected {
  border-width: 2px;
}

.editable {
  width: 100%;
  box-sizing: border-box;
}

td:focus {
  outline: 2px solid #4285f4;
}

</style>
