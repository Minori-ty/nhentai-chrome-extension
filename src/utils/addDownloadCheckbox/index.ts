import { getNHentaiInfo } from '@/api'
import './index.scss'
import { download } from '../download'

export function addDownloadCheckbox(img: HTMLImageElement) {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'download-checkbox'
    checkbox.addEventListener('click', (event) => {
        event.stopPropagation()
    })
    const cover = img.parentElement
    if (!cover) return
    cover.appendChild(checkbox)
    if (!(cover instanceof HTMLAnchorElement)) return

    const href = cover.href
    const result = href.split('/')
    const id = result[4]
    checkbox.setAttribute('data-id', id)
}

export function createDownloadButton() {
    const downloadButton = document.createElement('button')
    downloadButton.id = 'download-comic'
    downloadButton.className = 'btn btn-primary'
    downloadButton.innerHTML = `
        <i class="fa fa-download"></i>
        <span class="text">开始下载</span>
    `
    document.body.appendChild(downloadButton)

    downloadButton.addEventListener('click', () => {
        const checkboxList = document.querySelectorAll('.download-checkbox:checked')
        checkboxList.forEach(async (checkbox) => {
            const id = checkbox.getAttribute('data-id')
            if (!id) return
            const res = await getNHentaiInfo(id)
            download(res, checkbox)
        })
    })
}
