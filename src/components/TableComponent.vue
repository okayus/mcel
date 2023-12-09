<template>
  <div class="spreadsheet-container">
    <table class="spreadsheet">
      <tr v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`">
        <td
          v-for="(col, colIndex) in cols"
          :key="`col-${colIndex}`"
          :class="{ 'focused-cell': isCellFocused(rowIndex, colIndex) }"
          @click="setFocusedCell(rowIndex, colIndex)"
          @keydown.prevent="handleCellKeyPress"
          tabindex="0"
        >
          <!-- ここにセルのコンテンツを追加 -->
          Cell {{ rowIndex }}-{{ colIndex }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

interface FocusedCell {
  rowIndex: number;
  colIndex: number;
}

export default defineComponent({
  setup() {
    const rows = ref(40);
    const cols = ref(10);
    const focusedCell = ref<FocusedCell | null>(null);

    const handleCellKeyPress = (event: KeyboardEvent) => {
      const { key } = event;

      if (key === 'ArrowRight') {
        moveRight();
      } else if (key === 'ArrowLeft') {
        moveLeft();
      } else if (key === 'ArrowUp') {
        moveUp();
      } else if (key === 'ArrowDown') {
        moveDown();
      }
    };

    const moveRight = () => {
      if (focusedCell.value !== null && focusedCell.value.colIndex < cols.value - 1) {
        setFocusedCell(focusedCell.value.rowIndex, focusedCell.value.colIndex + 1);
      }
    };

    const moveLeft = () => {
      if (focusedCell.value !== null && focusedCell.value.colIndex > 0) {
        setFocusedCell(focusedCell.value.rowIndex, focusedCell.value.colIndex - 1);
      }
    };

    const moveUp = () => {
      if (focusedCell.value !== null && focusedCell.value.rowIndex > 0) {
        setFocusedCell(focusedCell.value.rowIndex - 1, focusedCell.value.colIndex);
      }
    };

    const moveDown = () => {
      if (focusedCell.value !== null && focusedCell.value.rowIndex < rows.value - 1) {
        setFocusedCell(focusedCell.value.rowIndex + 1, focusedCell.value.colIndex);
      }
    };

    const setFocusedCell = (rowIndex: number, colIndex: number) => {
      focusedCell.value = { rowIndex, colIndex };
    };

    const isCellFocused = (rowIndex: number, colIndex: number) => {
      return (
        focusedCell.value !== null &&
        focusedCell.value.rowIndex === rowIndex &&
        focusedCell.value.colIndex === colIndex
      );
    };

    // focusedCellの変更を監視して手動でクラスの変更をトリガーする
    watch(focusedCell, () => {
      updateFocusedCellClass();
    });

    const updateFocusedCellClass = () => {
      const cells = document.querySelectorAll('.spreadsheet .focused-cell');
      cells.forEach((cell) => {
        cell.classList.remove('focused-cell');
      });

      if (focusedCell.value !== null) {
        const focusedCellElement = document.querySelector(
          `.spreadsheet td:nth-child(${focusedCell.value.colIndex + 1}):nth-child(${focusedCell.value.rowIndex + 1})`
        );
        focusedCellElement?.classList.add('focused-cell');
      }
    };

    return {
      rows,
      cols,
      setFocusedCell,
      isCellFocused,
      handleCellKeyPress,
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

.focused-cell {
  outline: 2px solid blue; /* セルにフォーカスがあたった時の枠線のスタイル */
}

.spreadsheet td {
  border: 1px solid #ddd;
  padding: 0;
}

/* フォーカス時のスタイル */
.spreadsheet td:focus {
  outline: 2px solid #4285f4;
}

/* 初期フォーカス時のスタイル */
.spreadsheet td:focus:first-of-type {
  outline: none; /* 初期フォーカス時のスタイルを削除 */
}
</style>