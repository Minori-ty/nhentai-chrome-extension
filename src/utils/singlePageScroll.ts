import parseHTML from './parseHTML'
import { runConcurrently } from './runConcurrently'
import PageIndicator from './indicator'
import { getNHentaiInfo, mapExt } from '@/api'
import type { INHentaiInfo } from '@/api/index.d'
import retryWrapper from './retryWrapper'
import run from './run'

export default class SinglePageScroll {
    /** 接收的页数, 不一定是1开始 */
    page: number
    /** 总页数 */
    total: number
    loadedImagesCount: number = 0
    /** 画廊ID */
    // galleryId: string
    /** 页码指示器 */
    indicator: PageIndicator

    constructor() {
        const url = new URL(window.location.href)
        const pathname = url.pathname
        const [space1, prefix, galleryId, page, space2] = pathname.split('/')
        this.getNHentaiInfo(galleryId).then((res) => {
            this.fetchAndInsertImages(res)
        })
        // this.galleryId = galleryId
        this.indicator = new PageIndicator()
        this.indicator.updatePageIndicator('加载中...')
        // 获取当前page，不一定为1
        this.page = Number(page)
        this.total = this.getTotalImages()
        this.removeContent()
        this.createPlaceholder()
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
            pageNumDiv.className = 'page-id'
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
    // async loadImage(galleryId: string, pageNum: number): Promise<void> {
    //     const imgWrapper = document.getElementById(`image-wrapper-${pageNum}`)
    //     if (!imgWrapper) return
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const response = await fetch(`/g/${galleryId}/${pageNum}/`)
    //             const html = await response.text()
    //             const doc = parseHTML(html)
    //             const imageContainer = doc.querySelector('#image-container img')
    //             if (!imageContainer) {
    //                 throw new Error('找不到图片元素')
    //             }
    //             const img = document.createElement('img')
    //             img.src = imageContainer.getAttribute('src') || ''
    //             img.className = 'single-mode-image'
    //             img.style.display = 'none'

    //             img.onload = () => {
    //                 const placeholder = imgWrapper.querySelector('.image-placeholder')
    //                 if (placeholder) {
    //                     placeholder.remove()
    //                 }
    //                 img.style.display = 'block'
    //                 resolve()
    //             }

    //             img.onerror = () => {
    //                 reject(new Error(`图片加载失败: ${pageNum}`))
    //             }

    //             imgWrapper.appendChild(img)
    //         } catch (err) {}
    //     })
    // }

    // async fetchAndInsertImages() {
    //     const tasks: (() => Promise<number>)[] = []
    //     this.indicator.updatePageIndicator(`加载中... ${this.loadedImagesCount} / ${this.total - this.page + 1}`)
    //     for (let i = this.page; i <= this.total; i++) {
    //         tasks.push(async () => {
    //             return this.loadImage(this.galleryId, i).then(() => {
    //                 this.loadedImagesCount++
    //                 this.indicator.updatePageIndicator(
    //                     `加载中... ${this.loadedImagesCount} / ${this.total - this.page + 1}`
    //                 )
    //                 return i
    //             })
    //         })
    //     }
    //     try {
    //         await runConcurrently(tasks, 6)
    //         this.indicator.removePageIndicator()
    //     } catch {}
    // }

    async getNHentaiInfo(id: string): Promise<INHentaiInfo> {
        const nhentaiInfo = await getNHentaiInfo(id)
        return nhentaiInfo
    }

    fetchAndInsertImages(nhentaiInfo: INHentaiInfo) {
        const total = nhentaiInfo.images.pages.length
        const list: (() => Promise<unknown>)[] = []
        for (let i = 0; i < total; i++) {
            list.push(() => retryWrapper(() => this.loadImage(nhentaiInfo, i)))
        }
        run(list, 6)
    }

    loadImage(nhentaiInfo: INHentaiInfo, pageNum: number) {
        return new Promise(async (resolve, reject) => {
            const fileName = `${pageNum + 1}${mapExt[nhentaiInfo.images.pages[pageNum].t]}`
            const image = document.createElement('img')
            image.src = `https://i1.nhentai.net/galleries/${nhentaiInfo.media_id}/${fileName}`
            image.className = 'single-mode-image'
            image.onload = function () {
                resolve(null)
                const imgWrapper = document.getElementById(`image-wrapper-${pageNum}`)
                if (!imgWrapper) return
                const placeholder = imgWrapper.querySelector('.image-placeholder')
                if (placeholder) {
                    placeholder.remove()
                }
                imgWrapper.appendChild(image)
            }
            image.onerror = () => {
                reject(new Error(`图片加载失败: ${pageNum}`))
            }
        })
    }
}
