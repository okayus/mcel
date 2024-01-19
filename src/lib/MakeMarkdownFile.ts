interface TableValue {
  rows: number;
  cols: number;
  inputValues: string[][];
  markdownType: string[][];
}

export function makeMarkdownFile(tableValue: TableValue) {
  let markdownFile = '';
  for (let row = 0; row < tableValue.rows; row++) {
    let blankLength = 0;
    while (tableValue.inputValues[row][blankLength] === '') {
      blankLength++;
    }
    if (blankLength === tableValue.cols) {
      markdownFile += '\n';
    } else {
      if (tableValue.markdownType[row][blankLength] === 'Table') {
        let tableCols = blankLength;
        while (tableValue.markdownType[row][tableCols] === 'Table') {
          markdownFile += '| ' + tableValue.inputValues[row][tableCols] + ' ';
          tableCols++;
        }
        markdownFile += '|\n';
        if (row === 0 || tableValue.markdownType[row - 1][blankLength + 1] !== 'Table') {
          for (let i = blankLength; i < tableCols; i++) {
            markdownFile += '| --- ';
          }
          markdownFile += '|\n';
        }
      } else {
        for (let i = 0; i < blankLength; i++) {
          markdownFile += '    ';
        }
        markdownFile += tableValue.inputValues[row][blankLength] + '\n';
      }
    }
  }

  while (markdownFile.slice(-1) === '\n') {
    markdownFile = markdownFile.slice(0, -1);
  }
  return markdownFile;
}
