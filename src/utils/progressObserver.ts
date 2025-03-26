export default class ProgressOberver {
    count = 0
    port: chrome.runtime.Port
    constructor(port: chrome.runtime.Port) {
        this.port = port
    }

    updateCount() {
        this.count++
    }

    postMessage(taskId: string, progress: number) {
        this.port.postMessage({ taskId, progress })
    }
}
