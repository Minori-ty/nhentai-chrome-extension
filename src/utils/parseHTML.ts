/**
 * 解析HTML
 */
export default function parseHTML(html: string): Document {
    const parser = new DOMParser()
    return parser.parseFromString(html, 'text/html')
}
