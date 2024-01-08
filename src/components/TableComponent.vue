<script setup lang="ts">
import { ref, onUpdated, defineEmits } from 'vue';
import { marked } from 'marked';
import ContextMenu from '@imengyu/vue3-context-menu';
import { detectMarkdownType } from '../lib/MarkdownDetector';

const rows = ref<number>(20);
const cols = ref<number>(20);
const inputValues = ref<string[][]>(
  initializeArray(rows.value, cols.value, '')
);
const selectedOption = ref<string>('text');
const markdownType = ref<string[][]>(
  initializeArray(rows.value, cols.value, 'text')
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
const multipleSelectedCells = ref<boolean[][]>(
  initializeArray(rows.value, cols.value, false)
);
const startPointer = ref<number[]>([NaN, NaN]);
const foucusedPointer = ref<number[]>([NaN, NaN]);

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

const emit = defineEmits(['receiveCellValues']);
const passCellValues = (rowIndex: number, colIndex: number) => {
  const cellValues = {
    rowIndex: rowIndex,
    colIndex: colIndex,
    cellValue: inputValues.value[rowIndex][colIndex],
  };
  emit('receiveCellValues', cellValues);
};

const foucusCell = (
  rowIndex: number,
  colIndex: number,
  isClickEvent: boolean
) => {
  cellStatus.value[rowIndex][colIndex] = true;
  for (let i = 0; i < rows.value; i++) {
    for (let j = 0; j < cols.value; j++) {
      if (i !== rowIndex || j !== colIndex) {
        cellInputStatus.value[i][j] = false;
        cellStatus.value[i][j] = false;
      }
      if (isClickEvent) {
        multipleSelectedCells.value[i][j] = false;
        startPointer.value = [NaN, NaN];
        foucusedPointer.value = [NaN, NaN];
      }
    }
  }
};

const handleCellKeyPress = (rowIndex: number, colIndex: number, event: any) => {
  const focusedCellElement = document.querySelector('.editable');
  const key: string = event.key;

  if (key === 'Enter') {
    handleEnterPress(rowIndex, colIndex);
    return;
  } else if (key === 'Delete') {
    return;
  } else {
    handleCellDoubleClick(rowIndex, colIndex);
  }
};

const hadleCellMovement = (
  rowIndex: number,
  colIndex: number,
  event: KeyboardEvent
) => {
  event.preventDefault();
  foucusedPointer.value = [rowIndex, colIndex];
  if (event.key === 'ArrowUp') {
    moveUp(rowIndex, colIndex, event);
  } else if (event.key === 'ArrowDown') {
    moveDown(rowIndex, colIndex, event);
  } else if (event.key === 'ArrowRight') {
    moveRight(rowIndex, colIndex, event);
  } else if (event.key === 'ArrowLeft') {
    moveLeft(rowIndex, colIndex, event);
  }
  markdownType.value[foucusedPointer.value[0]][foucusedPointer.value[1]] =
      detectMarkdownType(
        inputValues.value[foucusedPointer.value[0]][foucusedPointer.value[1]]
      );
    selectedOption.value =
      markdownType.value[foucusedPointer.value[0]][foucusedPointer.value[1]];
    passCellValues(foucusedPointer.value[0], foucusedPointer.value[1]);
};

const moveUp = (rowIndex: number, colIndex: number, event: KeyboardEvent) => {
  if (rowIndex > 0 && !cellInputStatus.value[rowIndex][colIndex]) {
    if (event.ctrlKey) {
      for (let i = rowIndex; i > 0; i--) {
        foucusCell(i - 1, colIndex, false);
        foucusedPointer.value = [i - 1, colIndex];
        if (inputValues.value[i - 1][colIndex] !== '') {
          break;
        }
      }
    } else {
      foucusCell(rowIndex - 1, colIndex, false);
      foucusedPointer.value = [rowIndex - 1, colIndex];
    }
    if (event.shiftKey) {
      startPointer.value[0] = isNaN(startPointer.value[0])
        ? rowIndex
        : startPointer.value[0];
      startPointer.value[1] = isNaN(startPointer.value[1])
        ? colIndex
        : startPointer.value[1];
      for (
        let i = Math.max(rowIndex, foucusedPointer.value[0]);
        i >= Math.min(rowIndex, foucusedPointer.value[0]);
        i--
      ) {
        for (
          let j = Math.min(startPointer.value[1], foucusedPointer.value[1]);
          j <= Math.max(startPointer.value[1], foucusedPointer.value[1]);
          j++
        ) {
          if (foucusedPointer.value[0] > startPointer.value[0]) {
            multipleSelectedCells.value[rowIndex][j] = false;
            multipleSelectedCells.value[foucusedPointer.value[0]][j] = true;
          } else {
            multipleSelectedCells.value[i][j] =
              i <= startPointer.value[0] ? true : false;
          }
        }
      }
    } else {
      startPointer.value = [NaN, NaN];
      for (let i = 0; i < rows.value; i++) {
        for (let j = 0; j < cols.value; j++) {
          multipleSelectedCells.value[i][j] = false;
        }
      }
    }
  }
};

const moveDown = (rowIndex: number, colIndex: number, event: KeyboardEvent) => {
  event.preventDefault();
  if (rowIndex < rows.value - 1 && !cellInputStatus.value[rowIndex][colIndex]) {
    if (event.ctrlKey) {
      for (let i = rowIndex; i < rows.value - 1; i++) {
        foucusCell(i + 1, colIndex, false);
        foucusedPointer.value = [i + 1, colIndex];
        if (inputValues.value[i + 1][colIndex] !== '') {
          break;
        }
      }
    } else {
      foucusCell(rowIndex + 1, colIndex, false);
      foucusedPointer.value = [rowIndex + 1, colIndex];
    }
    if (event.shiftKey) {
      startPointer.value[0] = isNaN(startPointer.value[0])
        ? rowIndex
        : startPointer.value[0];
      startPointer.value[1] = isNaN(startPointer.value[1])
        ? colIndex
        : startPointer.value[1];
      for (
        let i = Math.min(rowIndex, foucusedPointer.value[0]);
        i <= Math.max(rowIndex, foucusedPointer.value[0]);
        i++
      ) {
        for (
          let j = Math.min(startPointer.value[1], foucusedPointer.value[1]);
          j <= Math.max(startPointer.value[1], foucusedPointer.value[1]);
          j++
        ) {
          if (foucusedPointer.value[0] >= startPointer.value[0]) {
            multipleSelectedCells.value[i][j] =
              i >= startPointer.value[0] ? true : false;
          } else {
            multipleSelectedCells.value[i][j] = false;
            if (foucusedPointer.value[0] === rowIndex + 1) {
              multipleSelectedCells.value[foucusedPointer.value[0]][j] = true;
            }
          }
        }
      }
    } else {
      startPointer.value = [NaN, NaN];
      for (let i = 0; i < rows.value; i++) {
        for (let j = 0; j < cols.value; j++) {
          multipleSelectedCells.value[i][j] = false;
        }
      }
    }
  }
};

const moveRight = (
  rowIndex: number,
  colIndex: number,
  event: KeyboardEvent
) => {
  event.preventDefault();
  if (colIndex < cols.value - 1 && !cellInputStatus.value[rowIndex][colIndex]) {
    if (event.ctrlKey) {
      for (let i = colIndex; i < cols.value - 1; i++) {
        foucusCell(rowIndex, i + 1, false);
        foucusedPointer.value = [rowIndex, i + 1];
        if (inputValues.value[rowIndex][i + 1] !== '') {
          break;
        }
      }
    } else {
      foucusCell(rowIndex, colIndex + 1, false);
      foucusedPointer.value = [rowIndex, colIndex + 1];
    }
    if (event.shiftKey) {
      startPointer.value[0] = isNaN(startPointer.value[0])
        ? rowIndex
        : startPointer.value[0];
      startPointer.value[1] = isNaN(startPointer.value[1])
        ? colIndex
        : startPointer.value[1];
      for (
        let i = Math.min(startPointer.value[0], foucusedPointer.value[0]);
        i <= Math.max(startPointer.value[0], foucusedPointer.value[0]);
        i++
      ) {
        for (
          let j = Math.min(colIndex, foucusedPointer.value[1]);
          j <= Math.max(colIndex, foucusedPointer.value[1]);
          j++
        ) {
          if (foucusedPointer.value[1] >= startPointer.value[1]) {
            multipleSelectedCells.value[i][j] =
              j >= startPointer.value[1] ? true : false;
          } else {
            multipleSelectedCells.value[i][j] = false;
            if (foucusedPointer.value[1] === colIndex + 1) {
              multipleSelectedCells.value[i][foucusedPointer.value[1]] = true;
            }
          }
        }
      }
    } else {
      startPointer.value = [NaN, NaN];
      for (let i = 0; i < rows.value; i++) {
        for (let j = 0; j < cols.value; j++) {
          multipleSelectedCells.value[i][j] = false;
        }
      }
    }
  }
};

const moveLeft = (rowIndex: number, colIndex: number, event: KeyboardEvent) => {
  event.preventDefault();
  if (colIndex > 0 && !cellInputStatus.value[rowIndex][colIndex]) {
    if (event.ctrlKey) {
      for (let i = colIndex; i > 0; i--) {
        foucusCell(rowIndex, i - 1, false);
        foucusedPointer.value = [rowIndex, i - 1];
        if (inputValues.value[rowIndex][i - 1] !== '') {
          break;
        }
      }
    } else {
      foucusCell(rowIndex, colIndex - 1, false);
      foucusedPointer.value = [rowIndex, colIndex - 1];
    }
    if (event.shiftKey) {
      startPointer.value[0] = isNaN(startPointer.value[0])
        ? rowIndex
        : startPointer.value[0];
      startPointer.value[1] = isNaN(startPointer.value[1])
        ? colIndex
        : startPointer.value[1];
      for (
        let i = Math.min(startPointer.value[0], foucusedPointer.value[0]);
        i <= Math.max(startPointer.value[0], foucusedPointer.value[0]);
        i++
      ) {
        for (
          let j = Math.min(colIndex, foucusedPointer.value[1]);
          j <= Math.max(colIndex, foucusedPointer.value[1]);
          j++
        ) {
          if (foucusedPointer.value[1] > startPointer.value[1]) {
            multipleSelectedCells.value[i][colIndex] = false;
            multipleSelectedCells.value[i][foucusedPointer.value[1]] = true;
          } else {
            multipleSelectedCells.value[i][j] =
              j <= startPointer.value[1] ? true : false;
          }
        }
      }
    } else {
      startPointer.value = [NaN, NaN];
      for (let i = 0; i < rows.value; i++) {
        for (let j = 0; j < cols.value; j++) {
          multipleSelectedCells.value[i][j] = false;
        }
      }
    }
  }
};

const cellDelete = (rowIndex: number, colIndex: number) => {
  inputValues.value[rowIndex][colIndex] = '';
  convertedValues.value[rowIndex][colIndex] = '';
};

const cellCopy = (rowIndex: number, colIndex: number) => {
  let copyText = '';
  if (isNaN(startPointer.value[0])) {
    copyText = inputValues.value[rowIndex][colIndex];
  } else {
    for (
      let i = Math.min(startPointer.value[0], foucusedPointer.value[0]);
      i <= Math.max(startPointer.value[0], foucusedPointer.value[0]);
      i++
    ) {
      for (
        let j = Math.min(startPointer.value[1], foucusedPointer.value[1]);
        j <= Math.max(startPointer.value[1], foucusedPointer.value[1]);
        j++
      ) {
        copyText +=
          j === Math.max(startPointer.value[1], foucusedPointer.value[1])
            ? inputValues.value[i][j] + '\n'
            : inputValues.value[i][j] + '\t';
      }
    }
    copyText = copyText.slice(0, -2);
  }
  navigator.clipboard.writeText(copyText);
};

const cellPaste = (rowIndex: number, colIndex: number) => {
  navigator.clipboard.readText().then((clipText) => {
    const clipTextArray = clipText.split('\n');
    for (let i = 0; i < clipTextArray.length; i++) {
      const clipTextArrayRow = clipTextArray[i].split('\t');
      for (let j = 0; j < clipTextArrayRow.length; j++) {
        inputValues.value[rowIndex + i][colIndex + j] = clipTextArrayRow[j];
        convertedValues.value[rowIndex + i][colIndex + j] = marked(
          clipTextArrayRow[j]
        );
        multipleSelectedCells.value[rowIndex + i][colIndex + j] = true;
      }
    }
  });
};

const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
  cellInputStatus.value[rowIndex][colIndex] = true;
};

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
  foucusCell(rowIndex, colIndex, false);
  cellInputStatus.value[rowIndex][colIndex] = false;
  passCellValues(rowIndex, colIndex);
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

