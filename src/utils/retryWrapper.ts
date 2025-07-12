export default async function retryWrapper<T extends () => Promise<unknown>>(fn: T, imageIndex?: number) {
    let retries = 0
    const maxRetries = 3
    const delay = 1000
    while (retries < maxRetries) {
        try {
            return await fn()
        } catch (error) {
            retries++
            if (retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, delay))
                if (imageIndex) {
                    window.log(`图片${imageIndex}加载失败，重试中`)
                } else {
                    // eslint-disable-next-line nhentai/forbidan-console
                    console.log('下载失败，重试中', retries)
                }
            } else {
                throw error
            }
        }
    }
}
