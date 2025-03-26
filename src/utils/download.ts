import type { INHentaiInfo } from '@/api/index.d'
import { v4 } from 'uuid'
import { createProgress } from './createProgress'
import { port } from '../index'

export function download(nhentaiInfo: INHentaiInfo, checkbox: Element) {
    const taskId = v4()
    createProgress(checkbox, taskId)
    port.postMessage({ data: nhentaiInfo, taskId })
    // chrome.runtime.sendMessage({ data: nhentaiInfo, taskId }, function (response: { data: Uint8Array }) {
    //     if (!response || !response.data) return
    // })
}
