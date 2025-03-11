/**
 * 添加单图浏览按钮
 * @returns
 */
export default function addSingleButton() {
    const favoriteBtn = document.querySelector('#favorite')
    if (!favoriteBtn) return

    const singleImageBtn = document.createElement('button')
    singleImageBtn.id = 'scroll-mode'
    singleImageBtn.className = 'btn btn-primary'
    singleImageBtn.innerHTML = `
        <i class="fa fa-scroll"></i>
        <span class="text">滚动浏览</span>
    `

    singleImageBtn.addEventListener('click', () => {
        const currentUrl = new URL(window.location.href)
        const pathSegments = currentUrl.pathname.split('/')
        const newPath = `${pathSegments[1]}/${pathSegments[2]}/1/`
        window.location.href = `${currentUrl.origin}/${newPath}?single=true`
    })

    favoriteBtn.parentNode?.insertBefore(singleImageBtn, favoriteBtn.nextSibling)
}
