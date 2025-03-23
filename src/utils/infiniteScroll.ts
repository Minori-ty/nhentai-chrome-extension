import { addDownloadCheckbox } from './addDownloadCheckbox'
import PageIndicator from './indicator'
import Observer from './observer'
import PageEndIndicator from './pageEndIndicator'
import parseHTML from './parseHTML'
import { createDownloadButton } from '@/utils/addDownloadCheckbox'

export default class InfiniteScroll {
    /** 节流定时器 */
    throttleTimer: number | null = null
    /** 节流延迟时间(ms) */
    readonly THROTTLE_DELAY = 200
    /** 接收的页数 */
    page: number
    /** 总页数 */
    total: number
    /** 滚动触发阈值 */
    SCROLL_THRESHOLD = 80
    /** 重试次数 */
    readonly MAX_RETRIES = 3
    /** 重试延迟(ms) */
    readonly RETRY_DELAY = 1000
    /** 容器选择器 */
    containerSelector: string
    /** 观察者 */
    observer: Observer
    /** 页码指示器 */
    indicator: PageIndicator
    /** 是否正在加载中 */
    isLoading = false

    pageEndIndicator: PageEndIndicator

    constructor(containerSelector: string) {
        const url = new URL(window.location.href)
        const page = Number(url.searchParams.get('page') || 1)
        this.indicator = new PageIndicator()
        this.containerSelector = containerSelector
        this.pageEndIndicator = new PageEndIndicator(this.containerSelector)
        this.total = this.getTotalPages()
        this.observer = new Observer(this.indicator, this.total)
        this.page = page
        this.setFirstPage()
        this.addScrollListener()
        createDownloadButton()
    }

    /**
     * 添加滚动监听器
     */
    addScrollListener(): void {
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this)))
    }

    /**
     * 节流函数
     * @param callback 需要节流的回调函数
     * @returns 节流后的函数
     */
    throttle(callback: () => void): () => void {
        return () => {
            if (this.throttleTimer !== null) {
                return
            }

            this.throttleTimer = window.setTimeout(() => {
                callback()
                this.throttleTimer = null
            }, this.THROTTLE_DELAY)
        }
    }

    handleScroll() {
        if (this.page >= this.total) {
            this.pageEndIndicator.removeLoadingIndicator()
            this.pageEndIndicator.addEmptyIndicator()
        }

        if (this.isLoading || this.page >= this.total) {
            return
        }

        if (this.getscrollPercentage() > this.SCROLL_THRESHOLD) {
            this.loadNextPage()
        }
    }

    /**
     *
     * @returns 获取当前页面的滚动百分比
     */
    getscrollPercentage(): number {
        const scrollPosition = window.scrollY + window.innerHeight
        const totalHeight = document.documentElement.scrollHeight
        const scrollPercentage = (scrollPosition / totalHeight) * 100
        return scrollPercentage
    }

    /**
     * 加载下一页
     * @param retryCount 重试次数
     */
    async loadNextPage(retryCount = 0): Promise<void> {
        this.isLoading = true
        const url = new URL(window.location.href)
        const nextPage = this.page + 1
        this.page = nextPage
        url.searchParams.set('page', String(nextPage))
        try {
            const response = await fetch(url.href)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const html = await response.text()
            const doc = parseHTML(html)
            const container = doc.querySelector(this.containerSelector)
            const currentContainer = document.querySelector(this.containerSelector)
            if (!container || !currentContainer) {
                throw new Error('找不到容器元素')
            }
            // 使用文档片段优化性能
            const fragment = document.createDocumentFragment()
            Array.from(container.children).forEach((child) => {
                fragment.appendChild(child)
            })

            // 处理懒加载图片，传入页码
            this.handleLazyImages(fragment, nextPage)
            currentContainer.appendChild(fragment)
        } catch (err) {
            if (retryCount < this.MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY))
                return this.loadNextPage(retryCount + 1)
            }
        } finally {
            this.isLoading = false
        }
    }

    /**
     * 处理懒加载图片
     * @param container 包含懒加载图片的容器
     * @param pageNum 当前页码
     */
    handleLazyImages(container: Element | DocumentFragment, pageNum: number) {
        const lazyImages = container.querySelectorAll('img.lazyload')
        const page = pageNum.toString()
        lazyImages.forEach((img) => {
            if (img instanceof HTMLImageElement) {
                const dataSrc = img.getAttribute('data-src')
                if (dataSrc) {
                    img.src = dataSrc
                    // img.removeAttribute('data-src')
                }
                // 添加页码属性
                img.setAttribute('data-page', page)
                this.observer.addObserve(img)
                addDownloadCheckbox(img)
            }
        })
    }

    getTotalPages(): number {
        const pagination = document.querySelector('.pagination')
        if (!pagination) {
            this.pageEndIndicator.removeLoadingIndicator()
            return 1
        }

        pagination.remove()
        const lastPageLink = pagination.querySelector('.last')
        if (lastPageLink) {
            const href = lastPageLink.getAttribute('href')
            if (href) {
                const match = href.match(/page=(\d+)/)
                if (match) {
                    return parseInt(match[1], 10)
                }
            }
            return -2
        } else {
            const url = new URL(window.location.href)
            const page = url.searchParams.get('page') || '1'
            return Number(page)
        }
    }

    setFirstPage() {
        const url = new URL(window.location.href)
        const page = url.searchParams.get('page') || '1'
        const firstContainer = document.querySelector(this.containerSelector)

        if (firstContainer) {
            const img = firstContainer.querySelectorAll('img.lazyload')
            img.forEach((img) => {
                // 添加页码属性
                img.setAttribute('data-page', page)
                this.observer.addObserve(img)
                if (!(img instanceof HTMLImageElement)) return
                addDownloadCheckbox(img)
            })
        }
    }
}
