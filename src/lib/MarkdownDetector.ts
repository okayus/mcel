export function detectMarkdownType(input: string): string | null {
    const trimmedInput = input.trim();

    // inputのhtmlタグからマークダウンの種類を検出する。
    const convertedValues = [
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

    for (const convertedValue of convertedValues) {
        if (trimmedInput.startsWith(convertedValue.value)) {
            return convertedValue.key;
        }
    }

    return "text";
}