export function detectMarkdownType(input: string): string | null {
    const trimmedInput = input.trim();

    if (trimmedInput.startsWith("# ")) {
        return "H1";
    } else if (trimmedInput.startsWith("## ")) {
        return "H2";
    } else if (trimmedInput.startsWith("### ")) {
        return "H3";
    } else if (trimmedInput.startsWith("#### ")) {
        return "H4";
    } else if (trimmedInput.startsWith("##### ")) {
        return "H5";
    } else if (trimmedInput.startsWith("###### ")) {
        return "H6";
    } else {
        return null; // マッチするマークダウンがない場合
    }
}