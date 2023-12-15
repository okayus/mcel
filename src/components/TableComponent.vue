<script setup lang="ts">
import { ref, onUpdated } from 'vue';
import { marked } from 'marked';

const rows = ref<number>(100);
const cols = ref<number>(20);
const inputValues = ref<string[][]>(
  initializeArray(rows.value, cols.value, '')
);
const convertedValues = ref<any[][]>(
  initializeArray(rows.value, cols.value, '')
);
const cellStatus = ref<boolean[][]>(
  initializeArray(rows.value, cols.value, false)
);
const cellInputStatus = ref<boolean[][]>(
  initializeArray(rows.value, cols.value, false)
);

function initializeArray(
  rows: number,
  cols: number,
  initialValue: any
): any[][] {
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

const handleCellKeyPress = (rowIndex: number, colIndex: number) => {
  const focusedCellElement = document.querySelector('.editable');
  const key: string = event.key;
  if (key === 'ArrowUp') {
    moveUp(rowIndex, colIndex);
  } else if (key === 'ArrowDown') {
    moveDown(rowIndex, colIndex);
  } else if (key === 'ArrowRight') {
    moveRight(rowIndex, colIndex);
  } else if (key === 'ArrowLeft') {
    moveLeft(rowIndex, colIndex);
  } else if (key === 'F2') {
    handleCellDoubleClick(rowIndex, colIndex);
  } else if (key === 'Delete') {
    inputValues.value[rowIndex][colIndex] = '';
  }
};

const moveUp = (rowIndex: number, colIndex: number) => {
  if (rowIndex > 0 && !cellInputStatus.value[rowIndex][colIndex]) {
    handleCellClick(rowIndex - 1, colIndex);
  }
};

const moveDown = (rowIndex: number, colIndex: number) => {
  if (rowIndex < rows.value - 1 && !cellInputStatus.value[rowIndex][colIndex]) {
    handleCellClick(rowIndex + 1, colIndex);
  }
};

const moveRight = (rowIndex: number, colIndex: number) => {
  if (colIndex < cols.value - 1 && !cellInputStatus.value[rowIndex][colIndex]) {
    handleCellClick(rowIndex, colIndex + 1);
  }
};

const moveLeft = (rowIndex: number, colIndex: number) => {
  if (colIndex > 0 && !cellInputStatus.value[rowIndex][colIndex]) {
    handleCellClick(rowIndex, colIndex - 1);
  }
};

const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
  cellInputStatus.value[rowIndex][colIndex] = true;
};

onUpdated(() => {
  const selectedCellElement = document.querySelector('.selected');
  if (selectedCellElement) {
    (selectedCellElement as HTMLElement).focus();
  }
  const focusedCellElement = document.querySelector('.editable');
  if (focusedCellElement) {
    (focusedCellElement as HTMLElement).focus();
  }
});

const handleEnterPress = (rowIndex: number, colIndex: number) => {
  convertedValues.value[rowIndex][colIndex] = marked(
    inputValues.value[rowIndex][colIndex]
  );
  handleCellClick(rowIndex, colIndex);
  cellInputStatus.value[rowIndex][colIndex] = false;
};

const handleCellBlur = () => {
  for (let i = 0; i < rows.value; i++) {
    for (let j = 0; j < cols.value; j++) {
      cellInputStatus.value[i][j] = false;
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
        >
          <input
            v-if="cellInputStatus[rowIndex][colIndex]"
            class="editable"
            v-model="inputValues[rowIndex][colIndex]"
            @keydown.enter="handleEnterPress(rowIndex, colIndex)"
            @blur="handleCellBlur()"
          />
          <div
            v-else
            :class="{ selected: cellStatus[rowIndex][colIndex] }"
            @dblclick="handleCellDoubleClick(rowIndex, colIndex)"
            @keydown.prevent="handleCellKeyPress(rowIndex, colIndex)"
            tabindex="0"
            v-html="convertedValues[rowIndex][colIndex]"
          >
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
#app {
  margin: 10px;
}

.spreadsheet {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

td {
  border: 1px solid #ddd;
  text-align: center;
  /* position: relative; */
  height: 30px; /* セルの縦幅を広げる */
  width: 50px; /* セルの横幅を広げる */
}

.editable {
  width: 1000%;
  height: 100%;
  margin-top: 0;
  margin-left: 0;
}

.selected {
  height: 100%;
  width: 100%;
  outline: 2px solid #4285f4;
}

td div {
  vertical-align: middle;
  white-space: nowrap; /* セル内のテキストを折り返さない（全角だけ改行されてた） */
}

</style>
