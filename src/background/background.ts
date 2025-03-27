import type { INHentaiInfo } from '@/api/index.d'
import { mapExt } from '@/api'
import JSZip from 'jszip'
import type { ISendMessage } from '@/types'
import { tabChannel } from '@/config'
import ProgressObserver from '@/utils/progressObserver'
import run from '@/utils/run'

let progressPorts: chrome.runtime.Port[] = []

// 监听连接
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== tabChannel) return
    port.onMessage.addListener(async (data: ISendMessage) => {
        // console.log(data)
        // port.postMessage({ farewell: 'goodbye' })
        // const worker = wrap<typeof registerWorker>(new MyWorker())
        // const res = await worker.downloadImage(data)
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
            const zipBase64 = await zip.generateAsync({ type: 'base64' })
            // 构造 data URL
            const dataUrl = `data:application/zip;base64,${zipBase64}`
            // 使用 chrome.downloads.download 触发下载
            chrome.downloads.download(
                {
                    url: dataUrl,
                    filename: `${data.data.title.japanese}.zip`,
                    saveAs: false,
                },
                (downloadId) => {
                    progressObserver.postMessage(data.taskId, 100)
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError)
                    }
                }
            )
        } catch {
            console.log('图片部分下载失败')
        }
    })
})

// chrome.runtime.onMessage.addListener((request: ISendMessage, sender, sendResponse) => {
//     if (request.data) {
//         ;(async () => {
//             let count = 0
//             const total = request.data.images.pages.length
//             try {
//                 const zip = new JSZip()
//                 const data = request.data
//                 const images = data.images.pages
//                 // for (const [index, item] of images.entries()) {
//                 // const fileName = `${index + 1}${mapExt[item.t]}`
//                 // const response = await fetch(`https://i1.nhentai.net/galleries/${data.media_id}/${fileName}`)
//                 // const arrayBuffer = await response.arrayBuffer()
//                 // const imageData = new Uint8Array(arrayBuffer)
//                 // count++
//                 // sendProgress(request.taskId, Math.floor((count / total) * 100))
//                 // zip.file(fileName, imageData)
//                 // }
//                 const downloadTask: Promise<unknown>[] = []
//                 images.forEach((item, index) => {
//                     function task() {
//                         return new Promise(async (resolve, reject) => {
//                             const fileName = `${index + 1}${mapExt[item.t]}`
//                             await sleep()
//                             const response = await fetch(
//                                 `https://i1.nhentai.net/galleries/${data.media_id}/${fileName}`
//                             )
//                             const arrayBuffer = await response.arrayBuffer()
//                             const imageData = new Uint8Array(arrayBuffer)
//                             count++
//                             sendProgress(request.taskId, Math.floor((count / total) * 100))
//                             zip.file(fileName, imageData)
//                             resolve(undefined)
//                         })
//                     }
//                     downloadTask.push(task())
//                 })
//                 await Promise.all(downloadTask)

//                 // 生成 base64 格式的 zip 数据
//                 const zipBase64 = await zip.generateAsync({ type: 'base64' })
//                 // 构造 data URL
//                 const dataUrl = `data:application/zip;base64,${zipBase64}`
//                 // 使用 chrome.downloads.download 触发下载
//                 chrome.downloads.download(
//                     {
//                         url: dataUrl,
//                         filename: `${data.title.japanese}.zip`,
//                         saveAs: false,
//                     },
//                     (downloadId) => {
//                         sendProgress(request.taskId, 100)
//                         if (chrome.runtime.lastError) {
//                             console.error(chrome.runtime.lastError)
//                         }
//                     }
//                 )
//             } catch (err) {
//                 console.error(err)
//                 sendResponse({ error: err })
//             }
//         })()
//         // 返回 true 告诉 Chrome 这是异步响应
//         return true
//     }
//     sendResponse({ error: 'No data provided' })
//     return false
// })

// 当有任务进度更新时，通过所有连接发送（或根据任务标识分发）
function sendProgress(taskId: string, progress: number) {
    progressPorts.forEach((port) => {
        port.postMessage({ taskId, progress })
    })
}

function sleep() {
    return new Promise((r) => {
        setTimeout(() => {
            r(null)
        }, Math.random() * 100)
    })
}

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
            progressObserver.postMessage(
                data.taskId,
                Math.floor((progressObserver.count / data.data.images.pages.length) * 100)
            )
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * 异步任务函数的类型定义
 * @template T - 任务执行结果的类型
 */
type AsyncTask<T> = () => Promise<T>
// function run<T>(tasks: AsyncTask<T>[], maxConcurrent: number) {
//     return new Promise(async (resolve, reject) => {
//         // 验证最大并发数是否有效
//         if (maxConcurrent < 1) {
//             throw new Error('maxConcurrent must be greater than 0')
//         }

//         /** 追踪当前执行到的任务索引 */
//         let taskIndex = 0

//         /**
//          * 执行单个任务的函数
//          * @param index - 任务在数组中的索引位置
//          */
//         const runTask = async (index: number): Promise<void> => {
//             /** 当前要执行的任务 */
//             const task = tasks[index]

//             try {
//                 /** 任务执行的结果 */
//                 task()
//             } catch (err) {
//                 reject(err)
//             }
//         }

//         /**
//          * 执行下一个任务的函数
//          * 通过递归调用实现任务的连续执行
//          */
//         const next = async (): Promise<void> => {
//             // 获取当前任务索引并递增
//             const currentIndex = taskIndex++
//             // 如果所有任务都已开始执行，则返回
//             if (currentIndex >= tasks.length) return

//             // 执行当前任务
//             await runTask(currentIndex)
//             // 递归执行下一个任务
//             return next()
//         }

//         /** 初始的并发任务数组 */
//         const initialTasks = Array.from({ length: Math.min(maxConcurrent, tasks.length) }, () => next())

//         // 等待所有任务完成并返回结果
//         await Promise.all(initialTasks)

//         resolve(null)
//     })
// }

async function retryWrapper<T extends Function>(fn: T) {
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
