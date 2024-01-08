export function convertMarkdownType(
  originalMarkdown: string,
  fromType: string,
  toType: string
): string {
  // マークダウンの種類を表すプレフィックスを作成
  const fromPrefix = Array(fromType.length + 1).join('#');
  const toPrefix = Array(toType.length + 1).join('#');

  // 元のマークダウン文字列から、変換前のマークダウンの種類を変換後のマークダウンの種類に置き換え
  const convertedMarkdown = originalMarkdown.replace(
    new RegExp(`^${fromPrefix} `, 'gm'),
    `${toPrefix} `
  );

  return convertedMarkdown;
}
