export default class ProgressOberver {
    count = 0
    port: chrome.runtime.Port
    constructor(port: chrome.runtime.Port) {
        this.port = port
    }

    updateCount() {
        this.count++
    }

    postMessage(data: IPostMessageType) {
        this.port.postMessage(data)
    }
}
export const enum EPostType {
    /** 下载进度 */
    downloadProgress = 'downloadProgress',
    /** 压缩进度 */
    zipProgress = 'zipProgress',
    /** base64编码进度 */
    base64Progress = 'Progress',
    /** 成功标志 */
    successFlag = 'successFlag',
    /** 下载地址 */
    blob = 'blob',
}

type EPostTypeValues = `${EPostType}`
type WithoutBlobUrl = Exclude<EPostTypeValues, 'blob'>
export type IPostMessageType = IPostMessageProgress | IPostMessageDownload

interface IPostMessageProgress {
    type: WithoutBlobUrl
    id: number
    progress: number
}
interface IPostMessageDownload {
    type: 'blob'
    id: number
    blob: Blob
}
