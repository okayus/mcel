<script setup lang="ts">
import HeaderMenu from './HeaderMenu.vue';
import SaveToNotion from './SaveToNotion.vue';
import { ref, onUpdated, toRaw, onMounted } from 'vue';
import { marked } from 'marked';
import ContextMenu from '@imengyu/vue3-context-menu';
import { detectMarkdownType } from '../lib/MarkdownDetector';
import { convertMarkdownType } from '../lib/MarkdownConverter';

const rows = ref<number>(200);
const cols = ref<number>(50);
const inputValues = ref<string[][]>(
  initializeArray(rows.value, cols.value, '')
);
const stackUndoList = <string[][][]>[];
const stackRedoList = <string[][][]>[];
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

const changeOption = (e: any) => {
  const cloneInputValues = structuredClone(toRaw(inputValues.value));
  stackUndoList.push(cloneInputValues);
  selectedOption.value = e;
  if (!isNaN(startPointer.value[0])) {
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
    }
  }

  inputValues.value[foucusedPointer.value[0]][foucusedPointer.value[1]] =
    convertMarkdownType(
      inputValues.value[foucusedPointer.value[0]][foucusedPointer.value[1]],
      markdownType.value[foucusedPointer.value[0]][foucusedPointer.value[1]],
      selectedOption.value
    );

  markdownType.value[foucusedPointer.value[0]][foucusedPointer.value[1]] =
    selectedOption.value;

  convertedValues.value[foucusedPointer.value[0]][foucusedPointer.value[1]] =
    marked(
      inputValues.value[foucusedPointer.value[0]][foucusedPointer.value[1]]
    );
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
        foucusedPointer.value = [rowIndex, colIndex];
      }
    }
  }
};

const handleCellKeyPress = (rowIndex: number, colIndex: number, event: any) => {
  const key: string = event.key;

  if (key === 'Enter') {
    startPointer.value = [NaN, NaN];
    for (let i = 0; i < rows.value; i++) {
      for (let j = 0; j < cols.value; j++) {
        multipleSelectedCells.value[i][j] = false;
      }
    }
    handleEnterPress(rowIndex, colIndex);
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
    markdownType.value[foucusedPointer.value[0]][foucusedPointer.value[1]] ===
    'Table'
      ? 'Table'
      : detectMarkdownType(
          inputValues.value[foucusedPointer.value[0]][foucusedPointer.value[1]]
        );
  selectedOption.value =
    markdownType.value[foucusedPointer.value[0]][foucusedPointer.value[1]];
};

const moveUp = (rowIndex: number, colIndex: number, event: KeyboardEvent) => {
  if (rowIndex > 0 && !cellInputStatus.value[rowIndex][colIndex]) {
    if (event.ctrlKey || event.metaKey) {
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
    if (event.ctrlKey || event.metaKey) {
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
    if (event.ctrlKey || event.metaKey) {
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
    if (event.ctrlKey || event.metaKey) {
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
  if (isNaN(startPointer.value[0])) {
    inputValues.value[rowIndex][colIndex] = '';
    convertedValues.value[rowIndex][colIndex] = '';
    return;
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
        inputValues.value[i][j] = '';
        convertedValues.value[i][j] = '';
        multipleSelectedCells.value[i][j] = false;
      }
    }
    startPointer.value = [NaN, NaN];
    foucusedPointer.value = [rowIndex, colIndex];
  }
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
      let tableHeaderNotaion = '';
      for (
        let j = Math.min(startPointer.value[1], foucusedPointer.value[1]);
        j <= Math.max(startPointer.value[1], foucusedPointer.value[1]);
        j++
      ) {
        if (markdownType.value[i][j] === 'Table') {
          if (i === 0 || markdownType.value[i - 1][j] !== 'Table') {
            tableHeaderNotaion +=
              j === Math.max(startPointer.value[1], foucusedPointer.value[1])
                ? '| --- |\n'
                : '| --- ';
          }
          copyText +=
            j === Math.max(startPointer.value[1], foucusedPointer.value[1])
              ? '| ' + inputValues.value[i][j] + ' |\n' + tableHeaderNotaion
              : '| ' + inputValues.value[i][j] + ' ';
        } else {
          copyText +=
            j === Math.max(startPointer.value[1], foucusedPointer.value[1])
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
            inputValues.value[rowIndex + i][colIndex + j] =
              clipTextArrayTableSplit[j].trim();
            convertedValues.value[rowIndex + i][colIndex + j] = marked(
              clipTextArrayTableSplit[j].trim()
            );
            markdownType.value[rowIndex + i][colIndex + j] = 'Table';
            multipleSelectedCells.value[rowIndex + i][colIndex + j] = true;
          }
        }
      } else {
        for (let j = 0; j < clipTextArrayRow.length; j++) {
          inputValues.value[rowIndex + i][colIndex + j] = clipTextArrayRow[j];
          convertedValues.value[rowIndex + i][colIndex + j] = marked(
            clipTextArrayRow[j]
          );
          multipleSelectedCells.value[rowIndex + i][colIndex + j] = true;
        }
      }
    }
  });
};

const cellUndo = () => {
  const cloneInputValues = structuredClone(toRaw(inputValues.value));
  stackRedoList.push(cloneInputValues);
  if (stackUndoList.length > 0) {
    inputValues.value = stackUndoList.pop() as string[][];
    for (let i = 0; i < rows.value; i++) {
      for (let j = 0; j < cols.value; j++) {
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
    for (let i = 0; i < rows.value; i++) {
      for (let j = 0; j < cols.value; j++) {
        convertedValues.value[i][j] = marked(inputValues.value[i][j]);
      }
    }
  }
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
          cellCopy(foucusedPointer.value[0], foucusedPointer.value[1]);
          if (focusedCellElement) {
            (focusedCellElement as HTMLElement).focus();
          }
        },
      },
      {
        label: 'Paste',
        onClick: () => {
          cellPaste(foucusedPointer.value[0], foucusedPointer.value[1]);
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
  <div class="grid grid-cols-4 gap-4">
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
    <div>
      <save-to-notion />
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
          :class="{
            multiSelected: multipleSelectedCells[rowIndex][colIndex],
            markTable: markdownType[rowIndex][colIndex] === 'Table',
          }"
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
    </table>
  </div>
</template>

<style scoped>
#app {
  margin: 10px;
  overflow-y: scroll; /* Y軸方向にスクロール可能に */
  overflow-x: scroll; /* X軸方向にスクロール可能に */
  max-height: calc(100vh - 100px);
}

.spreadsheet {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
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
