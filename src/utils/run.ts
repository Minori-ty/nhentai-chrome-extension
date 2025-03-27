/**
 * 异步任务函数的类型定义
 * @template T - 任务执行结果的类型
 */
type AsyncTask<T> = () => Promise<T>

export default async function run<T>(tasks: AsyncTask<T>[], maxConcurrent: number) {
    return new Promise(async (resolve, reject) => {
        // 验证最大并发数是否有效
        if (maxConcurrent < 1) {
            throw new Error('maxConcurrent must be greater than 0')
        }
        let hasError = false
        let taskIndex = 0

        async function runTask(index: number): Promise<void> {
            const task = tasks[index]
            try {
                await task()
            } catch {
                reject(`任务${index}失败了`)
                hasError = true
            }
        }

        async function next(): Promise<void> {
            const currentIndex = taskIndex++
            if (currentIndex >= tasks.length) return
            if (hasError) return
            await runTask(currentIndex)
            return next()
        }
        const initialTasks = Array.from({ length: Math.min(maxConcurrent, tasks.length) }, () => next())
        await Promise.all(initialTasks)
        resolve('任务全部成功')
    })
}
