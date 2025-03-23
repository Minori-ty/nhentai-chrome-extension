import type { INHentaiInfo } from '@/api/index.d'
import { mapExt } from '@/api'
import JSZip from 'jszip'

// 监听来自内容脚本的消息
// chrome.runtime.onMessage.addListener(async function (request: { data: INHentaiInfo }, sender, sendResponse) {
//     if (request.data) {
//         const zip = new JSZip()
//         const data = request.data
//         const images = data.images.pages
//         for (const [index, item] of images.entries()) {
//             const fileName = `${index + 1}${mapExt[item.t]}`
//             const response = await fetch(`https://i1.nhentai.net/galleries/${data.media_id}/${fileName}`)
//             const arrayBuffer = await response.arrayBuffer()
//             const imageData = new Uint8Array(arrayBuffer)
//             zip.file(fileName, imageData)
//         }
//         const zipBlob = await zip.generateAsync({ type: 'uint8array' })
//         sendResponse({ data: zipBlob })
//         return true
//     }
//     return false
// })

chrome.runtime.onMessage.addListener((request: { data: INHentaiInfo }, sender, sendResponse) => {
    if (request.data) {
        ;(async () => {
            try {
                const zip = new JSZip()
                const data = request.data
                const images = data.images.pages
                for (const [index, item] of images.entries()) {
                    const fileName = `${index + 1}${mapExt[item.t]}`
                    const response = await fetch(`https://i1.nhentai.net/galleries/${data.media_id}/${fileName}`)
                    const arrayBuffer = await response.arrayBuffer()
                    const imageData = new Uint8Array(arrayBuffer)
                    zip.file(fileName, imageData)
                }

                // 生成 base64 格式的 zip 数据
                const zipBase64 = await zip.generateAsync({ type: 'base64' })
                // 构造 data URL
                const dataUrl = `data:application/zip;base64,${zipBase64}`
                // 使用 chrome.downloads.download 触发下载
                chrome.downloads.download(
                    {
                        url: dataUrl,
                        filename: `${data.title.pretty}.zip`,
                        saveAs: false,
                    },
                    (downloadId) => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError)
                        }
                    }
                )
            } catch (err) {
                console.error(err)
                sendResponse({ error: err })
            }
        })()
        // 返回 true 告诉 Chrome 这是异步响应
        return true
    }
    sendResponse({ error: 'No data provided' })
    return false
})
