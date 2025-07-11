import { homePage } from './pages/home'
import { favcontainerPage } from './pages/favorites'
import { comicDetailPage } from './pages/comicDetail'
import { tabChannel } from '@/config'
import { EPostType, type IPostMessageType } from '@/utils/progressObserver'
import '@/utils/clearConsole'

/**
 * 将nhentai分成4种类型 1.首页 2.漫画详情页 3.搜索页 4.收藏夹
 * 首页
 * https://nhentai.net
 * https://nhentai.net/?page=2
 *
 * 漫画详情
 * https://nhentai.net/g/559073
 * https://nhentai.net/g/559073/1
 *
 * 收藏
 * https://nhentai.net/favorites
 * https://nhentai.net/favorites/?page=2
 *
 * 搜索
 * https://nhentai.net/tag/big-breasts
 * https://nhentai.net/tag/big-breasts/?page=2
 * https://nhentai.net/search/?q=ntr+big
 * https://nhentai.net/search/?q=ntr+big&page=2
 * https://nhentai.net/search/?q=ntr&sort=popular-week
 * https://nhentai.net/artist/kuromotokun/
 * https://nhentai.net/artist/kuromotokun/?page=2
 * https://nhentai.net/artist/kuromotokun/popular-week?page=2
 * https://nhentai.net/group/nimunoya/
 * https://nhentai.net/parody/original/popular-week?page=2
 */

const pathname = window.location.pathname
const searchPage = ['/search/', '/parody/', '/tag/', '/artist/', '/group/', '/language/', '/category/', '/character/']

if (pathname === '/') {
    homePage()
} else if (pathname.includes('/g/')) {
    comicDetailPage()
} else if (pathname.includes('/favorites/')) {
    favcontainerPage()
} else if (searchPage.some((path) => pathname.includes(path))) {
    homePage()
}

export const port = chrome.runtime.connect({ name: tabChannel })
port.onMessage.addListener((data: IPostMessageType) => {
    const progressBar = document.getElementById(`progress-bar_${data.id}`)
    const progressText = document.getElementById(`progress-text_${data.id}`)
    const checkbox = document.querySelector<HTMLInputElement>(`input[data-id="${data.id}"]`)
    if (!progressBar || !progressText) return
    switch (data.type) {
        case EPostType.downloadProgress:
            setClass(progressBar, 'progress')
            progressBar.style.width = data.progress + '%'
            progressText.textContent = `下载中 ${data.progress}%`
            break

        case EPostType.zipProgress:
            setClass(progressBar, 'zip')
            progressBar.style.width = data.progress + '%'
            progressText.textContent = `编码中 ${data.progress}%`
            break

        case EPostType.base64Progress:
            setClass(progressBar, 'base64')
            progressBar.style.width = data.progress + '%'
            progressText.textContent = `压缩中 ${data.progress}%`
            break

        case EPostType.successFlag:
            setClass(progressBar, 'success')
            progressBar.style.width = data.progress + '%'
            progressText.textContent = `下载成功`

            if (checkbox) {
                checkbox.checked = false
            }
            break
    }
})

// 监听端口断开事件
port.onDisconnect.addListener(() => {
    window.log('与背景脚本的连接已断开')
})

// 页面卸载时断开连接
window.addEventListener('unload', () => {
    port.disconnect()
})

function setClass(progressBar: HTMLElement, className: string) {
    progressBar.className = ''
    progressBar.classList.add('progress-bar')
    progressBar.classList.add(className)
}
