import './index.scss'

export function createProgress(checkbox: Element, taskId: string) {
    const parent = checkbox.parentNode?.parentNode
    if (!parent) return
    const progress = parent.querySelector('.download-progress')
    if (progress) return
    const progressDiv = document.createElement('div')
    progressDiv.className = 'download-progress'
    progressDiv.innerHTML = `
        <div class="progress-container">
            <div class="progress-bar" id="progress-bar_${taskId}"></div>
            <div class="progress-text" id="progress-text_${taskId}">0%</div>
        </div>
    `
    parent.appendChild(progressDiv)
}
