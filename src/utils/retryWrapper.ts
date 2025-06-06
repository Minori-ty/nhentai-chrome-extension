export default async function retryWrapper<T extends () => Promise<unknown>>(fn: T) {
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
                window.log('下载失败，重试中', retries)
            } else {
                throw error
            }
        }
    }
}
