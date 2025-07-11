/* eslint-disable nhentai/forbidan-console */
import { mapExt } from '@/api'
import JSZip from 'jszip'
import type { ISendMessage } from '@/types'
import { tabChannel } from '@/config'
import ProgressObserver, { EPostType } from '@/utils/progressObserver'
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
            const zipBlob = await zip.generateAsync({ type: 'blob' }, function (metadata) {
                // console.log('压缩进度', metadata.percent.toFixed(2))
                progressObserver.postMessage({
                    type: EPostType.zipProgress,
                    id: data.id,
                    progress: Number(metadata.percent.toFixed(2)),
                })
            })
            // 构造 data URL
            const dataUrl = await blobToBase64WithProgress(zipBlob, (precent) => {
                progressObserver.postMessage({ type: EPostType.base64Progress, id: data.id, progress: precent })
            })

            // 使用 chrome.downloads.download 触发下载
            chrome.downloads.download(
                {
                    url: dataUrl,
                    filename: `${data.data.title.japanese}.zip`,
                    saveAs: false,
                },
                (downloadId) => {
                    if (!downloadId) {
                        console.error(chrome.runtime.lastError)
                        return
                    }

                    progressObserver.postMessage({ type: EPostType.successFlag, id: data.id, progress: 100 })
                }
            )
        } catch (e) {
            console.log('图片下载失败', e)
        }
    })

    // 监听端口断开事件
    port.onDisconnect.addListener(() => {
        console.log('端口已断开:', port.name)
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
    return new Promise((resolve, reject) => {
        const fileName = `${i + 1}${mapExt[data.data.images.pages[i].t]}`
        fetch(`https://i${Math.floor(Math.random() * 4) + 1}.nhentai.net/galleries/${data.data.media_id}/${fileName}`)
            .then((response) => {
                response
                    .arrayBuffer()
                    .then((arrayBuffer) => {
                        const imageData = new Uint8Array(arrayBuffer)
                        zip.file(fileName, imageData)
                        resolve(null)
                        progressObserver.updateCount()
                        progressObserver.postMessage({
                            type: EPostType.downloadProgress,
                            id: data.id,
                            progress: Math.floor((progressObserver.count / data.data.images.pages.length) * 100),
                        })
                    })
                    .catch((e) => {
                        reject(e)
                    })
            })
            .catch((e) => {
                reject(e)
            })
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
                console.log('下载失败，重试中', retries)
            } else {
                throw error
            }
        }
    }
}

async function blobToBase64WithProgress(blob: Blob, onProgress: (precent: number) => void) {
    const buffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const chunkSize = 64 * 1024 // 每次处理64KB
    let binary = ''

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize)
        for (let j = 0; j < chunk.length; j++) {
            binary += String.fromCharCode(chunk[j])
        }
        if (onProgress) {
            onProgress(Number(Math.min(((i + chunkSize) / bytes.length) * 100, 100).toFixed(2)))
        }
        // 让出线程，防止阻塞
        await new Promise((resolve) => setTimeout(resolve, 0))
    }

    return `data:application/zip;base64,${btoa(binary)}`
}
