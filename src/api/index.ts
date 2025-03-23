import type { INHentaiInfo } from './index.d'

/**
 * 获取nhentai信息
 * @param id
 * @returns
 */
export const getNHentaiInfo = async (id: string) => {
    const response = await fetch(`https://nhentai.net/api/gallery/${id}`)
    const data: INHentaiInfo = await response.json()
    return data
}

/** 文件后缀名映射 */
export const enum Ext {
    /** webp */
    w = 'w',
    /** jpg */
    j = 'j',
}

export const mapExt = {
    [Ext.w]: '.webp',
    [Ext.j]: '.jpg',
} as const
