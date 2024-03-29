<script setup lang="ts">
import FileReader from './FileReader.vue';
import HeaderMenu from './HeaderMenu.vue';
import { ref, onUpdated, toRaw, onMounted, watchEffect } from 'vue';
import { marked } from 'marked';
import ContextMenu from '@imengyu/vue3-context-menu';
import { detectMarkdownType } from '../lib/MarkdownDetector';
import { convertMarkdownType } from '../lib/MarkdownConverter';

const rows:number = 200;
const cols:number = 50;

const pivotCell = ref<number[]>([NaN, NaN]);
const foucusedCell = ref<number[]>([NaN, NaN]);
const editableCell = ref<number[]>([NaN, NaN]);
const startMultipleSelectedCells = ref<number[]>([NaN, NaN]);
const endMultipleSelectedCells = ref<number[]>([NaN, NaN]);

const inputValues = ref<string[][]>(
  initializeInputValues(rows, cols, '', 'inputValues')
);
const convertedValues = ref<any[][]>(
  initializeInputValues(rows, cols, '', 'convertedValues')
);
const selectedOption = ref<string>('text');
const markdownType = ref<string[][]>(
  initializeArray(rows, cols, 'text')
);
const isTableTypeRow = ref<boolean[]>(initializeTableTypeRow(rows));

const stackUndoList = <string[][][]>[];
const stackRedoList = <string[][][]>[];

function initializeInputValues(
  rows: number,
  cols: number,
  initialValue: any,
  key: string
): any[][] {
  // ローカルストレージに保存されているデータがあれば、それを使う
  const savedData = localStorage.getItem(key);
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    if (parsedData.length === rows && parsedData[0].length === cols) {
      return parsedData;
    }
  }
  const array: any[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: any[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(initialValue);
    }
    array.push(row);
  }
  return array;
}

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

function initializeTableTypeRow(rows: number): boolean[] {
  const array: boolean[] = [];
  for (let i = 0; i < rows; i++) {
    array.push(false);
  }
  return array;
}

watchEffect(() => {
  localStorage.setItem('inputValues', JSON.stringify(inputValues.value));
  localStorage.setItem('convertedValues', JSON.stringify(convertedValues.value));
  if(pivotCell !== foucusedCell){
    startMultipleSelectedCells.value[0] = Math.min(pivotCell.value[0], foucusedCell.value[0]);
    startMultipleSelectedCells.value[1] = Math.min(pivotCell.value[1], foucusedCell.value[1]);
    endMultipleSelectedCells.value[0] = Math.max(pivotCell.value[0], foucusedCell.value[0]);
    endMultipleSelectedCells.value[1] = Math.max(pivotCell.value[1], foucusedCell.value[1]);
  }
});

const changeOption = (e: any) => {
  const cloneInputValues = structuredClone(toRaw(inputValues.value));
  stackUndoList.push(cloneInputValues);
  selectedOption.value = e;
  if (!isNaN(pivotCell.value[0])) {
    const startRow = Math.min(pivotCell.value[0], foucusedCell.value[0]);
    const startCol = Math.min(pivotCell.value[1], foucusedCell.value[1]);
    const endRow = Math.max(pivotCell.value[0], foucusedCell.value[0]);
    const endCol = Math.max(pivotCell.value[1], foucusedCell.value[1]);
    for (
      let i = startRow;
      i <= endRow;
      i++
    ) {
      for (
        let j = startCol;
        j <= endCol;
        j++
      ) {
        inputValues.value[i][j] = !inputValues.value[i][j]
          ? inputValues.value[i][j]
          : convertMarkdownType(
              inputValues.value[i][j],
              markdownType.value[i][j],
              selectedOption.value
            );
        markdownType.value[i][j] = selectedOption.value;
        convertedValues.value[i][j] = marked(inputValues.value[i][j]);
      }
      if (selectedOption.value === 'Table') isTableTypeRow.value[i] = true;
    }
  } else {
    inputValues.value[foucusedCell.value[0]][foucusedCell.value[1]] =
      convertMarkdownType(
        inputValues.value[foucusedCell.value[0]][foucusedCell.value[1]],
        markdownType.value[foucusedCell.value[0]][foucusedCell.value[1]],
        selectedOption.value
      );

    markdownType.value[foucusedCell.value[0]][foucusedCell.value[1]] =
      selectedOption.value;

    convertedValues.value[foucusedCell.value[0]][foucusedCell.value[1]] =
      marked(
        inputValues.value[foucusedCell.value[0]][foucusedCell.value[1]]
      );
  }
};

