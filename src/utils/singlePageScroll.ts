import parseHTML from './parseHTML'
import { runConcurrently } from './runConcurrently'
import PageIndicator from './indicator'

export default class SinglePageScroll {
    /** 接收的页数 */
    page: number
    /** 总页数 */
    total: number
    loadedImagesCount: number = 0
    /** 画廊ID */
    galleryId: string
    /** 页码指示器 */
    indicator: PageIndicator

    constructor() {
        this.indicator = new PageIndicator()
        this.indicator.updatePageIndicator('加载中...')
        const url = new URL(window.location.href)
        const pathname = url.pathname
        const [space1, prefix, galleryId, page, space2] = pathname.split('/')
        this.galleryId = galleryId
        this.page = Number(page)
        this.total = this.getTotalImages()
        this.removeContent()
        this.createPlaceholder()
        this.fetchAndInsertImages()
    }

    getTotalImages(): number {
        const numPagesElement = document.querySelector('.num-pages')
        if (!numPagesElement) return 0
        return Number(numPagesElement.textContent || '0')
    }

    removeContent() {
        const contentElement = document.querySelector('#content')
        if (contentElement) {
            contentElement.remove()
        }
    }

    /**
     * 创建占位盒子
     * @returns 包含占位盒子的包装器元素
     */
    createPlaceholder() {
        const container = document.createElement('div')
        container.className = 'single-mode-container'
        document.body.appendChild(container)

        for (let i = this.page; i <= this.total; i++) {
            const imgWrapper = document.createElement('div')
            imgWrapper.className = 'single-image-wrapper'
            imgWrapper.id = `image-wrapper-${i}`

            const pageNumDiv = document.createElement('div')
            pageNumDiv.className = 'page-indicator'
            pageNumDiv.textContent = `${i} / ${this.total}`
            imgWrapper.appendChild(pageNumDiv)

            const placeholder = document.createElement('div')
            placeholder.className = 'image-placeholder'
            imgWrapper.appendChild(placeholder)
            container.appendChild(imgWrapper)
        }
    }

    /**
     * 加载单张图片
     * @param galleryId 画廊ID
     * @param pageNum 页码
     * @returns Promise，在图片加载完成时resolve
     */
    async loadImage(galleryId: string, pageNum: number): Promise<void> {
        const imgWrapper = document.getElementById(`image-wrapper-${pageNum}`)
        if (!imgWrapper) return
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`/g/${galleryId}/${pageNum}/`)
                const html = await response.text()
                const doc = parseHTML(html)
                const imageContainer = doc.querySelector('#image-container img')
                if (!imageContainer) {
                    throw new Error('找不到图片元素')
                }
                const img = document.createElement('img')
                img.src = imageContainer.getAttribute('src') || ''
                img.className = 'single-mode-image'
                img.style.display = 'none'

                img.onload = () => {
                    const placeholder = imgWrapper.querySelector('.image-placeholder')
                    if (placeholder) {
                        placeholder.remove()
                    }
                    img.style.display = 'block'
                    resolve()
                }

                img.onerror = () => {
                    reject(new Error(`图片加载失败: ${pageNum}`))
                }

                imgWrapper.appendChild(img)
            } catch (err) {}
        })
    }

    async fetchAndInsertImages() {
        const tasks: (() => Promise<number>)[] = []
        this.indicator.updatePageIndicator(`加载中... ${this.loadedImagesCount} / ${this.total - this.page + 1}`)
        for (let i = this.page; i <= this.total; i++) {
            tasks.push(async () => {
                return this.loadImage(this.galleryId, i).then(() => {
                    this.loadedImagesCount++
                    this.indicator.updatePageIndicator(
                        `加载中... ${this.loadedImagesCount} / ${this.total - this.page + 1}`
                    )
                    return i
                })
            })
        }
        try {
            await runConcurrently(tasks, 6)
            this.indicator.removePageIndicator()
        } catch {}
    }
}