// shift + f10でマウスイベントを発火させる
const shortcutMousuEvent = (e: KeyboardEvent) => {
  if (e.shiftKey && e.key === 'F10') {
    const mouseEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0,
    });
    document.getElementById('app')?.dispatchEvent(mouseEvent);
  }
};

const onContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  //tableのフォーカスを外す
  const focusedCellElement = document.querySelector('.selected');
  if (focusedCellElement) {
    (focusedCellElement as HTMLElement).blur();
  }
  //show your menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: 'A menu item',
        onClick: () => {
          const type = detectMarkdownType('# hoge');
          alert(type);
          if (focusedCellElement) {
            (focusedCellElement as HTMLElement).focus();
          }
        },
      },
      {
        label: 'A submenu',
        children: [{ label: 'Item1' }, { label: 'Item2' }, { label: 'Item3' }],
      },
    ],
  });
};
</script>

<template>
  <div>
    <select v-model="selectedOption">
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

  <div
    id="app"
    class="box"
    @contextmenu="onContextMenu($event)"
    @keydown.shift.f10="shortcutMousuEvent($event)"
  >
    <table class="spreadsheet">
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <td
          v-for="(cell, colIndex) in cols"
          :key="colIndex"
          @click="foucusCell(rowIndex, colIndex, true)"
          :class="{ multiSelected: multipleSelectedCells[rowIndex][colIndex] }"
          :id="rowIndex + '-' + colIndex"
        >
          <input
            v-if="cellInputStatus[rowIndex][colIndex]"
            class="editable"
            v-model="inputValues[rowIndex][colIndex]"
            @keydown.enter="handleEnterPress(rowIndex, colIndex)"
            @blur="handleCellBlur(rowIndex, colIndex)"
          />
          <div
            v-else
            :class="{ selected: cellStatus[rowIndex][colIndex] }"
            :id="rowIndex + '-' + colIndex"
            @dblclick="handleCellDoubleClick(rowIndex, colIndex)"
            @keydown.enter="handleCellDoubleClick(rowIndex, colIndex)"
            @keydown.f2="handleCellDoubleClick(rowIndex, colIndex)"
            @keydown.up="hadleCellMovement(rowIndex, colIndex, $event)"
            @keydown.down="hadleCellMovement(rowIndex, colIndex, $event)"
            @keydown.right="hadleCellMovement(rowIndex, colIndex, $event)"
            @keydown.left="hadleCellMovement(rowIndex, colIndex, $event)"
            @keydown.delete="cellDelete(rowIndex, colIndex)"
            @keydown.ctrl.c="cellCopy(rowIndex, colIndex)"
            @keydown.ctrl.v="cellPaste(rowIndex, colIndex)"
            @keypress="handleCellKeyPress(rowIndex, colIndex, $event)"
            tabindex="0"
            v-html="convertedValues[rowIndex][colIndex]"
          ></div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
#app {
  margin: 10px;
  overflow-y: scroll; /* Y軸方向にスクロール可能に */
  overflow-x: scroll; /* X軸方向にスクロール可能に */
  max-height: calc(100vh - 100px); /* 表の高さを画面の高さに合わせる */
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

.multiSelected {
  /* 背景を薄い青にする */
  background-color: #e6f3ff;
}

blockquote {
  position: relative;
  border-left: 3px double #997bad;
  padding-left: 10px;
  background: #e5e6f4;
}
blockquote:before {
  position: absolute;
  font-family: 'FontAwesome';
  content: '\f10d';
  font-size: 18px;
  color: #997bad;
  padding-top: 10px;
}
blockquote p {
  position: relative;
  padding: 30px 10px 0px;
}
blockquote cite {
  display: block;
  font-size: 0.8rem;
  color: #997bad;
  text-align: right;
  padding: 10px;
}
</style>
