import InfiniteScroll from '@src/utils/infiniteScroll'
import '@/assets/sass/hoverImg.scss'

export function homePage() {
    new InfiniteScroll('.container.index-container:not(.index-popular)')
}
