import type { INHentaiInfo } from '@/api/index.d'
import saveAs from 'file-saver'

export function download(nhentaiInfo: INHentaiInfo) {
    chrome.runtime.sendMessage({ data: nhentaiInfo }, function (response: { data: Uint8Array }) {
        if (!response || !response.data) return

        saveAs(new File([response.data], `${nhentaiInfo.title.pretty}.zip`, { type: 'application/zip' }))
    })
}