const foucusCell = (
  rowIndex: number,
  colIndex: number,
  isClickEvent: boolean
) => {
  pivotCell.value = [NaN, NaN];
  foucusedCell.value = [rowIndex, colIndex];
  if (isClickEvent) editableCell.value = [NaN, NaN];
};

const handleCellKeyPress = (rowIndex: number, colIndex: number, event: any) => {
  const key: string = event.key;

  if (key === 'Enter') {
    pivotCell.value = [NaN, NaN];
    handleEnterPress(rowIndex, colIndex, event);
    foucusCell(rowIndex + 1, colIndex, false);
    return;
  } else if (key === 'Delete') {
    return;
  } else if (key === 'z' && (event.ctrlKey || event.metaKey)) {
    return;
  } else if (key === 'y' && (event.ctrlKey || event.metaKey)) {
    return;
  } else {
    const cloneInputValues = structuredClone(toRaw(inputValues.value));
    stackUndoList.push(cloneInputValues);
    inputValues.value[rowIndex][colIndex] = '';
    handleCellDoubleClick(rowIndex, colIndex, event);
  }
};

const hadleCellMovement = (
  rowIndex: number,
  colIndex: number,
  event: KeyboardEvent
) => {
  event.preventDefault();
  foucusedCell.value = [rowIndex, colIndex];
  if (event.key === 'ArrowUp') {
    moveUp(rowIndex, colIndex, event);
  } else if (event.key === 'ArrowDown') {
    moveDown(rowIndex, colIndex, event);
  } else if (event.key === 'ArrowRight') {
    moveRight(rowIndex, colIndex, event);
  } else if (event.key === 'ArrowLeft') {
    moveLeft(rowIndex, colIndex, event);
  }
  markdownType.value[foucusedCell.value[0]][foucusedCell.value[1]] =
    markdownType.value[foucusedCell.value[0]][foucusedCell.value[1]] ===
    'Table'
      ? 'Table'
      : detectMarkdownType(
          inputValues.value[foucusedCell.value[0]][foucusedCell.value[1]]
        );
  selectedOption.value =
    markdownType.value[foucusedCell.value[0]][foucusedCell.value[1]];
};

const moveUp = (rowIndex: number, colIndex: number, event: KeyboardEvent) => {
  if (rowIndex > 0 && isNaN(editableCell.value[0])) {
    if (event.ctrlKey || event.metaKey) {
      let rowCounter = rowIndex - 1;
      if (inputValues.value[rowIndex][colIndex]){
        while(inputValues.value[rowCounter][colIndex] !== '' && rowCounter > 0){
          rowCounter--;
        }
        if (rowCounter !== rowIndex - 1) rowCounter++;
      } else {
        while(inputValues.value[rowCounter][colIndex] === '' && rowCounter > 0){
          rowCounter--;
        }
      }
      foucusedCell.value = [rowCounter, colIndex];
    } else {
      foucusedCell.value = [rowIndex - 1, colIndex];
    }
    if (event.shiftKey) {
      pivotCell.value[0] = isNaN(pivotCell.value[0])
        ? rowIndex
        : pivotCell.value[0];
      pivotCell.value[1] = isNaN(pivotCell.value[1])
        ? colIndex
        : pivotCell.value[1];
    } else {
      pivotCell.value = [NaN, NaN];
    }
  }
};

