import './index.scss'

export default class PageEndIndicator {
    containerSelector: string
    loadingDiv: HTMLDivElement
    endDiv: HTMLDivElement
    constructor(containerSelector: string) {
        this.containerSelector = containerSelector
        this.loadingDiv = document.createElement('div')
        this.endDiv = document.createElement('div')

        let loadingDiv = document.querySelector<HTMLDivElement>('.infinite-scroll-loading')
        if (loadingDiv) return
        loadingDiv = document.createElement('div')
        loadingDiv.className = 'infinite-scroll-loading'

        // 创建加载动画
        const spinner = document.createElement('div')
        spinner.className = 'loading-spinner'
        loadingDiv.appendChild(spinner)

        // 创建文本
        const text = document.createElement('span')
        text.textContent = '加载中...'
        loadingDiv.appendChild(text)

        /** 容器选择器 */
        const container = document.querySelector(this.containerSelector)
        if (!container) {
            throw new Error('找不到目标容器元素')
        }

        container.parentNode?.insertBefore(loadingDiv, container.nextSibling)
        this.loadingDiv = loadingDiv
    }

    removeLoadingIndicator() {
        this.loadingDiv.remove()
    }

    addEmptyIndicator() {
        let endDiv = document.querySelector<HTMLDivElement>('.infinite-scroll-end')
        if (endDiv) return
        endDiv = document.createElement('div')
        endDiv.className = 'infinite-scroll-end'
        endDiv.textContent = '- 已经没有了 -'
        /** 容器选择器 */
        const container = document.querySelector(this.containerSelector)
        if (!container) {
            throw new Error('找不到目标容器元素')
        }

        container.parentNode?.insertBefore(endDiv, container.nextSibling)
        this.endDiv = endDiv
    }

    removeEmptyIndicator() {
        this.endDiv.remove()
    }
}
