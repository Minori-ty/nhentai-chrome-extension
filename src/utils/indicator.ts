export default class PageIndicator {
    /** 页码指示器元素 */
    pageIndicator: HTMLDivElement | null = null
    constructor() {
        this.pageIndicator = document.createElement('div')
        this.pageIndicator.className = 'page-indicator'
        document.body.appendChild(this.pageIndicator)
    }

    updatePageIndicator(content: string) {
        if (!this.pageIndicator) return
        this.pageIndicator.textContent = content
    }

    removePageIndicator() {
        if (!this.pageIndicator) return
        this.pageIndicator.remove()
    }
}