const moveDown = (rowIndex: number, colIndex: number, event: KeyboardEvent) => {
  event.preventDefault();
  if (rowIndex < rows - 1 && isNaN(editableCell.value[0])) {
    if (event.ctrlKey || event.metaKey) {
      let rowCounter = rowIndex + 1;
      if (inputValues.value[rowIndex][colIndex]){
        while(inputValues.value[rowCounter][colIndex] !== '' && rowCounter < rows - 1){
          rowCounter++;
        }
        if (rowCounter !== rowIndex + 1) rowCounter--;
      } else {
        while(inputValues.value[rowCounter][colIndex] === '' && rowCounter < rows - 1){
          rowCounter++;
        }
      }
      foucusedCell.value = [rowCounter, colIndex];
    } else {
      foucusedCell.value = [rowIndex + 1, colIndex];
    }
    if (event.shiftKey) {
      pivotCell.value[0] = isNaN(pivotCell.value[0])
        ? rowIndex
        : pivotCell.value[0];
      pivotCell.value[1] = isNaN(pivotCell.value[1])
        ? colIndex
        : pivotCell.value[1];
      for (
        let i = Math.min(rowIndex, foucusedCell.value[0]);
        i <= Math.max(rowIndex, foucusedCell.value[0]);
        i++
      ) {
      }
    } else {
      pivotCell.value = [NaN, NaN];
    }
  }
};

const moveRight = (
  rowIndex: number,
  colIndex: number,
  event: KeyboardEvent
) => {
  event.preventDefault();
  if (colIndex < cols - 1 && isNaN(editableCell.value[0])) {
    if (event.ctrlKey || event.metaKey) {
      let colCounter = colIndex + 1;
      if (inputValues.value[rowIndex][colIndex]){
        while(inputValues.value[rowIndex][colCounter] !== '' && colCounter < cols - 1){
          colCounter++;
        }
        if (colCounter !== colIndex + 1) colCounter--;
      } else {
        while(inputValues.value[rowIndex][colCounter] === '' && colCounter < cols - 1){
          colCounter++;
        }
      }
      foucusedCell.value = [rowIndex, colCounter];
    } else {
      foucusedCell.value = [rowIndex, colIndex + 1];
    }
    if (event.shiftKey) {
      pivotCell.value[0] = isNaN(pivotCell.value[0])
        ? rowIndex
        : pivotCell.value[0];
      pivotCell.value[1] = isNaN(pivotCell.value[1])
        ? colIndex
        : pivotCell.value[1];
      for (
        let i = Math.min(pivotCell.value[0], foucusedCell.value[0]);
        i <= Math.max(pivotCell.value[0], foucusedCell.value[0]);
        i++
      ) {
      }
    } else {
      pivotCell.value = [NaN, NaN];
    }
  }
};

const moveLeft = (rowIndex: number, colIndex: number, event: KeyboardEvent) => {
  event.preventDefault();
  if (colIndex > 0 && isNaN(editableCell.value[0])) {
    if (event.ctrlKey || event.metaKey) {
      let colCounter = colIndex - 1;
      if (inputValues.value[rowIndex][colIndex]){
        while(inputValues.value[rowIndex][colCounter] !== '' && colCounter > 0){
          colCounter--;
        }
        if (colCounter !== colIndex - 1) colCounter++;
      } else {
        while(inputValues.value[rowIndex][colCounter] === '' && colCounter > 0){
          colCounter--;
        }
      }
      foucusedCell.value = [rowIndex, colCounter];
    } else {
      foucusedCell.value = [rowIndex, colIndex - 1];
    }
    if (event.shiftKey) {
      pivotCell.value[0] = isNaN(pivotCell.value[0])
        ? rowIndex
        : pivotCell.value[0];
      pivotCell.value[1] = isNaN(pivotCell.value[1])
        ? colIndex
        : pivotCell.value[1];
    } else {
      pivotCell.value = [NaN, NaN];
    }
  }
};

