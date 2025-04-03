import { mapExt } from '@/api'
import JSZip from 'jszip'
import type { ISendMessage } from '@/types'
import { tabChannel } from '@/config'
import ProgressObserver from '@/utils/progressObserver'
import run from '@/utils/run'

// 监听连接
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== tabChannel) return
    port.onMessage.addListener(async (data: ISendMessage) => {
        const images = data.data.images.pages
        const total = images.length
        const zip = new JSZip()
        const taskList: (() => Promise<unknown>)[] = []
        const progressObserver = new ProgressObserver(port)
        for (let i = 0; i < total; i++) {
            taskList.push(() => retryWrapper(() => createTask({ i, zip, data, progressObserver })))
        }
        try {
            await run(taskList, 6)

            // 生成 base64 格式的 zip 数据
            const zipBase64 = await zip.generateAsync({ type: 'base64' }, function (metadata) {
                progressObserver.postMessage({
                    type: 'zip',
                    taskId: data.taskId,
                    progress: Number(metadata.percent.toFixed(2)),
                })
            })
            // 构造 data URL
            const dataUrl = `data:application/zip;base64,${zipBase64}`
            // 使用 chrome.downloads.download 触发下载
            chrome.downloads.download(
                {
                    url: dataUrl,
                    filename: `${data.data.title.japanese}.zip`,
                    saveAs: false,
                },
                () => {
                    progressObserver.postMessage({ type: 'success', taskId: data.taskId, progress: 100 })
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError)
                    }
                }
            )
        } catch {
            window.log('图片部分下载失败')
        }
    })
})

function createTask({
    i,
    zip,
    data,
    progressObserver,
}: {
    i: number
    zip: JSZip
    data: ISendMessage
    progressObserver: ProgressObserver
}) {
    return new Promise(async (resolve, reject) => {
        try {
            const fileName = `${i + 1}${mapExt[data.data.images.pages[i].t]}`
            const response = await fetch(`https://i1.nhentai.net/galleries/${data.data.media_id}/${fileName}`)
            const arrayBuffer = await response.arrayBuffer()
            const imageData = new Uint8Array(arrayBuffer)
            zip.file(fileName, imageData)
            resolve(null)
            progressObserver.updateCount()
            progressObserver.postMessage({
                type: 'progress',
                taskId: data.taskId,
                progress: Math.floor((progressObserver.count / data.data.images.pages.length) * 100),
            })
        } catch (e) {
            reject(e)
        }
    })
}

async function retryWrapper<T extends () => Promise<unknown>>(fn: T) {
    let retries = 0
    const maxRetries = 3
    const delay = 1000
    while (retries < maxRetries) {
        try {
            return await fn()
        } catch (error) {
            retries++
            if (retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, delay))
                window.log('下载失败，重试中', retries)
            } else {
                throw error
            }
        }
    }
}
