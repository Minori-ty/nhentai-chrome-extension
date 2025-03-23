import type { Ext } from './index'

export interface INHentaiInfo {
    id: number
    media_id: string
    /** 本子名 */
    title: Title
    images: Images
    scanlator: string
    upload_date: number
    tags: Tag[]
    num_pages: number
    num_favorites: number
}

/** 本子名 */
interface Title {
    /** 英文名 */
    english: string
    /** 日本名 */
    japanese: string
    /** 中文名 */
    pretty: string
}

interface Images {
    pages: Page[]
    cover: Cover
    thumbnail: Thumbnail
}

interface Page {
    /** 文件后缀名 */
    t: Ext
    w: number
    h: number
}

interface Cover {
    t: string
    w: number
    h: number
}

interface Thumbnail {
    /** 文件后缀名 */
    t: Ext
    w: number
    h: number
}

interface Tag {
    id: number
    type: string
    name: string
    url: string
    count: number
}