const handleTabKey = (
  rowIndex: number,
  colIndex: number,
  event: KeyboardEvent
) => {
  event.preventDefault();
  if (event.shiftKey) {
    moveLeft(rowIndex, colIndex, event);
  } else {
    moveRight(rowIndex, colIndex, event);
  }
};

const cellDelete = (rowIndex: number, colIndex: number) => {
  const cloneInputValues = structuredClone(toRaw(inputValues.value));
  stackUndoList.push(cloneInputValues);
  if (isNaN(pivotCell.value[0])) {
    inputValues.value[rowIndex][colIndex] = '';
    convertedValues.value[rowIndex][colIndex] = '';
    return;
  } else {
    for (
      let i = Math.min(pivotCell.value[0], foucusedCell.value[0]);
      i <= Math.max(pivotCell.value[0], foucusedCell.value[0]);
      i++
    ) {
      for (
        let j = Math.min(pivotCell.value[1], foucusedCell.value[1]);
        j <= Math.max(pivotCell.value[1], foucusedCell.value[1]);
        j++
      ) {
        inputValues.value[i][j] = '';
        convertedValues.value[i][j] = '';
      }
    }
    pivotCell.value = [NaN, NaN];
    foucusedCell.value = [rowIndex, colIndex];
  }
};

const cellCopy = (rowIndex: number, colIndex: number) => {
  let copyText = '';
  if (isNaN(pivotCell.value[0])) {
    copyText = inputValues.value[rowIndex][colIndex];
  } else {
    for (
      let i = Math.min(pivotCell.value[0], foucusedCell.value[0]);
      i <= Math.max(pivotCell.value[0], foucusedCell.value[0]);
      i++
    ) {
      let tableHeaderNotaion = '';
      for (
        let j = Math.min(pivotCell.value[1], foucusedCell.value[1]);
        j <= Math.max(pivotCell.value[1], foucusedCell.value[1]);
        j++
      ) {
        if (markdownType.value[i][j] === 'Table') {
          if (i === 0 || markdownType.value[i - 1][j] !== 'Table') {
            tableHeaderNotaion +=
              j === Math.max(pivotCell.value[1], foucusedCell.value[1])
                ? '| --- |\n'
                : '| --- ';
          }
          copyText +=
            j === Math.max(pivotCell.value[1], foucusedCell.value[1])
              ? '| ' + inputValues.value[i][j] + ' |\n' + tableHeaderNotaion
              : '| ' + inputValues.value[i][j] + ' ';
        } else {
          copyText +=
            j === Math.max(pivotCell.value[1], foucusedCell.value[1])
              ? inputValues.value[i][j] + '\n'
              : inputValues.value[i][j] + '\t';
        }
      }
    }
    copyText = copyText.slice(0, -1);
  }
  navigator.clipboard.writeText(copyText);
};

const cellPaste = (rowIndex: number, colIndex: number) => {
  const cloneInputValues = structuredClone(toRaw(inputValues.value));
  stackUndoList.push(cloneInputValues);
  navigator.clipboard.readText().then((clipText) => {
    const clipTextArray = clipText.split('\n');
    for (let i = 0; i < clipTextArray.length; i++) {
      const clipTextArrayRow = clipTextArray[i].split('\t');
      const clipTextArrayTable = clipTextArray[i].split('|');
      let clipTextArrayTableSplit: string[] = [];
      if (clipTextArrayTable.length > 1) {
        clipTextArrayTableSplit = clipTextArrayTable.filter((item) => {
          return item !== '';
        });
      }
      if (clipTextArrayTableSplit.length > 1) {
        if (clipTextArrayTableSplit[0] === ' --- ') {
          clipTextArray.splice(i, 1);
          i--;
        } else {
          for (let j = 0; j < clipTextArrayTableSplit.length; j++) {
            if(clipTextArrayTableSplit[j].slice(-2) === '\r'){
              clipTextArrayTableSplit[j] = clipTextArrayTableSplit[j].slice(0, -2);
            }
            inputValues.value[rowIndex + i][colIndex + j] =
              clipTextArrayTableSplit[j].trim();
            convertedValues.value[rowIndex + i][colIndex + j] = marked(
              clipTextArrayTableSplit[j].trim()
            );
            markdownType.value[rowIndex + i][colIndex + j] = 'Table';
          }
        }
      } else {
        for (let j = 0; j < clipTextArrayRow.length; j++) {
          inputValues.value[rowIndex + i][colIndex + j] = clipTextArrayRow[j];
          convertedValues.value[rowIndex + i][colIndex + j] = marked(
            clipTextArrayRow[j]
          );
        }
      }
    }
  });
};

