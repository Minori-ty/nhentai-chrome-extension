import type { INHentaiInfo } from '@/api/index.d'
import { createProgress } from './createProgress'
import { port } from '../index'
import type { ISendMessage } from '@/types'

export function download(nhentaiInfo: INHentaiInfo, checkbox: Element) {
    createProgress(checkbox, nhentaiInfo.id)
    const data: ISendMessage = { data: nhentaiInfo, id: nhentaiInfo.id }
    port.postMessage(data)
}
