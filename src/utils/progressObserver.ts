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

export interface IPostMessageType {
    type: 'progress' | 'zip' | 'success'
    taskId: string
    progress: number
}