const parseMarkdown = (clipText: string, rowIndex: number, colIndex: number) => {
  const clipTextArray = clipText.split('\n');
    for (let i = 0; i < clipTextArray.length; i++) {
      const clipTextArrayRow = clipTextArray[i].split('    ');
      const clipTextArrayTable = clipTextArray[i].split('|');
      let clipTextArrayTableSplit: string[] = [];
      if (clipTextArrayTable.length > 1) {
        clipTextArrayTableSplit = clipTextArrayTable.filter((item) => {
          return item !== '';
        });
      }
      if (clipTextArrayTableSplit.length > 1) {
        if (clipTextArrayTableSplit[0] === ' --- ') {
          clipTextArray.splice(i, 1);
          i--;
        } else {
          for (let j = 0; j < clipTextArrayTableSplit.length; j++) {
            inputValues.value[rowIndex + i][colIndex + j] =
              clipTextArrayTableSplit[j].trim();
            convertedValues.value[rowIndex + i][colIndex + j] = marked(
              clipTextArrayTableSplit[j].trim()
            );
            markdownType.value[rowIndex + i][colIndex + j] = 'Table';
          }
        }
      } else {
        for (let j = 0; j < clipTextArrayRow.length; j++) {
          inputValues.value[rowIndex + i][colIndex + j] = clipTextArrayRow[j];
          convertedValues.value[rowIndex + i][colIndex + j] = marked(
            clipTextArrayRow[j]
          );
        }
      }
    }
};

const cellUndo = () => {
  const cloneInputValues = structuredClone(toRaw(inputValues.value));
  stackRedoList.push(cloneInputValues);
  if (stackUndoList.length > 0) {
    inputValues.value = stackUndoList.pop() as string[][];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        convertedValues.value[i][j] = marked(inputValues.value[i][j]);
      }
    }
  }
};

const cellRedo = () => {
  const cloneInputValues = structuredClone(toRaw(inputValues.value));
  stackUndoList.push(cloneInputValues);
  if (stackRedoList.length > 0) {
    inputValues.value = stackRedoList.pop() as string[][];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        convertedValues.value[i][j] = marked(inputValues.value[i][j]);
      }
    }
  }
};

const handleCellDoubleClick = (
  rowIndex: number,
  colIndex: number,
  event: KeyboardEvent | MouseEvent
) => {
  event.preventDefault();
  editableCell.value = [rowIndex, colIndex];
};

