import { homePage } from './pages/home'
import { singlePage } from './pages/singlePage'
import { favcontainerPage } from './pages/favorites'
import '@/utils/debug'
import { comicDetailPage } from './pages/comicDetail'
/**
 * 将nhentai分成4种类型 1.首页 2.漫画详情页 3.搜索页 4.收藏夹
 * 首页
 * https://nhentai.net
 * https://nhentai.net/?page=2
 *
 * 漫画详情
 * https://nhentai.net/g/559073
 * https://nhentai.net/g/559073/1
 *
 * 收藏
 * https://nhentai.net/favorites
 * https://nhentai.net/favorites/?page=2
 *
 * 搜索
 * https://nhentai.net/tag/big-breasts
 * https://nhentai.net/tag/big-breasts/?page=2
 * https://nhentai.net/search/?q=ntr+big
 * https://nhentai.net/search/?q=ntr+big&page=2
 * https://nhentai.net/search/?q=ntr&sort=popular-week
 * https://nhentai.net/artist/kuromotokun/
 * https://nhentai.net/artist/kuromotokun/?page=2
 * https://nhentai.net/artist/kuromotokun/popular-week?page=2
 * https://nhentai.net/group/nimunoya/
 * https://nhentai.net/parody/original/popular-week?page=2
 */

const pathname = window.location.pathname
const searchPage = ['/search/', '/parody/', '/tag/', '/artist/', '/group/', '/language/', '/category/', '/character/']

if (pathname === '/') {
    homePage()
} else if (pathname.includes('/g/')) {
    comicDetailPage()
} else if (pathname.includes('/favorites/')) {
    favcontainerPage()
} else if (searchPage.some((path) => pathname.includes(path))) {
    homePage()
}
