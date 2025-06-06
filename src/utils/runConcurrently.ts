/**
 * @fileoverview 并发控制工具函数，用于限制异步任务的并发执行数量
 */

/**
 * 异步任务函数的类型定义
 * @template T - 任务执行结果的类型
 */
type AsyncTask<T> = () => Promise<T>

/**
 * 任务执行结果的类型定义
 */
type TaskResult<T> = {
    /** 任务是否执行成功 */
    success: boolean
    /** 任务成功时的返回数据 */
    data?: T
    /** 任务失败时的错误信息 */
    error?: Error
}

/**
 * 控制异步任务并发执行的函数
 * @template T - 任务返回结果的类型
 * @param tasks - 需要执行的异步任务数组
 * @param maxConcurrent - 最大并发执行数量
 * @returns 所有任务的执行结果数组
 * @throws 当maxConcurrent小于1时抛出错误
 */
export const runConcurrently = async <T>(tasks: AsyncTask<T>[], maxConcurrent: number): Promise<TaskResult<T>[]> => {
    // 验证最大并发数是否有效
    if (maxConcurrent < 1) {
        throw new Error('maxConcurrent must be greater than 0')
    }

    /** 存储所有任务的执行结果 */
    const results: TaskResult<T>[] = []

    /** 追踪当前执行到的任务索引 */
    let taskIndex = 0

    /**
     * 执行单个任务的函数
     * @param index - 任务在数组中的索引位置
     */
    const runTask = async (index: number): Promise<void> => {
        /** 当前要执行的任务 */
        const task = tasks[index]

        try {
            /** 任务执行的结果 */
            const result = await task()
            // 存储成功的任务结果
            results[index] = {
                success: true,
                data: result,
            }
        } catch (err) {
            // 存储失败的任务结果
            results[index] = {
                success: false,
                error: err instanceof Error ? err : new Error(String(err)),
            }
        }
    }

    /**
     * 执行下一个任务的函数
     * 通过递归调用实现任务的连续执行
     */
    const next = async (): Promise<void> => {
        // 获取当前任务索引并递增
        const currentIndex = taskIndex++
        // 如果所有任务都已开始执行，则返回
        if (currentIndex >= tasks.length) return

        // 执行当前任务
        await runTask(currentIndex)
        // 递归执行下一个任务
        return next()
    }

    /** 初始的并发任务数组 */
    const initialTasks = Array.from({ length: Math.min(maxConcurrent, tasks.length) }, () => next())

    // 等待所有任务完成并返回结果
    await Promise.all(initialTasks)
    return results
}