const handleEnterPress = (
  rowIndex: number,
  colIndex: number,
  event: KeyboardEvent
) => {
  if (event.altKey) {
    //alt + enterで改行する
    inputValues.value[rowIndex][colIndex] += '\n';
    return;
  } else {
  /*inputValues.value[rowIndex][colIndex]の最初の三文字が数値+半角ドット+半角スペースの場合、
  上のセルのolタグの個数を取得して、inputValues.value[rowIndex][colIndex]の最初の三文字をolタグの個数+1 + 半角ドット + 半角スペースに変換する
  */
    const inputText = inputValues.value[rowIndex][colIndex];
    const firstThreeChars = inputText.slice(0, 3);
    const regex = /^[0-9]+\.\s$/;
    if (regex.test(firstThreeChars)) {
      let olCount = 0;
      while (
        convertedValues.value[rowIndex - 1 - olCount][colIndex].includes(
          '<ol'
        ) &&
        convertedValues.value[rowIndex - 1 - olCount][colIndex].includes(
          '</ol>'
        )
      ) {
        olCount++;
      }
      // inputValues.value[rowIndex][colIndex]の最初の三文字をolCount+1 + 半角ドット + 半角スペースに変換する
      inputValues.value[rowIndex][colIndex] =
        olCount + 1 + '. ' + inputText.slice(3);
    }
  }
  editableCell.value = [NaN, NaN];
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
  convertedValues.value[rowIndex][colIndex] = convertedValues.value[rowIndex][colIndex].replace(/\n/g, "<br>");
  if(convertedValues.value[rowIndex][colIndex].slice(-4) === "<br>"){
    convertedValues.value[rowIndex][colIndex] = convertedValues.value[rowIndex][colIndex].slice(0, -4);
  }
  editableCell.value = [NaN, NaN];
};

