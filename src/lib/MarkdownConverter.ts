export function convertMarkdownType(
  originalMarkdown: string,
  fromType: string,
  toType: string
): string {
  const markdownTypes = [
    { key: 'h1', value: '# ' },
    { key: 'h2', value: '## ' },
    { key: 'h3', value: '### ' },
    { key: 'h4', value: '#### ' },
    { key: 'h5', value: '##### ' },
    { key: 'h6', value: '###### ' },
    { key: 'blockquote', value: '> ' },
    { key: 'ul', value: '- ' },
    { key: 'ol', value: '1. ' },
];

  let convertedMarkdown = originalMarkdown;
  const markdownType = markdownTypes.find((type) => type.key === fromType);
  if (markdownType) {
    convertedMarkdown = convertedMarkdown.replace(markdownType.value, '');
  }

  const toMarkdownType = markdownTypes.find((type) => type.key === toType);
  if (toMarkdownType) {
    convertedMarkdown = toMarkdownType.value + convertedMarkdown;
  }

  return convertedMarkdown;
}
