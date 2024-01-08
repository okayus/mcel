export function detectMarkdownType(input: string): string {
    const trimmedInput = input.trim();

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

    for (const markdownType of markdownTypes) {
        if (trimmedInput.startsWith(markdownType.value)) {
            return markdownType.key;
        }
    }

    return "text";
}