onMounted(() => {
  foucusCell(0, 0, false);
});

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
        label: 'Copy',
        onClick: () => {
          cellCopy(foucusedCell.value[0], foucusedCell.value[1]);
          if (focusedCellElement) {
            (focusedCellElement as HTMLElement).focus();
          }
        },
      },
      {
        label: 'Paste',
        onClick: () => {
          cellPaste(foucusedCell.value[0], foucusedCell.value[1]);
          if (focusedCellElement) {
            (focusedCellElement as HTMLElement).focus();
          }
        },
      },
      {
        label: 'Convert to',
        children: [
          {
            label: 'Text',
            onClick: () => {
              selectedOption.value = 'text';
              changeOption('text');
              if (focusedCellElement) {
                (focusedCellElement as HTMLElement).focus();
              }
            },
          },
          {
            label: 'Heading',
            children: [
              {
                label: 'H1',
                onClick: () => {
                  selectedOption.value = 'h1';
                  changeOption('h1');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
              {
                label: 'H2',
                onClick: () => {
                  selectedOption.value = 'h2';
                  changeOption('h2');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
              {
                label: 'H3',
                onClick: () => {
                  selectedOption.value = 'h3';
                  changeOption('h3');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
              {
                label: 'H4',
                onClick: () => {
                  selectedOption.value = 'h4';
                  changeOption('h4');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
              {
                label: 'H5',
                onClick: () => {
                  selectedOption.value = 'h5';
                  changeOption('h5');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
              {
                label: 'H6',
                onClick: () => {
                  selectedOption.value = 'h6';
                  changeOption('h6');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
            ],
          },
          {
            label: 'List',
            children: [
              {
                label: 'Unordered List',
                onClick: () => {
                  selectedOption.value = 'ul';
                  changeOption('ul');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
              {
                label: 'Ordered List',
                onClick: () => {
                  selectedOption.value = 'ol';
                  changeOption('ol');
                  if (focusedCellElement) {
                    (focusedCellElement as HTMLElement).focus();
                  }
                },
              },
            ],
          },
          {
            label: 'Blockquote',
            onClick: () => {
              selectedOption.value = 'blockquote';
              changeOption('blockquote');
              if (focusedCellElement) {
                (focusedCellElement as HTMLElement).focus();
              }
            },
          },
          {
            label: 'Table',
            onClick: () => {
              selectedOption.value = 'Table';
              changeOption('Table');
              if (focusedCellElement) {
                (focusedCellElement as HTMLElement).focus();
              }
            },
          },
        ],
      },
    ],
  });
};
</script>

<template>
  <div class="grid grid-cols-4 gap-4 m-5">
    <div class="w-1/2">
      <el-select v-model="selectedOption" @change="changeOption($event)">
        <el-option value="text">Text</el-option>
        <el-option value="h1">H1</el-option>
        <el-option value="h2">H2</el-option>
        <el-option value="h3">H3</el-option>
        <el-option value="h4">H4</el-option>
        <el-option value="h5">H5</el-option>
        <el-option value="h6">H6</el-option>
        <el-option value="ul">Unordered List</el-option>
        <el-option value="ol">Ordered List</el-option>
        <el-option value="blockquote">Blockquote</el-option>
        <el-option value="Table">Table</el-option>
      </el-select>
    </div>
    <div></div>
    <div class="text-right">
      <file-reader
      @fileContent="parseMarkdown($event, 0, 0)"
      >
      </file-reader>
    </div>
    <div>
      <header-menu
        :tableValue="{
          rows: rows,
          cols: cols,
          inputValues: inputValues,
          markdownType: markdownType,
        }"
      />
    </div>
  </div>
  <div
    id="app-table"
    @contextmenu="onContextMenu($event)"
    @keydown.shift.f10="shortcutMousuEvent($event)"
  >
    <table class="spreadsheet">
      <thead>
        <tr>
          <th v-for="(col, colIndex) in cols" :key="colIndex">
            {{ colIndex }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td
            v-for="(cell, colIndex) in cols"
            :key="colIndex"
            @click="foucusCell(rowIndex, colIndex, true)"
            :class="{
              multiSelected: rowIndex >= startMultipleSelectedCells[0] && 
                            rowIndex <= endMultipleSelectedCells[0] &&
                            colIndex >= startMultipleSelectedCells[1] &&
                            colIndex <= endMultipleSelectedCells[1],
              markTable: markdownType[rowIndex][colIndex] === 'Table',
            }"
            :id="rowIndex + '-' + colIndex"
          >
            <textarea
              v-if="editableCell[0] === rowIndex && editableCell[1] === colIndex"
              class="editable"
              v-model="inputValues[rowIndex][colIndex]"
              @keydown.enter="handleEnterPress(rowIndex, colIndex, $event)"
              @blur="handleCellBlur(rowIndex, colIndex)"
            >
            </textarea>
            <div
              v-else
              :class="{ selected: foucusedCell[0] === rowIndex && foucusedCell[1] === colIndex}"
              :id="rowIndex + '-' + colIndex"
              @dblclick="handleCellDoubleClick(rowIndex, colIndex, $event)"
              @keydown.enter="handleCellDoubleClick(rowIndex, colIndex, $event)"
              @keydown.f2="handleCellDoubleClick(rowIndex, colIndex, $event)"
              @keydown.up="hadleCellMovement(rowIndex, colIndex, $event)"
              @keydown.down="hadleCellMovement(rowIndex, colIndex, $event)"
              @keydown.right="hadleCellMovement(rowIndex, colIndex, $event)"
              @keydown.left="hadleCellMovement(rowIndex, colIndex, $event)"
              @keydown.tab="handleTabKey(rowIndex, colIndex, $event)"
              @keydown.delete="cellDelete(rowIndex, colIndex)"
              @keydown.ctrl.c="cellCopy(rowIndex, colIndex)"
              @keydown.ctrl.v="cellPaste(rowIndex, colIndex)"
              @keydown.ctrl.z="cellUndo()"
              @keydown.ctrl.y="cellRedo()"
              @keydown.meta.c="cellCopy(rowIndex, colIndex)"
              @keydown.meta.v="cellPaste(rowIndex, colIndex)"
              @keydown.meta.z="cellUndo()"
              @keydown.meta.y="cellRedo()"
              @keypress="handleCellKeyPress(rowIndex, colIndex, $event)"
              tabindex="0"
              v-html="convertedValues[rowIndex][colIndex]"
            ></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
#app-table {
  margin-top: 10px;
  overflow-y: scroll;
  overflow-x: scroll;
  max-height: calc(100vh - 100px);
}

.spreadsheet {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}
table thead th {
  border: 1px solid #f1efef;
  text-align: center;
  width: 50px;
  resize: horizontal;
  overflow: hidden;
}
td {
  border: 1px solid #f1efef;
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
.markTable {
  /* 枠線を太くする */
  outline: 1px solid #030303;
  width: 50em;
  text-align: left;
}
</style>
