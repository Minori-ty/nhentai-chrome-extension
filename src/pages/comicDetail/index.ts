import addSingleButton from '@/utils/addSingleButton'
import '@/assets/sass/hoverImg.scss'
import { singlePage } from '../singlePage'
import './index.scss'

export function comicDetailPage() {
    addSingleButton()
    const url = new URL(window.location.href)
    const single = url.searchParams.get('single')
    if (!single) {
        return
    }
    singlePage()
}
