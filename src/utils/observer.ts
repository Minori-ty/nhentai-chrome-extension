import PageIndicator from './indicator'

export default class Observer {
    observer: IntersectionObserver
    indicator: PageIndicator
    total: number
    constructor(indicator: PageIndicator, total: number) {
        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), { threshold: 0 })
        this.indicator = indicator
        this.total = total
    }

    handleIntersect(entries: IntersectionObserverEntry[]) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const map = new Map<string, number>()
                const target = entry.target as HTMLElement
                const dataPage = target.getAttribute('data-page')
                if (!dataPage) {
                    window.log('未找到')
                    return
                }

                if (map.has(dataPage)) {
                    const count = map.get(dataPage)
                    if (count === undefined) {
                        window.log('未找到该值')
                        return
                    }
                    map.set(dataPage, count + 1)
                } else {
                    map.set(dataPage, 1)
                }
                const maxCount = Math.max(...map.values())
                const maxPage = [...map.entries()].find(([_, value]) => value === maxCount)![0]
                this.indicator.updatePageIndicator(`${maxPage} / ${this.total}`)
            }
        })
    }

    addObserve(target: Element) {
        this.observer.observe(target)
    }
}
